/**
 * Copyright 2025 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import packageJson from "../package.json";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import BrowserOperationCapturer from "./capturer/BrowserOperationCapturer";
import { CaptureConfig } from "./CaptureConfig";
import LoggingService from "./logger/LoggingService";
import StandardLogger, { RunningMode } from "./logger/StandardLogger";
import { AndroidDeviceAccessor } from "./device/AndroidDeviceAccessor";
import { IOSDeviceAccessor } from "./device/IOSDeviceAccessor";
import WebDriverClientFactory from "./webdriver/WebDriverClientFactory";
import { Operation } from "./Operation";
import { ServerError } from "./ServerError";
import path from "path";
import { TimestampImpl } from "./Timestamp";
import WebDriverClient from "./webdriver/WebDriverClient";
import { setupWebDriverServer } from "./webdriver/setupWebDriver";
import cors from "cors";
import bodyParser from "body-parser";
import { CapturedItem } from "./capturer/captureScripts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const executablePath = (process as any).pkg?.entrypoint;

export const appRootPath = path.relative(
  process.cwd(),
  path.dirname(executablePath ? process.argv[0] : __dirname)
);

const app = express();

app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "100mb" }));

const server = http.createServer(app);
const io = new Server(server, {
  allowEIO3: true,
});

/**
 * The Socket.IO event that is sent to server from client.
 */
enum ClientToServerSocketIOEvent {
  START_CAPTURE = "start_capture",
  STOP_CAPTURE = "stop_capture",
  TAKE_SCREENSHOT = "take_screenshot",
  BROWSER_BACK = "browser_back",
  BROWSER_FORWARD = "browser_forward",
  SWITCH_CAPTURING_WINDOW = "switch_capturing_window",
  PAUSE_CAPTURE = "pause_capture",
  RESUME_CAPTURE = "resume_capture",
  RUN_OPERATION = "run_operation",
  RUN_OPERATION_AND_SCREEN_TRANSITION = "run_operation_and_screen_transition",
  ENTER_VALUES = "enter_values",
}

/**
 * The Socket.IO event that is sent to client from server.
 */
enum ServerToClientSocketIOEvent {
  CAPTURE_STARTED = "capture_started",
  OPERATION_CAPTURED = "operation_captured",
  MUTATION_CAPTURED = "mutation_captured",
  SCREEN_TRANSITION_CAPTURED = "screen_transition_captured",
  SCREENSHOT_TAKEN = "screenshot_taken",
  BROWSER_HISTORY_CHANGED = "browser_history_changed",
  BROWSER_WINDOWS_CHANGED = "browser_windows_changed",
  ALERT_VISIBLE_CHANGED = "alert_visibility_changed",
  CAPTURE_PAUSED = "capture_paused",
  CAPTURE_RESUMED = "capture_resumed",
  RUN_OPERATION_COMPLETED = "run_operation_completed",
  RUN_OPERATION_FAILED = "run_operation_failed",
  ENTER_VALUES_COMPLETED = "enter_values_completed",
  RUN_OPERATION_AND_SCREEN_TRANSITION_COMPLETED = "run_operation_and_screen_transition_completed",
  RUN_OPERATION_AND_SCREEN_TRANSITION_FAILED = "run_operation_and_screen_transition_failed",
  ERROR_OCCURRED = "error_occurred",
}

LoggingService.initialize(
  new StandardLogger(
    RunningMode.Debug,
    path.join(appRootPath, "logs", "latteart-capture-cl.log")
  )
);

const v1RootPath = "/api/v1";
/**
 * Get connected mobile devices.
 */
app.get(`${v1RootPath}/devices`, (req, res) => {
  LoggingService.info("Detecting devices.");

  (async () => {
    try {
      const devices = [
        ...(await new AndroidDeviceAccessor().getDevices()),
        ...(await new IOSDeviceAccessor().getDevices()),
      ];

      LoggingService.info("Devices detected.");

      res.json(devices);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      LoggingService.error("Detect devices failed.", error);

      const serverError: ServerError = {
        code: "detect_devices_failed",
        message: "Detect devices failed.",
      };

      res.status(500).json(serverError);
    }
  })();
});

let capturer: BrowserOperationCapturer;
let client: WebDriverClient;

/**
 * Get server name.
 */
app.get(`${v1RootPath}/server-name`, (req, res) => {
  LoggingService.info("Get server name.");

  res.json("latteart-capture-cl");
});

app.post(`${v1RootPath}/operation`, async (req, res) => {
  LoggingService.info("operation");
  const capturedItem: Omit<CapturedItem, "eventInfo"> = req.body;

  await capturer.registerCapturedItem(capturedItem);

  res.json("OK");
});

io.on("connection", (socket) => {
  LoggingService.info("Socket connected.");

  /**
   * Start capture.
   */
  socket.on(
    ClientToServerSocketIOEvent.START_CAPTURE,
    async (url: string, config = "{}") => {
      LoggingService.info("Start capture.");

      const captureConfig = new CaptureConfig(JSON.parse(config));

      const { server, error: setupError } =
        await setupWebDriverServer(captureConfig);

      if (setupError) {
        socket.emit(
          ServerToClientSocketIOEvent.ERROR_OCCURRED,
          JSON.stringify(setupError)
        );

        socket.disconnect();
        return;
      }

      try {
        client = await new WebDriverClientFactory().create({
          platformName: captureConfig.platformName,
          browserName: captureConfig.browserName,
          device: captureConfig.device,
          browserBinaryPath: "",
          webDriverServer: server,
          isHeadlessMode: captureConfig.isHeadlessMode,
          captureWindowSize: captureConfig.captureWindowSize,
        });

        capturer = new BrowserOperationCapturer(client, captureConfig, {
          onGetOperation: (operation) => {
            socket.emit(
              ServerToClientSocketIOEvent.OPERATION_CAPTURED,
              JSON.stringify(operation)
            );
          },
          onGetScreenTransition: (screenTransition) => {
            socket.emit(
              ServerToClientSocketIOEvent.SCREEN_TRANSITION_CAPTURED,
              JSON.stringify(screenTransition)
            );
            socket.emit(
              ServerToClientSocketIOEvent.RUN_OPERATION_AND_SCREEN_TRANSITION_COMPLETED
            );
          },
          onGetMutation: (mutations) => {
            socket.emit(
              ServerToClientSocketIOEvent.MUTATION_CAPTURED,
              JSON.stringify(mutations)
            );
          },
          onBrowserClosed: () => {
            capturer.resumeCapturing().catch((e) => {
              LoggingService.debug(e);
            });

            LoggingService.info("Browser closed.");
          },
          onBrowserHistoryChanged: (browserStatus: {
            canGoBack: boolean;
            canGoForward: boolean;
          }) => {
            LoggingService.info("Browser history changed.");
            socket.emit(
              ServerToClientSocketIOEvent.BROWSER_HISTORY_CHANGED,
              JSON.stringify(browserStatus)
            );
          },
          onBrowserWindowsChanged: (
            windows: { windowHandle: string; url: string; title: string }[],
            currentWindowHandle: string,
            currentWindowHostNameChanged: boolean
          ) => {
            LoggingService.info("Browser windows changed.");

            const updateInfo = JSON.stringify({
              windows,
              currentWindowHandle,
              currentWindowHostNameChanged,
              timestamp: new TimestampImpl().epochMilliseconds(),
            });
            LoggingService.debug(updateInfo);
            socket.emit(
              ServerToClientSocketIOEvent.BROWSER_WINDOWS_CHANGED,
              updateInfo
            );
          },
          onAlertVisibilityChanged: (isVisible: boolean) => {
            socket.emit(
              ServerToClientSocketIOEvent.ALERT_VISIBLE_CHANGED,
              JSON.stringify({ isVisible: isVisible })
            );
          },
          onError: (error: Error) => {
            LoggingService.error("Capture failed.", error);

            const serverError: ServerError = {
              code: "capture_failed",
              message: "Capture failed.",
            };

            socket.emit(
              ServerToClientSocketIOEvent.ERROR_OCCURRED,
              JSON.stringify(serverError)
            );
          },
        });

        socket.on(ClientToServerSocketIOEvent.STOP_CAPTURE, async () => {
          capturer.quit();
        });
        socket.on(ClientToServerSocketIOEvent.TAKE_SCREENSHOT, async () => {
          const screenshot = await capturer.getScreenshot();

          socket.emit(ServerToClientSocketIOEvent.SCREENSHOT_TAKEN, screenshot);
        });
        socket.on(ClientToServerSocketIOEvent.BROWSER_BACK, () => {
          capturer.browserBack();
        });
        socket.on(ClientToServerSocketIOEvent.BROWSER_FORWARD, () => {
          capturer.browserForward();
        });
        socket.on(
          ClientToServerSocketIOEvent.SWITCH_CAPTURING_WINDOW,
          async (destWindowHandle: string) => {
            capturer.switchCapturingWindow(JSON.parse(destWindowHandle));
          }
        );
        socket.on(ClientToServerSocketIOEvent.PAUSE_CAPTURE, async () => {
          await capturer.pauseCapturing();

          socket.emit(ServerToClientSocketIOEvent.CAPTURE_PAUSED);
        });
        socket.on(ClientToServerSocketIOEvent.RESUME_CAPTURE, async () => {
          await capturer.resumeCapturing();

          socket.emit(ServerToClientSocketIOEvent.CAPTURE_RESUMED);
        });
        socket.on(
          ClientToServerSocketIOEvent.ENTER_VALUES,
          async (inputValueSets: string) => {
            try {
              await capturer.autofill(JSON.parse(inputValueSets));
              socket.emit(ServerToClientSocketIOEvent.ENTER_VALUES_COMPLETED);
            } catch (e) {
              if (e instanceof Error) {
                LoggingService.error("Autofill failed.", e);
              }
            }
          }
        );

        const runOperation = async (
          operation: string,
          shouldWaitScreenTransition: boolean
        ) => {
          LoggingService.info(
            `Run operation${
              shouldWaitScreenTransition ? " and screen transition" : ""
            }.`
          );
          LoggingService.debug(operation);

          const targetOperation: Pick<
            Operation,
            "input" | "type" | "elementInfo" | "clientSize" | "scrollPosition"
          > = JSON.parse(operation);
          try {
            await capturer.runOperation(targetOperation);
            if (!shouldWaitScreenTransition) {
              socket.emit(ServerToClientSocketIOEvent.RUN_OPERATION_COMPLETED);
            }
          } catch (error) {
            if (!(error instanceof Error)) {
              throw error;
            }

            LoggingService.error(error.message, error);

            const channel = shouldWaitScreenTransition
              ? ServerToClientSocketIOEvent.RUN_OPERATION_AND_SCREEN_TRANSITION_FAILED
              : ServerToClientSocketIOEvent.RUN_OPERATION_FAILED;
            if (error.name === "InvalidOperationError") {
              const serverError: ServerError = {
                code: "invalid_operation",
                message: "Invalid operation.",
              };
              socket.emit(channel, JSON.stringify(serverError));
            }
            if (error.name === "NoSuchElementError") {
              const serverError: ServerError = {
                code: "element_not_found",
                message: "Element not found.",
              };
              socket.emit(channel, JSON.stringify(serverError));
            }
            if (error.name === "ElementNotInteractableError") {
              const serverError: ServerError = {
                code: "element_not_interactable",
                message: "Element not interactable.",
              };
              socket.emit(channel, JSON.stringify(serverError));
            }
          }
        };
        socket.on(
          ClientToServerSocketIOEvent.RUN_OPERATION,
          async (operation: string) => {
            runOperation(operation, false);
          }
        );
        socket.on(
          ClientToServerSocketIOEvent.RUN_OPERATION_AND_SCREEN_TRANSITION,
          async (operation: string) => {
            runOperation(operation, true);
          }
        );

        await capturer.start(url, () => {
          socket.emit(
            ServerToClientSocketIOEvent.CAPTURE_STARTED,
            new TimestampImpl().epochMilliseconds()
          );
        });
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        if (error.name === "InvalidArgumentError") {
          LoggingService.error(`Invalid url.: ${url}`);

          const serverError: ServerError = {
            code: "invalid_url",
            message: "Invalid url.",
          };

          socket.emit(
            ServerToClientSocketIOEvent.ERROR_OCCURRED,
            JSON.stringify(serverError)
          );

          return;
        }

        if (
          error.name === "SessionNotCreatedError" &&
          (error.message.includes(
            "This version of ChromeDriver only supports Chrome version"
          ) ||
            error.message.includes(
              "This version of Microsoft Edge WebDriver only supports Microsoft Edge version"
            ))
        ) {
          LoggingService.error("WebDriver version mismatch.", error);

          const serverError: ServerError = {
            code: "web_driver_version_mismatch",
            message: "WebDriver version mismatch.",
          };

          socket.emit(
            ServerToClientSocketIOEvent.ERROR_OCCURRED,
            JSON.stringify(serverError)
          );

          return;
        }

        if (
          error.name === "WebDriverError" &&
          error.message.includes("net::ERR_CONNECTION_REFUSED")
        ) {
          LoggingService.error(`Connection refused.: ${url}`);

          const serverError: ServerError = {
            code: "connection_refused",
            message: "Connection refused.",
          };

          socket.emit(
            ServerToClientSocketIOEvent.ERROR_OCCURRED,
            JSON.stringify(serverError)
          );

          return;
        }

        // Other errors.
        LoggingService.error("An unknown error has occurred.", error);

        const serverError: ServerError = {
          code: "unknown_error",
          message: "An unknown error has occurred.",
        };

        socket.emit(
          ServerToClientSocketIOEvent.ERROR_OCCURRED,
          JSON.stringify(serverError)
        );
      } finally {
        server.kill();
        socket.disconnect();
      }
    }
  );

  socket.on("disconnect", (reason: string) => {
    capturer?.quit();

    if (reason === "ping timeout") {
      LoggingService.warn("Socket ping timeout.");
    }

    if (reason === "transport close") {
      LoggingService.warn("Socket transport close.");
    }

    if (reason === "transport error") {
      LoggingService.warn("Socket transport error.");
    }

    LoggingService.info("Socket disconnected.");
  });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  const version = [`  ${packageJson.name} ${packageJson.version}`].join("\n");
  LoggingService.info(`Start server.
=======================================

${version}

=======================================`);
  LoggingService.info(`Listening on *:${port}`);
});

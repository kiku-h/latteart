<!--
 Copyright 2022 NTT Corporation.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<template>
  <v-list-tile @click="execute" :disabled="isDisabled">
    <v-list-tile-title>{{ title }}</v-list-tile-title>

    <replay-option-dialog
      :opened="replayOptionDialogOpened"
      @close="replayOptionDialogOpened = false"
      @ok="startReplay"
    />

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :onAccept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="$store.getters.message('replay.done-title')"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />

    <download-link-dialog
      :opened="downloadLinkDialogOpened"
      :title="$store.getters.message('common.confirm')"
      :message="downloadLinkDialogMessage"
      alertMessage=""
      :linkUrl="downloadLinkDialogLinkUrl"
      @close="downloadLinkDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorDialogOpened"
      :message="errorDialogMessage"
      @close="errorDialogOpened = false"
    />
  </v-list-tile>
</template>

<script lang="ts">
import {
  RepositoryContainer,
  RepositoryContainerImpl,
} from "@/lib/eventDispatcher/RepositoryContainer";
import { Operation } from "@/lib/operationHistory/Operation";
import { TestResultSummary } from "@/lib/operationHistory/types";
import ConfirmDialog from "@/vue/pages/common/ConfirmDialog.vue";
import DownloadLinkDialog from "@/vue/pages/common/DownloadLinkDialog.vue";
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "../../../../common/ErrorMessageDialog.vue";
import InformationMessageDialog from "../../../../common/InformationMessageDialog.vue";
import ReplayOptionDialog from "../../../replayOptionDialog/ReplayOptionDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog,
    "replay-option-dialog": ReplayOptionDialog,
    "confirm-dialog": ConfirmDialog,
    "download-link-dialog": DownloadLinkDialog,
  },
})
export default class ReplayHistoryButton extends Vue {
  private replayOptionDialogOpened = false;

  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept() {
    /* Do nothing */
  }

  private downloadLinkDialogOpened = false;
  private downloadLinkDialogMessage = "";
  private downloadLinkDialogLinkUrl = "";

  private errorDialogOpened = false;
  private errorDialogMessage = "";

  private informationMessageDialogOpened = false;
  private informationMessage = "";

  private get isDisabled(): boolean {
    return (
      (this.isCapturing && !this.isReplaying) ||
      this.isResuming ||
      this.operations.length === 0
    );
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  private get isReplayCaptureMode(): boolean {
    return this.$store.state.captureControl.replayOption.replayCaptureMode;
  }

  private get operations(): Operation[] {
    return this.$store.getters["operationHistory/getOperations"]();
  }

  private get title() {
    return this.isReplaying
      ? this.$store.getters.message("app.stop-replay")
      : this.$store.getters.message("app.replay");
  }

  private async execute() {
    if (!this.isReplaying) {
      this.replayOptionDialogOpened = true;
    } else {
      await this.forceQuitReplay();
    }
  }

  private async startReplay() {
    await this.replayOperations();
  }

  private async replayOperations() {
    this.goToHistoryView();

    (async () => {
      try {
        const initialUrl = this.operations[0].url;
        const currentRepositoryInfo = (() => {
          const currentRepository: RepositoryContainer =
            this.$store.state.repositoryContainer;

          return {
            url: currentRepository.serviceUrl,
            isRemote: currentRepository.isRemote,
          };
        })();
        const sourceTestResultId =
          this.$store.state.operationHistory.testResultInfo.id;

        const pauseCapturingIndex = this.operations.findIndex((operation) => {
          return operation.type === "pause_capturing";
        });

        const operations =
          pauseCapturingIndex > 0
            ? this.operations.slice(0, pauseCapturingIndex)
            : this.operations;

        if (this.isReplayCaptureMode) {
          // switch to local
          this.$store.commit(
            "setRepositoryContainer",
            {
              repositoryContainer: new RepositoryContainerImpl({
                url: this.$store.state.localRepositoryServiceUrl,
                isRemote: false,
              }),
            },
            { root: true }
          );

          await this.$store.dispatch("operationHistory/resetHistory");

          await this.$store.dispatch("operationHistory/createTestResult", {
            initialUrl,
            name: `${this.$store.state.captureControl.replayOption.testResultName}`,
            source: sourceTestResultId,
          });
        }

        await this.$store.dispatch("captureControl/startCapture", {
          url: initialUrl,
          config: this.$store.state.operationHistory.config,
          operations,
          callbacks: {
            onChangeNumberOfWindows: () => {
              /* Do nothing */
            },
          },
        });

        if (this.isReplayCaptureMode) {
          // switch to before repository
          this.$store.commit(
            "setRepositoryContainer",
            {
              repositoryContainer: new RepositoryContainerImpl(
                currentRepositoryInfo
              ),
            },
            { root: true }
          );

          if (currentRepositoryInfo.isRemote) {
            const localTestResultId =
              this.$store.state.operationHistory.testResultInfo.id;
            const remoteTestResultId = "";

            this.uploadHistory(
              currentRepositoryInfo.isRemote,
              { localId: localTestResultId, remoteId: remoteTestResultId },
              async (testResultId: string) => {
                await this.$store.dispatch("operationHistory/resume", {
                  testResultId,
                });
              }
            );
          } else {
            this.compareHistory(currentRepositoryInfo.isRemote);
          }
        } else {
          this.informationMessageDialogOpened = true;
          this.informationMessage = this.$store.getters.message(
            `replay.done-run-operations`
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          this.errorDialogMessage = `${error.message}`;
          this.errorDialogOpened = true;
        } else {
          throw error;
        }
      }
    })();
  }

  private forceQuitReplay() {
    this.$store.dispatch("captureControl/endCapture");
  }

  private uploadHistory(
    isRemote: boolean,
    testResult: { localId: string; remoteId?: string },
    postOperation: (testResultId: string) => Promise<void>
  ): void {
    this.confirmDialogTitle = this.$store.getters.message("replay.done-title");
    this.confirmDialogMessage = this.$store.getters.message(
      "remote-access.register-confirm"
    );

    this.confirmDialogAccept = () => {
      this.confirmDialogOpened = false;

      (async () => {
        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message(
            "remote-access.registering-testresults"
          ),
        });

        try {
          const newTestResultId = await this.$store.dispatch(
            "operationHistory/uploadTestResultsToRemote",
            {
              localTestResultId: testResult.localId,
              remoteTestResultId: testResult.remoteId,
            }
          );

          await postOperation(newTestResultId);

          await this.$store.dispatch("operationHistory/deleteLocalTestResult", {
            testResultId: testResult.localId,
          });
        } catch (error) {
          if (error instanceof Error) {
            this.errorDialogMessage = error.message;
            this.errorDialogOpened = true;
          } else {
            throw error;
          }
        } finally {
          this.$store.dispatch("closeProgressDialog");
        }

        this.compareHistory(isRemote);
      })();
    };

    this.confirmDialogOpened = true;
  }

  private compareHistory(isRemote: boolean): void {
    this.confirmDialogTitle = isRemote
      ? this.$store.getters.message("history-view.compare-test-result-title")
      : this.$store.getters.message("replay.done-title");
    this.confirmDialogMessage = isRemote
      ? this.$store.getters.message("history-view.compare-test-result-message")
      : this.$store.getters.message("replay.done-capture-operations");

    this.confirmDialogAccept = async () => {
      this.confirmDialogOpened = false;

      this.$store.dispatch("openProgressDialog", {
        message: this.$store.getters.message(
          "history-view.comparing-test-result"
        ),
      });

      try {
        const testResults: TestResultSummary[] = await this.$store.dispatch(
          "operationHistory/getTestResults"
        );

        if (testResults.length === 0) {
          throw new Error(
            this.$store.getters.message(
              "history-view.compare-test-result-not-exist"
            )
          );
        }

        const targetTestResults = this.findTargetTestResults(testResults);

        if (!targetTestResults.sourceId) {
          throw new Error(
            this.$store.getters.message(
              "history-view.compare-test-result-not-exist"
            )
          );
        }

        const comparedInfo: { url: string; isSame: boolean } =
          await this.$store.dispatch("operationHistory/compareTestResult", {
            testResultId1: targetTestResults.destId,
            testResultId2: targetTestResults.sourceId,
          });

        const currentRepositoryUrl =
          this.$store.state.repositoryContainer.serviceUrl;

        this.downloadLinkDialogOpened = true;
        this.downloadLinkDialogMessage = comparedInfo.isSame
          ? this.$store.getters.message(
              "history-view.compare-test-result-is-same"
            )
          : this.$store.getters.message(
              "history-view.compare-test-result-is-different"
            );

        this.downloadLinkDialogLinkUrl = `${currentRepositoryUrl}/${comparedInfo.url}`;
      } catch (error) {
        if (error instanceof Error) {
          this.errorDialogMessage = error.message;
          this.errorDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.$store.dispatch("closeProgressDialog");
      }
    };

    this.confirmDialogOpened = true;
  }

  private findTargetTestResults(testResults: TestResultSummary[]) {
    const destTestResultId =
      this.$store.state.operationHistory.testResultInfo.id;
    const destTestResult = testResults.find((testResult) => {
      return testResult.id === destTestResultId;
    });

    const sourceTestResult = testResults.find((testResult) => {
      return testResult.id === destTestResult?.source;
    });

    return {
      sourceId: sourceTestResult?.id ?? undefined,
      destId: destTestResultId,
    };
  }

  private goToHistoryView() {
    this.$router.push({ path: "history" }).catch((err: Error) => {
      if (err.name !== "NavigationDuplicated") {
        throw err;
      }
    });
  }
}
</script>

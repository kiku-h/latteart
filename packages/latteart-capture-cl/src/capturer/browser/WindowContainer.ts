/**
 * Copyright 2022 NTT Corporation.
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

import WebBrowserWindow from "./window/WebBrowserWindow";

/**
 * The class for holding windows.
 */
export default class WindowContainer {
  private windowHandleToManagedWindow: Map<string, WebBrowserWindow> =
    new Map();
  private _currentWindowHandle = "";
  private createWindows: (
    ...newWindowHandles: string[]
  ) => Promise<WebBrowserWindow[]>;
  private switchWindow: (
    to: WebBrowserWindow,
    from?: WebBrowserWindow
  ) => Promise<void>;

  /**
   * Constructor.
   * @param createWindows Callback function that is called when a new window is created.
   * @param switchWindow Callback function that is called when a window is switched.
   */
  constructor(
    createWindows: (
      ...newWindowHandles: string[]
    ) => Promise<WebBrowserWindow[]>,
    switchWindow: (
      to: WebBrowserWindow,
      from?: WebBrowserWindow
    ) => Promise<void>
  ) {
    this.createWindows = createWindows;
    this.switchWindow = switchWindow;
  }

  /**
   * Current window.
   */
  public get currentWindow(): WebBrowserWindow | undefined {
    return this.windowHandleToManagedWindow.get(this._currentWindowHandle);
  }

  /**
   * Current window handle.
   */
  public get currentWindowHandle(): string {
    return this._currentWindowHandle;
  }

  /**
   * The number of holding windows.
   */
  public get length(): number {
    return this.windowHandleToManagedWindow.size;
  }

  /**
   * Holding window handles.
   */
  public get windowHandles(): string[] {
    return Array.from(this.windowHandleToManagedWindow.keys());
  }

  /**
   * Whether it has the window or not.
   * @param windowHandle Window handle.
   * @returns 'true': It has the window, 'false': It does not have the window.
   */
  public has(windowHandle: string): boolean {
    return this.windowHandleToManagedWindow.has(windowHandle);
  }

  /**
   * Whether holding window handles and specified window handles are the same or not.
   * @param windowHandles Target window handles.
   * @returns 'true': It is the same, 'false': It is not the same.
   */
  public equalsTo(windowHandles: string[]): boolean {
    return this.arrayEquals(this.windowHandles, windowHandles);
  }

  /**
   * Switch current window to specified window by window handle.
   * @param windowHandle Destination window handle.
   */
  public async changeCurrentWindowTo(windowHandle: string): Promise<void> {
    const to = this.windowHandleToManagedWindow.get(windowHandle);

    if (!to || this.currentWindow?.windowHandle === to.windowHandle) {
      return;
    }

    await this.switchWindow(to, this.currentWindow);
    this._currentWindowHandle = to.windowHandle;
  }

  /**
   * Switch current window to specified window by index.
   * @param index Destination window index.
   */
  public changeCurrentWindowByIndexTo(index: number): Promise<void> {
    return this.changeCurrentWindowTo(this.windowHandles[index]);
  }

  /**
   * Create new windows and add to the container.
   * @param newWindowHandles New window handles.
   */
  public async add(...newWindowHandles: string[]): Promise<void> {
    const newWindows = await this.createWindows(...newWindowHandles);

    const isFirstTime = this.windowHandleToManagedWindow.size === 0;

    for (const newWindow of newWindows) {
      this.windowHandleToManagedWindow.set(newWindow.windowHandle, newWindow);

      if (isFirstTime) {
        this._currentWindowHandle = newWindow.windowHandle;
      }
    }
  }

  /**
   * Delete window handles and remove from the container.
   * @param windowHandles Target window handles.
   */
  public async remove(...windowHandles: string[]): Promise<void> {
    for (const windowHandle of windowHandles) {
      if (this.currentWindowHandle !== windowHandle) {
        console.log(`delete: ${windowHandle}`);
        this.windowHandleToManagedWindow.delete(windowHandle);
        continue;
      }

      // If current window will be deleted, shift current window handle and delete it.
      const currentIndex = this.windowHandles.indexOf(this.currentWindowHandle);
      if (currentIndex !== -1) {
        const nextIndex =
          currentIndex === 0 ? currentIndex + 1 : currentIndex - 1;

        await this.changeCurrentWindowByIndexTo(nextIndex);
        this.windowHandleToManagedWindow.delete(windowHandle);
      }
    }
  }

  /**
   * Update the container to be the same as the specified windows.
   * @param windowHandles Window handles.
   */
  public async update(windowHandles: string[]): Promise<void> {
    if (this.equalsTo(windowHandles)) {
      return;
    }

    // Remove.
    const closedWindowHandles = this.windowHandles.filter((windowHandle) => {
      return !windowHandles.includes(windowHandle);
    });
    await this.remove(...closedWindowHandles);

    // Add.
    const newWindowHandles = windowHandles.filter((windowHandle) => {
      return !this.windowHandles.includes(windowHandle);
    });
    await this.add(...newWindowHandles);
  }

  private arrayEquals<T>(lhs: T[], rhs: T[]) {
    if (lhs.length !== rhs.length) {
      return false;
    }
    return !lhs.find((item, index) => {
      return item !== rhs[index];
    });
  }
}

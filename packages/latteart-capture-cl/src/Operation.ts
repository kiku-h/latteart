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

import { TimestampImpl } from "./Timestamp";

export type ScreenElements = {
  iframeIndex?: number;
  elements: ElementInfo[];
};

/**
 * Screen element information.
 */
export interface ElementInfo {
  /**
   * The tag name of the element.
   */
  tagname: string;

  /**
   * The text of the element.
   */
  text?: string;

  /**
   * The value of the element.
   */
  value?: string;

  /**
   * The XPath of the element.
   */
  xpath: string;

  /**
   * Whether the element is checked or not when the element is radio button or checkbox.
   */
  checked?: boolean;

  /**
   * The attributes of the element.
   */
  attributes: { [key: string]: string };

  /**
   * Bounding rectangle.
   */
  boundingRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };

  /**
   * InnerHeight.
   */
  innerHeight: number;

  /**
   * InnerWidth.
   */
  innerWidth: number;

  /**
   * OuterHeight.
   */
  outerHeight: number;

  /**
   * OuterWidth.
   */
  outerWidth: number;

  /**
   * The text of the element without children.
   */
  textWithoutChildren?: string;

  /**
   * Iframe
   */
  iframe?: {
    index: number;
    boundingRect: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    innerHeight: number;
    innerWidth: number;
    outerHeight: number;
    outerWidth: number;
  };
}

/**
 * Operation information.
 */
export class Operation {
  /**
   * The input value of the operation.
   */
  public input = "";

  /**
   * Operation type.
   */
  public type = "";

  /**
   * Scroll position.
   */
  public scrollPosition = { x: 0, y: 0 };

  /**
   * Client size.
   */
  public clientSize = { width: 0, height: 0 };

  /**
   * The screen element that has been operated.
   */
  public elementInfo: ElementInfo | null = null;

  /**
   * The title of the screen that has been operated.
   */
  public title = "";

  /**
   * The URL of the screen that has been operated.
   */
  public url = "";

  /**
   * The screenshot of the operation.
   */
  public imageData = "";

  /**
   * The window handle of the window that has been operated.
   */
  public windowHandle = "";

  /**
   * Timestamp.
   */
  public timestamp: string = new TimestampImpl().epochMilliseconds().toString();

  /**
   * The screen elements in the screen that has been operated.
   */
  public screenElements: ScreenElements[] = [];

  /**
   * The page source of the screen that has been operated.
   */
  public pageSource = "";

  /**
   * Constructor.
   * @param init The information for initlization.
   */
  constructor(init?: Partial<Operation>) {
    Object.assign(this, init);
  }
}

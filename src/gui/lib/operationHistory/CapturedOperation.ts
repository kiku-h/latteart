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

import { ElementInfo } from "./types";

/**
 * Operation information acquired by capture.
 */
export interface CapturedOperation {
  input: string;
  type: string;
  elementInfo: CapturedElementInfo | null;
  title: string;
  url: string;
  imageData: string;
  windowHandle: string;
  timestamp: string;
  screenElements: CapturedElementInfo[];
  pageSource: string;
  inputElements: CapturedElementInfo[];
  keywordTexts: string[];
  scrollPosition?: {
    x: number;
    y: number;
  };
  windowInnerSize?: {
    width: number;
    height: number;
  };
}

export type CapturedElementInfo = ElementInfo & { ownedText: string };

/**
 * Screen transition information acquired by capture.
 */
export interface CapturedScreenTransition {
  type: string;
  title: string;
  url: string;
  imageData: string;
  windowHandle: string;
  timestamp: string;
  pageSource: string;
  screenElements: CapturedElementInfo[];
}

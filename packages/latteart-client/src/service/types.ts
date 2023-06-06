/**
 * Copyright 2023 NTT Corporation.
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

import {
  CapturedOperationForCaptureCl,
  CapturedScreenTransitionForCaptureCl,
  ElementInfoForCaptureCl,
} from "@/gateway/captureCl";

export type TestResultViewOption = {
  node: {
    unit: "title" | "url";
    definitions: {
      name: string;
      conditions: {
        target: "title" | "url" | "keyword";
        method: "contains" | "equals" | "regex";
        value: string;
      }[];
    }[];
  };
};

export type CapturedScreenTransition = Omit<
  CapturedScreenTransitionForCaptureCl,
  "screenElements"
> & {
  screenElements: ElementInfo[];
  video?: Video;
};

export type CapturedOperation = Omit<
  CapturedOperationForCaptureCl,
  "elementInfo" | "screenElements" | "inputElements"
> & {
  elementInfo: ElementInfo | null;
  screenElements: ElementInfo[];
  inputElements: ElementInfo[];
  video?: Video;
};

export type ElementInfo = ElementInfoForCaptureCl;

export type Video = {
  url: string;
  startTimestamp: number;
};

export type Operation = {
  input: string;
  type: string;
  elementInfo: ElementInfo | null;
  title: string;
  url: string;
  imageFileUrl: string;
  timestamp: string;
  inputElements: ElementInfo[];
  windowHandle: string;
  keywordTexts?: (string | { tagname: string; value: string })[];
  scrollPosition?: { x: number; y: number };
  clientSize?: { width: number; height: number };
  isAutomatic: boolean;
  video?: Video;
};

export type RunnableOperation = Pick<
  Operation,
  "type" | "input" | "elementInfo" | "clientSize" | "scrollPosition"
> &
  Partial<Pick<Operation, "timestamp" | "windowHandle">>;

export type TestStep = {
  id: string;
  operation: Operation;
  intention: string | null;
  bugs: string[];
  notices: string[];
};

export type Note = {
  id: string;
  type: string;
  value: string;
  details: string;
  imageFileUrl: string;
  tags: string[];
  timestamp: number;
  video?: Video;
};

export type TestStepNote = {
  note: Note;
  testStep: TestStep;
};

export type CoverageSource = {
  title: string;
  url: string;
  screenElements: ElementInfo[];
};

export type InputElementInfo = {
  title: string;
  url: string;
  inputElements: ElementInfo[];
};

export type CaptureConfig = {
  platformName: "PC" | "Android" | "iOS";
  browser: "Chrome" | "Edge" | "Safari";
  device?: {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  };
  platformVersion?: string;
  waitTimeForStartupReload: number;
  mediaType: "image" | "movie";
};

export type VisualizeConfig = {
  screenDefinition: {
    screenDefType: "title" | "url";
    conditionGroups: {
      isEnabled: boolean;
      screenName: string;
      conditions: {
        isEnabled: boolean;
        definitionType: "url" | "title" | "keyword";
        matchType: "contains" | "equals" | "regex";
        word: string;
      }[];
    }[];
  };
  coverage: {
    include: {
      tags: string[];
    };
  };
};

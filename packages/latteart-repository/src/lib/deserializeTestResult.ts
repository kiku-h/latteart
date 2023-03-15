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

import {
  CoverageSource,
  ElementInfo,
  Note,
  Operation,
  TestResult,
  TestStep,
} from "./types";

// V0 Format
export type TestResultExportDataV0 = {
  name: string;
  sessionId: string;
  startTimeStamp: number;
  endTimeStamp: number;
  initialUrl: string;
  notes: {
    id: string;
    type: string;
    value: string;
    details: string;
    imageFileUrl: string;
    tags: string[];
  }[];
  coverageSources: CoverageSourceExportDataV0[];
  history: { [k: string]: HistoryItemExportDataV0 };
};
type CoverageSourceExportDataV0 = {
  title: string;
  url: string;
  screenElements: ElementInfoExportDataV0[];
};
type HistoryItemExportDataV0 = {
  testStep: {
    timestamp: string;
    imageFileUrl: string;
    windowInfo: { windowHandle: string };
    pageInfo: { title: string; url: string; keywordTexts: string[] };
    operation: OperationExportDataV0;
    inputElements: ElementInfoExportDataV0[];
  };
  intention: string | null;
  bugs: string[];
  notices: string[];
};
type OperationExportDataV0 = {
  input: string;
  type: string;
  elementInfo: ElementInfoExportDataV0 | null;
  isAutomatic?: boolean;
};
type ElementInfoExportDataV0 = {
  tagname: string;
  text: string;
  xpath: string;
  value: string;
  checked: boolean;
  attributes: { [key: string]: string };
};

// V1 Format
export type TestResultExportDataV1 = Omit<TestResultExportDataV0, "history"> & {
  version: number;
  history: { [k: string]: HistoryItemExportDataV1 };
};
type CoverageSourceExportDataV1 = CoverageSourceExportDataV0;
export type HistoryItemExportDataV1 = Pick<
  HistoryItemExportDataV0,
  "testStep"
> & {
  testPurpose: string | null;
  notes: string[];
};
type OperationExportDataV1 = HistoryItemExportDataV1["testStep"]["operation"];
type ElementInfoExportDataV1 = ElementInfoExportDataV0;

// V2 Format
export type TestResultExportDataV2 = Omit<
  TestResultExportDataV1,
  "endTimeStamp" | "coverageSources" | "history"
> & {
  lastUpdateTimeStamp: number;
  testingTime: number;
  coverageSources: CoverageSourceExportDataV2[];
  history: { [k: string]: HistoryItemExportDataV2 };
};
type CoverageSourceExportDataV2 = Omit<
  CoverageSourceExportDataV1,
  "screenElements"
> & {
  screenElements: ElementInfoExportDataV2[];
};
export type HistoryItemExportDataV2 = Omit<
  HistoryItemExportDataV1,
  "testStep"
> & {
  testStep: Omit<
    HistoryItemExportDataV1["testStep"],
    "operation" | "inputElements" | "pageInfo"
  > & {
    operation: OperationExportDataV2;
    inputElements: ElementInfoExportDataV2[];
    pageInfo: {
      title: string;
      url: string;
      keywordTexts: (string | { tagname: string; value: string })[];
    };
  };
};
type OperationExportDataV2 = Omit<OperationExportDataV1, "elementInfo"> & {
  elementInfo: ElementInfoExportDataV2 | null;
  scrollPosition?: { x: number; y: number };
  clientSize?: { width: number; height: number };
};
type ElementInfoExportDataV2 = ElementInfoExportDataV1 & {
  boundingRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  textWithoutChildren?: string;
};

export type DeserializedTestResult = Omit<
  TestResult,
  "testSteps" | "coverageSources"
> & {
  testSteps: DeserializedTestStep[];
  coverageSources: (Pick<CoverageSource, "title" | "url"> & {
    screenElements: DeserializedElementInfo[];
  })[];
};
export type DeserializedTestStep = Pick<TestStep, "id"> & {
  operation: Omit<
    Operation,
    "elementInfo" | "inputElements" | "keywordTexts"
  > & {
    elementInfo: DeserializedElementInfo | null;
    inputElements: DeserializedElementInfo[];
    keywordTexts: (string | { tagname: string; value: string })[];
  };
  testPurpose: Note | null;
  notes: Note[];
};

type DeserializedElementInfo = Pick<ElementInfo, "tagname" | "xpath"> & {
  text: string;
  value: string;
  checked: boolean;
  attributes: {
    [key: string]: string;
  };
};

export const deserializeTestResult = (
  testResultData: string
): DeserializedTestResult => {
  const data = JSON.parse(testResultData);

  const version: number = data.version ?? 0;

  if (version === 1) {
    const v1FormatData = validateV1Format(data);
    return deserializeTestResultV1(v1FormatData);
  }

  if (version === 2) {
    const v2FormatData = validateV2Format(data);
    return deserializeTestResultV2(v2FormatData);
  }

  return deserializeTestResultV0(data);
};

const validateV1Format = (data: any): TestResultExportDataV1 => {
  if (
    Object.values(data.history).every((historyItem: any) => {
      return historyItem.testPurpose !== undefined && historyItem.notes;
    })
  ) {
    return data;
  }

  throw new Error("ImportData is invalid format.");
};

const validateV2Format = (data: any): TestResultExportDataV2 => {
  if (
    Object.values(data.history).every((historyItem: any) => {
      return historyItem.testPurpose !== undefined && historyItem.notes;
    })
  ) {
    return data;
  }

  throw new Error("ImportData is invalid format.");
};

const deserializeTestResultV0 = (formattedData: TestResultExportDataV0) => {
  const entries: [string, HistoryItemExportDataV0][] = Object.entries(
    formattedData.history
  );

  let lastTimestamp: string;
  const testSteps = entries.map(([_, item]) => {
    const testPurpose = (() => {
      const intention = formattedData.notes.find(
        (note) => note.id === item.intention
      );

      return intention ? intention : null;
    })();

    const notes = [...item.notices, ...item.bugs].flatMap((noteId) => {
      const note = formattedData.notes.find((note) => note.id === noteId);

      return note ? [note] : [];
    });

    let epochMilliseconds = Number(item.testStep.timestamp) * 1000;

    if (lastTimestamp === item.testStep.timestamp) {
      epochMilliseconds = epochMilliseconds + 1;
    } else {
      lastTimestamp = item.testStep.timestamp;
    }

    return {
      id: "",
      operation: {
        input: item.testStep.operation.input,
        type: item.testStep.operation.type,
        elementInfo: item.testStep.operation.elementInfo,
        title: item.testStep.pageInfo.title,
        url: item.testStep.pageInfo.url,
        imageFileUrl: item.testStep.imageFileUrl,
        timestamp: epochMilliseconds.toString(),
        windowHandle: item.testStep.windowInfo.windowHandle,
        inputElements: item.testStep.inputElements,
        keywordTexts: item.testStep.pageInfo.keywordTexts,
        isAutomatic: false,
      },
      testPurpose,
      notes,
    };
  });

  const testingTime = calculateTestingTime(
    testSteps,
    formattedData.startTimeStamp
  );

  const testResult = {
    id: formattedData.sessionId,
    name: formattedData.name,
    startTimeStamp: formattedData.startTimeStamp,
    lastUpdateTimeStamp: Number(
      testSteps[testSteps.length - 1].operation.timestamp
    ),
    initialUrl: formattedData.initialUrl,
    testingTime,
    testSteps,
    coverageSources: formattedData.coverageSources,
  };
  return testResult;
};

const deserializeTestResultV1 = (formattedData: TestResultExportDataV1) => {
  const entries: [string, HistoryItemExportDataV1][] = Object.entries(
    formattedData.history
  );
  const testSteps = entries.map(([_, item]) => {
    const testPurpose = (() => {
      const testPurpose = formattedData.notes.find(
        (note) => note.id === item.testPurpose
      );

      return testPurpose ? testPurpose : null;
    })();

    const notes = item.notes.flatMap((noteId) => {
      const note = formattedData.notes.find((note) => note.id === noteId);

      return note ? [note] : [];
    });

    return {
      id: "",
      operation: {
        input: item.testStep.operation.input,
        type: item.testStep.operation.type,
        elementInfo: item.testStep.operation.elementInfo,
        title: item.testStep.pageInfo.title,
        url: item.testStep.pageInfo.url,
        imageFileUrl: item.testStep.imageFileUrl,
        timestamp: item.testStep.timestamp,
        windowHandle: item.testStep.windowInfo.windowHandle,
        inputElements: item.testStep.inputElements,
        keywordTexts: item.testStep.pageInfo.keywordTexts,
        isAutomatic: item.testStep.operation.isAutomatic ?? false,
      },
      testPurpose,
      notes,
    };
  });

  const testingTime = calculateTestingTime(
    testSteps,
    formattedData.startTimeStamp
  );

  const testResult = {
    id: formattedData.sessionId,
    name: formattedData.name,
    startTimeStamp: formattedData.startTimeStamp,
    lastUpdateTimeStamp: Number(
      testSteps[testSteps.length - 1].operation.timestamp
    ),
    initialUrl: formattedData.initialUrl,
    testingTime,
    testSteps,
    coverageSources: formattedData.coverageSources,
  };
  return testResult;
};

const deserializeTestResultV2 = (formattedData: TestResultExportDataV2) => {
  const entries: [string, HistoryItemExportDataV2][] = Object.entries(
    formattedData.history
  );
  const testSteps = entries.map(([_, item]) => {
    const testPurpose = (() => {
      const testPurpose = formattedData.notes.find(
        (note) => note.id === item.testPurpose
      );

      return testPurpose ? testPurpose : null;
    })();

    const notes = item.notes.flatMap((noteId) => {
      const note = formattedData.notes.find((note) => note.id === noteId);

      return note ? [note] : [];
    });

    return {
      id: "",
      operation: {
        input: item.testStep.operation.input,
        type: item.testStep.operation.type,
        elementInfo: item.testStep.operation.elementInfo,
        title: item.testStep.pageInfo.title,
        url: item.testStep.pageInfo.url,
        imageFileUrl: item.testStep.imageFileUrl,
        timestamp: item.testStep.timestamp,
        windowHandle: item.testStep.windowInfo.windowHandle,
        inputElements: item.testStep.inputElements,
        keywordTexts: item.testStep.pageInfo.keywordTexts,
        isAutomatic: item.testStep.operation.isAutomatic ?? false,
        scrollPosition: item.testStep.operation.scrollPosition,
        clientSize: item.testStep.operation.clientSize,
      },
      testPurpose,
      notes,
    };
  });

  const testResult = {
    id: formattedData.sessionId,
    name: formattedData.name,
    startTimeStamp: formattedData.startTimeStamp,
    lastUpdateTimeStamp: formattedData.lastUpdateTimeStamp,
    initialUrl: formattedData.initialUrl,
    testingTime: formattedData.testingTime,
    testSteps,
    coverageSources: formattedData.coverageSources,
  };
  return testResult;
};

const calculateTestingTime = (
  testSteps: DeserializedTestStep[],
  startTimeStamp: number
): number => {
  const lastTestStartTime =
    Number(
      testSteps.find((testStep) => {
        return Number(testStep.operation.timestamp) > startTimeStamp;
      })?.operation.timestamp
    ) ?? startTimeStamp;

  const lastTestingTime = (() => {
    const lastOperationTimestamp =
      Number(
        testSteps
          .slice()
          .reverse()
          .find((testStep) => {
            return testStep.operation.timestamp;
          })?.operation.timestamp
      ) ?? lastTestStartTime;

    return lastOperationTimestamp - lastTestStartTime;
  })();

  const otherTestingTime = (() => {
    const otherTestStep = testSteps.filter((testStep) => {
      return Number(testStep.operation.timestamp) < lastTestStartTime;
    });
    if (otherTestStep.length > 0) {
      const otherStartTime = Number(otherTestStep[0].operation.timestamp);
      const otherEndTime = Number(
        otherTestStep[otherTestStep.length - 1].operation.timestamp
      );
      return otherEndTime - otherStartTime;
    } else {
      return 0;
    }
  })();

  return lastTestingTime + otherTestingTime;
};

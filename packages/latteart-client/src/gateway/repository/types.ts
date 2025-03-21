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

import { ScreenElements, VideoFrame } from "../../service";

export type TestResultViewOptionForRepository = {
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

export type SequenceViewForRepository = {
  windows: { id: string; name: string }[];
  screens: { id: string; name: string }[];
  scenarios: {
    testPurpose?: { id: string; value: string; details?: string };
    nodes: SequenceViewNodeForRepository[];
  }[];
};

export type SequenceViewNodeForRepository = {
  windowId: string;
  screenId: string;
  testSteps: {
    id: string;
    type: string;
    input?: string;
    element?: { xpath: string; tagname: string; text: string };
    notes?: { id: string; value: string; details?: string; tags: string[] }[];
  }[];
  disabled?: boolean;
};

export type GraphViewForRepository = {
  nodes: GraphViewNodeForRepository[];
  store: {
    windows: { id: string; name: string }[];
    screens: { id: string; name: string; elementIds: string[] }[];
    elements: {
      id: string;
      pageUrl: string;
      pageTitle: string;
      xpath: string;
      tagname: string;
      text: string;
      attributes: { [key: string]: string };
    }[];
    testPurposes: { id: string; value: string; details: string }[];
    notes: {
      id: string;
      value: string;
      details: string;
      tags?: string[];
      imageFileUrl?: string;
      timestamp: number;
      videoFrame?: VideoFrame;
    }[];
    radioGroups: { name: string; checkedRadioButtonXPath: string }[];
  };
};

export type GraphViewNodeForRepository = {
  windowId: string;
  screenId: string;
  testSteps: {
    id: string;
    type: string;
    input?: string;
    targetElementId?: string;
    noteIds: string[];
    testPurposeId?: string;
    pageUrl: string;
    pageTitle: string;
    imageFileUrl?: string;
    timestamp: number;
    videoFrame?: VideoFrame;
    testResultId: string;
  }[];
  defaultValues: { elementId: string; value: string }[];
};

export type NoteForRepository = {
  id: string;
  type: string;
  value: string;
  details: string;
  imageFileUrl: string;
  tags: string[];
  timestamp: number;
  videoFrame?: VideoFrame;
  testResultId: string;
};

type TestPurposeForRepository = {
  id: string;
  type: string;
  value: string;
  details: string;
  notes: NoteForRepository[];
  testResultId: string;
};

export type CommentForRepository = {
  id: string;
  value: string;
  timestamp: number;
};

export type TestHintPropForRepository = {
  id: string;
  name: string;
  type: "string" | "list";
  listItems?: { key: string; value: string }[];
};

export type TestHintForRepository = {
  id: string;
  value: string;
  testMatrixName: string;
  groupName: string;
  testTargetName: string;
  viewPointName: string;
  customs: { propId: string; value: string | string[] }[];
  commentWords: string[];
  operationElements: { tagname: string; type: string; text: string }[];
  issues: string[];
};

export type CapturedOperationForRepository = {
  input: string;
  type: string;
  elementInfo: ElementInfoForRepository | null;
  title: string;
  url: string;
  imageData: string;
  windowHandle: string;
  timestamp: string;
  screenElements: ScreenElements[];
  pageSource: string;
  scrollPosition: { x: number; y: number };
  clientSize: { width: number; height: number };
  isAutomatic?: boolean;
  videoId?: string;
  videoTime?: number;
};

export type TestStepForRepository = {
  id: string;
  operation: OperationForRepository;
  intention: string | null;
  bugs: string[];
  notices: string[];
};

export type OperationForRepository = {
  input: string;
  type: string;
  elementInfo: ElementInfoForRepository | null;
  inputElements: ElementInfoForRepository[];
  title: string;
  url: string;
  imageFileUrl: string;
  timestamp: string;
  windowHandle: string;
  keywordTexts?: (string | { tagname: string; value: string })[];
  scrollPosition?: { x: number; y: number };
  clientSize?: { width: number; height: number };
  isAutomatic: boolean;
  videoFrame?: VideoFrame;
};

export type ElementInfoForRepository = {
  tagname: string;
  text?: string;
  xpath: string;
  value?: string;
  checked?: boolean;
  attributes: { [key: string]: string };
  boundingRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  innerHeight?: number;
  innerWidth?: number;
  outerHeight?: number;
  outerWidth?: number;
  textWithoutChildren?: string;
};

export type CoverageSourceForRepository = {
  title: string;
  url: string;
  screenElements: ElementInfoForRepository[];
};

export type SettingsForRepository = {
  viewPointsPreset: {
    id: string;
    name: string;
    viewPoints: {
      id: string;
      name: string;
      description: string;
      index: number;
    }[];
  }[];
  defaultTagList: string[];
  config: {
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
    coverage: { include: { tags: string[] } };
    testResultComparison: {
      excludeItems: {
        isEnabled: boolean;
        values: ("title" | "url" | "elementTexts" | "screenshot")[];
      };
      excludeElements: {
        isEnabled: boolean;
        values: { tagname: string }[];
      };
    };
    experimentalFeatureSetting: { captureArch: "polling" | "push" };
  };
};

export type DailyTestProgressForRepository = {
  date: string;
  storyProgresses: {
    storyId: string;
    testMatrixId: string;
    testTargetGroupId: string;
    testTargetId: string;
    viewPointId: string;
    plannedSessionNumber: number;
    completedSessionNumber: number;
    incompletedSessionNumber: number;
  }[];
};

export type PatchSessionDto = {
  isDone: boolean;
  testItem: string;
  testerName: string;
  memo: string;
  attachedFiles: AttachedFileForRepository[];
  testResultFiles: TestResultFileForRepository[];
};

export type SessionForRepository = {
  index: number;
  name: string;
  id: string;
  isDone: boolean;
  doneDate: string;
  testItem: string;
  testerName: string;
  memo: string;
  attachedFiles: { name: string; fileUrl: string }[];
  testResultFiles: TestResultFileForRepository[];
  testPurposes: TestPurposeForRepository[];
  notes: NoteForRepository[];
};

export type AttachedFileForRepository = {
  name: string;
  fileUrl?: string;
  fileData?: string;
};

export type TestResultFileForRepository = {
  name: string;
  id: string;
  initialUrl: string;
  testingTime: number;
};

export type StoryForRepository = {
  id: string;
  index: number;
  testMatrixId: string;
  testTargetId: string;
  viewPointId: string;
  status: string;
  sessions: SessionForRepository[];
};

export type TestMatrixForRepository = {
  id: string;
  name: string;
  index: number;
  groups: GroupForRepository[];
  viewPoints: ViewPointForRepository[];
};

export type GroupForRepository = {
  id: string;
  name: string;
  index: number;
  testTargets: TestTargetForRepository[];
};

export type TestTargetForRepository = {
  id: string;
  name: string;
  plans: PlanForRepository[];
  index: number;
};

export type PlanForRepository = {
  viewPointId: string;
  value: number;
};

export type ViewPointForRepository = {
  id: string;
  name: string;
  description: string;
  index: number;
};

export type TestResultForRepository = {
  id: string;
  name: string;
  startTimeStamp: number;
  lastUpdateTimeStamp: number;
  initialUrl: string;
  testingTime: number;
  testSteps: {
    id: string;
    operation: OperationForRepository;
    intention: NoteForRepository | null;
    bugs: NoteForRepository[];
    notices: NoteForRepository[];
  }[];
  coverageSources: CoverageSourceForRepository[];
  parentTestResultId?: string;
};

export type TestResultSummaryForRepository = Pick<
  TestResultForRepository,
  "id" | "name" | "parentTestResultId" | "initialUrl" | "testingTime"
> & { testPurposes: { value: string }[]; creationTimestamp: number };

export type TestResultComparisonResultForRepository = {
  url: string;
  targetNames: { actual: string; expected: string };
  summary: {
    isOk: boolean;
    steps: {
      sequence: number;
      isOk: boolean;
      items: {
        title?: { isOk: boolean };
        url?: { isOk: boolean };
        elementTexts?: { isOk: boolean };
        screenshot?: { isOk: boolean };
      };
      errors?: PageAssertionErrorForRepository[];
    }[];
  };
};

export type PageAssertionErrorForRepository = "invalid_screenshot";

export type ProjectForRepository = {
  id: string;
  name: string;
  testMatrices: TestMatrixForRepository[];
  stories: StoryForRepository[];
};

export type SnapshotConfigForRepository = { locale: string };

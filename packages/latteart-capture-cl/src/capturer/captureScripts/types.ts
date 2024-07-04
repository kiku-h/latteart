/**
 * Copyright 2024 NTT Corporation.
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

/**
 * Captured item.
 */
export type CapturedItem = {
  operation: {
    input: string;
    type: string;
    elementInfo: CapturedElementInfo;
    title: string;
    url: string;
    scrollPosition: { x: number; y: number };
    timestamp: number;
  };
  iframe?: Iframe;
};

/**
 * Suspended Captured item.
 */
export type SuspendedCapturedItem = CapturedItem & {
  /**
   * The event that is suspended.
   */
  suspendedEvent: { refireType: string; eventInfo: EventInfo };
};

/**
 * Event information.
 */
export type EventInfo = {
  /**
   * Event ID.
   */
  id: string;

  /**
   * The XPath of the screen element that has been operated.
   */
  targetXPath: string;

  /**
   * Event Type.
   */
  type: string;

  /**
   * Option.
   */
  option: {
    /**
     * Whether it bubbles or not.
     */
    bubbles: boolean;

    /**
     * Whether it is cancelable or not.
     */
    cancelable: boolean;
  };
};

/**
 * Bounding rect.
 */
export type BoundingRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/**
 * Iframe information.
 */
export type Iframe = {
  index: number;
  boundingRect: BoundingRect;
  innerHeight: number;
  innerWidth: number;
  outerHeight: number;
  outerWidth: number;
};

export type CaptureScripts = {
  /**
   * Pause capturing.
   */
  pauseCapturing: () => void;
  /**
   * Resume capturing.
   */
  resumeCapturing: () => void;
  /**
   * Whether capturing is paused or not.
   * @returns 'true': Capturing is paused, 'false': Capturing is not paused.
   */
  capturingIsPaused: () => boolean;
  attachShield: ({ shieldId }: { shieldId: string }) => void;
  deleteCapturedItems: () => void;
  initGuard: ({
    shieldStyle,
  }: {
    shieldStyle: {
      position: string;
      zIndex: string;
      width: string;
      height: string;
      opacity: string;
      backgroundColor: string;
    };
  }) => boolean;
  setFunctionToDetectWindowSwitch: ({
    windowHandle,
    shieldStyle,
  }: {
    windowHandle: string;
    shieldStyle: {
      position: string;
      zIndex: string;
      width: string;
      height: string;
      opacity: string;
      backgroundColor: string;
    };
  }) => void;
  refireEvent: (eventInfo: EventInfo) => void;
  detachShield: ({ shieldId }: { shieldId: string }) => void;
  getBrowsingWindowHandle: () => string;
  markElement: ({
    rect,
    index,
    prefix,
  }: {
    rect: BoundingRect;
    index: number;
    prefix: string;
  }) => void;
  unmarkElements: ({
    rects,
    prefix,
  }: {
    rects: BoundingRect[];
    prefix: string;
  }) => void;
  putNumberToRect: ({
    index,
    prefix,
  }: {
    index: number;
    prefix: string;
  }) => void;
  isCurrentScreenObserved: () => boolean;
  observeCurrentScreen: () => void;
  focusWindow: (windowHandle: string) => void;
  collectScreenElements: () => CapturedElementInfo[];
  captureData: ({
    captureArch,
    shieldId,
    iframe,
  }: {
    captureArch: "polling" | "push";
    shieldId: string;
    iframe?: Iframe;
  }) => {
    capturedItems: SuspendedCapturedItem[];
    screenElements: { iframeIndex?: number; elements: CapturedElementInfo[] };
    mutatedItems: {
      timestamp: number;
      elementMutations: ElementMutation[];
      scrollPosition: { x: number; y: number };
    }[];
  };
};

export type CapturedElementInfo = {
  tagname: string;
  text?: string;
  value?: string;
  xpath: string;
  checked?: boolean;
  attributes: { [key: string]: string };
  boundingRect: BoundingRect;
  outerHeight: number;
  outerWidth: number;
  innerHeight: number;
  innerWidth: number;
  textWithoutChildren?: string;
};

type ElementInfo = {
  tagname: string;
  text?: string;
  value?: string;
  xpath: string;
  checked?: boolean;
  attributes: { [key: string]: string };
  outerHTML: string;
};

type ElementLocator = {
  xpath: string;
  iframe?: number;
};

export type ScreenMutation = {
  elementMutations: ElementMutation[];
  title: string;
  url: string;
  timestamp: number;
  imageData: string;
  windowHandle: string;
  scrollPosition: { x: number; y: number };
  clientSize: { width: number; height: number };
};

export type ElementMutation =
  | ChildElementAddition
  | TextContentAddition
  | AttributeAddition
  | ChildElementRemoval
  | TextContentRemoval
  | AttributeRemoval
  | TextContentChange
  | AttributeChange;

export type ChildElementAddition = {
  type: "childElementAddition";
  targetElement: ElementLocator;
  addedChildElement: ElementInfo;
};

export type TextContentAddition = {
  type: "textContentAddition";
  targetElement: ElementLocator;
  addedTextContent: string;
};

export type ChildElementRemoval = {
  type: "childElementRemoval";
  targetElement: ElementLocator;
  removedChildElement: ElementLocator;
};

export type TextContentRemoval = {
  type: "textContentRemoval";
  targetElement: ElementLocator;
  removedTextContent: string;
};

export type TextContentChange = {
  type: "textContentChange";
  targetElement: ElementLocator;
  oldValue: string;
};

export type AttributeAddition = {
  type: "attributeAddition";
  targetElement: ElementLocator;
  attributeName: string;
  newValue: string;
};

export type AttributeRemoval = {
  type: "attributeRemoval";
  targetElement: ElementLocator;
  attributeName: string;
  oldValue: string;
};

export type AttributeChange = {
  type: "attributeChange";
  targetElement: ElementLocator;
  attributeName: string;
  newValue: string;
  oldValue: string;
};

export type ExtendedDocument = Document & {
  __sendDatas?: SuspendedCapturedItem[];
  __sendMutatedDatas?: {
    timestamp: number;
    elementMutations: ElementMutation[];
    scrollPosition: { x: number; y: number };
  }[];
  __latteartEventIdToEvent?: Map<string, Event>;
  __capturingIsPaused?: boolean;
  __protected?: boolean;
  __completedInjectFunction?: boolean;
  __parentUrl?: string;
  __parentTitle?: string;
  handleCapturedEvent?: (e: Event) => void;
  extractElements?: (
    parent: Element,
    path: string
  ) => {
    elements: CapturedElementInfo[];
    targetXPath: string;
  };
  getAttributesFromElement?: (elem: HTMLElement) => {
    [key: string]: string;
  };
  collectVisibleElements?: (
    allElements: HTMLInputElement[]
  ) => HTMLInputElement[];
  enqueueEventForReFire?: (id: string, event: Event) => void;
  buildOperationInfo?: (
    element: HTMLInputElement,
    xpath: string,
    eventType: string,
    window: Window
  ) => CapturedItem["operation"] | null;
};

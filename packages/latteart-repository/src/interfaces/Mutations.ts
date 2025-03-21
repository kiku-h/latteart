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

import { ElementInfo } from "@/domain/types";

export type CreateMutationDto = {
  elementMutations: ElementMutation[];
  url: string;
  title: string;
  timestamp: number;
  imageData: string;
  windowHandle: string;
  scrollPosition: { x: number; y: number };
  clientSize: { width: number; height: number };
};

export type CreateMutationResponse = {
  id: string;
  elementMutations: ElementMutation[];
  url: string;
  title: string;
  timestamp: number;
  fileUrl: string;
  windowHandle: string;
  scrollPosition: { x: number; y: number };
  clientSize: { width: number; height: number };
};

type ElementMutation =
  | ChildElementAddition
  | TextContentAddition
  | AttributeAddition
  | ChildElementRemoval
  | TextContentRemoval
  | AttributeRemoval
  | TextContentChange
  | AttributeChange;

type ChildElementAddition = {
  type: "childElementAddition";
  targetElement: ElementInfo;
  addedChildElement: ElementInfo;
};

type TextContentAddition = {
  type: "textContentAddition";
  targetElement: ElementInfo;
  addedTextContent: string;
};

type ChildElementRemoval = {
  type: "childElementRemoval";
  targetElement: ElementInfo;
  removedChildElement: ElementInfo;
};

type TextContentRemoval = {
  type: "textContentRemoval";
  targetElement: ElementInfo;
  removedTextContent: string;
};

type TextContentChange = {
  type: "textContentChange";
  targetElement: ElementInfo;
  oldValue: string;
};

type AttributeAddition = {
  type: "attributeAddition";
  targetElement: ElementInfo;
  attributeName: string;
  newValue: string;
};

type AttributeRemoval = {
  type: "attributeRemoval";
  targetElement: ElementInfo;
  attributeName: string;
  oldValue: string;
};

type AttributeChange = {
  type: "attributeChange";
  targetElement: ElementInfo;
  attributeName: string;
  newValue: string;
  oldValue: string;
};

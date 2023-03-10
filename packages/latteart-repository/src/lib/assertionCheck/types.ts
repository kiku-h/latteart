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

export type PageAssertionCheckOption = {
  excludeTargetNames?: (keyof PageState)[];
  excludeTagNames?: string[];
};

export type PageAssertionCheckResult = {
  isEqual: boolean;
  diffs: {
    title?: { actual: string; expected: string };
    url?: { actual: string; expected: string };
    elements?: { actual: PageStateElement[]; expected: PageStateElement[] };
    screenshot?: {
      actual?: { data: Buffer };
      expected?: { data: Buffer };
      diff?: { data: Buffer };
    };
  };
};

export type PageAssertion = { expected: PageState; actual: PageState };

export type PageState = {
  title: string;
  url: string;
  elements: PageStateElement[];
  screenshot?: { data: Buffer };
};

type PageStateElement = { tagname: string; textWithoutChildren?: string };

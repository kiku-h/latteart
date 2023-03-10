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

import Pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import {
  PageAssertion,
  PageAssertionCheckResult,
  PageAssertionCheckOption,
  PageState,
} from "./types";

export function checkPageAssertion(
  { actual, expected }: PageAssertion,
  option: PageAssertionCheckOption = {}
): PageAssertionCheckResult {
  const diffs = {
    title: option?.excludeTargetNames?.includes("title")
      ? undefined
      : compareTexts(actual.title, expected.title),
    url: option?.excludeTargetNames?.includes("url")
      ? undefined
      : compareTexts(actual.url, expected.url),
    elements: option?.excludeTargetNames?.includes("elements")
      ? undefined
      : compareElements(actual.elements, expected.elements, option),
    screenshot: option?.excludeTargetNames?.includes("screenshot")
      ? undefined
      : compareScreenshots(actual.screenshot, expected.screenshot),
  };

  return {
    isEqual: Object.values(diffs).every((diff) => !diff),
    diffs,
  };
}

function compareTexts<T>(actual: T, expected: T) {
  return `${actual}` === `${expected}` ? undefined : { actual, expected };
}

function compareElements(
  actual: PageState["elements"],
  expected: PageState["elements"],
  option?: PageAssertionCheckOption
) {
  const excludeTags = (elements: PageState["elements"]) => {
    return elements.filter((element) => {
      return !(option?.excludeTagNames ?? [])
        .map((tag) => tag.toLowerCase())
        .includes(element.tagname.toLowerCase());
    });
  };

  return JSON.stringify(excludeTags(actual)) ===
    JSON.stringify(excludeTags(expected))
    ? undefined
    : { actual, expected };
}

function compareScreenshots(
  actual: PageState["screenshot"],
  expected: PageState["screenshot"]
) {
  if (!actual && !expected) {
    return undefined;
  }

  if (!actual || !expected) {
    return { actual, expected };
  }

  const diffImageData = extractImageDiff(actual.data, expected.data);

  return actual.data.equals(expected.data)
    ? undefined
    : { actual, expected, diff: { data: diffImageData } };
}

function extractImageDiff(actual: Buffer, expected: Buffer): Buffer {
  const actualImage = PNG.sync.read(actual);
  const expectedImage = PNG.sync.read(expected);

  const { width, height } = actualImage;
  const diffImage = new PNG({ width, height });

  try {
    Pixelmatch(
      actualImage.data,
      expectedImage.data,
      diffImage.data,
      width,
      height,
      { threshold: 0 }
    );
  } catch (error) {
    console.error(error);
  }

  return PNG.sync.write(diffImage);
}

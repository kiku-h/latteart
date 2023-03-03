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

import { SequenceView, TestResult, TestResultViewOption } from "@/lib/types";

/**
 * Test result data for new registration.
 */
export interface CreateTestResultDto {
  initialUrl?: string;
  name?: string;
  startTimeStamp?: number;
}

/**
 * Test result list record.
 */
export interface ListTestResultResponse {
  id: string;
  name: string;
}

/**
 * Registered test result data.
 */
export interface CreateTestResultResponse {
  id: string;
  name: string;
}

/**
 * Test result data for the specified ID.
 */
export type GetTestResultResponse = TestResult;

/**
 * Updated test result data.
 */
export type PatchTestResultResponse = TestResult;

/**
 * Sequence view generation option.
 */
export type GetSequenceViewDto = TestResultViewOption;

/**
 * Generated sequence view.
 */
export type GetSequenceViewResponse = SequenceView;

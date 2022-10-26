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
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

const COMPARE_TEST_RESULT_FAILED_MESSAGE_KEY =
  "error.operation_history.compare_test_result_failed";

export class CompareTestResultAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testResultRepository"
    >
  ) {}

  public async compareTestResult(
    testResultId1: string,
    testResultId2: string,
    excludeQuery?: string,
    excludeTags?: string
  ): Promise<
    ActionResult<{
      url: string;
      diffCount: number;
      diffs: {
        [key: string]: {
          a: string | undefined;
          b: string | undefined;
        };
      }[];
      hasInvalidScreenshots: boolean;
    }>
  > {
    const result = await this.repositoryContainer.testResultRepository.postDiff(
      testResultId1,
      testResultId2,
      excludeQuery,
      excludeTags
    );

    if (result.isFailure()) {
      return new ActionFailure({
        messageKey: COMPARE_TEST_RESULT_FAILED_MESSAGE_KEY,
      });
    }

    const { url, diffCount, diffs, hasInvalidScreenshots } = result.data;

    return new ActionSuccess({
      url,
      diffCount,
      diffs,
      hasInvalidScreenshots,
    });
  }
}

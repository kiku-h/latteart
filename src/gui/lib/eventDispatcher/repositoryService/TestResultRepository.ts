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

import { RESTClient } from "../RESTClient";
import {
  RepositoryAccessResult,
  RepositoryAccessSuccess,
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "@/lib/captureControl/Reply";
import { TestResult, TestResultSummary } from "@/lib/operationHistory/types";

export class TestResultRepository {
  constructor(private restClient: RESTClient) {}

  /**
   * Delete test result.
   * @param testResultId  Test result id.
   */
  public async deleteTestResult(
    testResultId: string
  ): Promise<RepositoryAccessResult<void>> {
    try {
      const response = await this.restClient.httpDelete(
        `/test-results/${testResultId}`
      );

      if (response.status !== 204) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as void,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Creates export data with the specified test results.
   * @param testResultId  Test result ID.
   * @param shouldSaveTemporary Whether to save temporary.
   * @returns Test script URL.
   */
  public async postTestResultForExport(
    testResultId: string,
    shouldSaveTemporary: boolean
  ): Promise<RepositoryAccessResult<{ url: string }>> {
    try {
      const response = await this.restClient.httpPost(
        `/test-results/${testResultId}/export`,
        { temp: shouldSaveTemporary }
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as { url: string },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Create an empty test result.
   * @param name  Test result name.
   * @returns  Created test result information.
   */
  public async postEmptyTestResult(
    initialUrl?: string,
    name?: string,
    source?: string
  ): Promise<RepositoryAccessResult<Pick<TestResult, "id" | "name">>> {
    try {
      const url = `/test-results`;
      const response = await this.restClient.httpPost(url, {
        initialUrl,
        name,
        source,
      });

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as { id: string; name: string },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Get a list of test results.
   * @returns List of test results.
   */
  public async getTestResults(): Promise<
    RepositoryAccessResult<Array<TestResultSummary>>
  > {
    try {
      const response = await this.restClient.httpGet(`/test-results`);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as Array<{
          id: string;
          name: string;
          source?: string;
        }>,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Get the test result of the specified test result ID.
   * @param testResultId  Test result ID.
   */
  public async getTestResult(
    testResultId: string
  ): Promise<RepositoryAccessResult<TestResult>> {
    try {
      const response = await this.restClient.httpGet(
        `/test-results/${testResultId}`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as TestResult,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async patchTestResult(
    testResultId: string,
    name?: string,
    startTime?: number,
    initialUrl?: string
  ): Promise<RepositoryAccessResult<TestResult>> {
    try {
      const response = await this.restClient.httpPatch(
        `/test-results/${testResultId}`,
        { name, startTime, initialUrl }
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as TestResult,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Compare test result.
   * @param testResultId_1  Test result id.
   * @param testResultId_2  Test result id.
   */
  public async postDiff(
    testResultId1: string,
    testResultId2: string
  ): Promise<
    RepositoryAccessResult<{
      diffs: {
        [key: string]: {
          a: string | undefined;
          b: string | undefined;
        };
      }[];
      isSame: boolean;
      url: string;
    }>
  > {
    try {
      const response = await this.restClient.httpPost(
        `/test-results/${testResultId1}/diffs`,
        {
          targetTestResultId: testResultId2,
          excludeQuery: "windowHandle",
        }
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as {
          diffs: {
            [key: string]: {
              a: string | undefined;
              b: string | undefined;
            };
          }[];
          isSame: boolean;
          url: string;
        },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}

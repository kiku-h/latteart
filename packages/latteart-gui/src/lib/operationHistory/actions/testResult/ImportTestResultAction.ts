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

import { type ActionResult, ActionFailure, ActionSuccess } from "@/lib/common/ActionResult";
import { type RepositoryService } from "latteart-client";

const IMPORT_TEST_RESULT_FAILED_MESSAGE_KEY = "error.operation_history.import_test_result_failed";

export class ImportTestResultAction {
  constructor(private repositoryService: Pick<RepositoryService, "importTestResultRepository">) {}

  public async import(
    source: { testResultFile: { data: string; name: string } },
    dest?: { testResultId?: string }
  ): Promise<ActionResult<{ testResultId: string }>> {
    const postTestResultResult =
      await this.repositoryService.importTestResultRepository.postTestResult(source, dest);

    if (postTestResultResult.isFailure()) {
      return new ActionFailure({
        messageKey: IMPORT_TEST_RESULT_FAILED_MESSAGE_KEY
      });
    }

    return new ActionSuccess(postTestResultResult.data);
  }
}

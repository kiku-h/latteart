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

import { CreateProjectExportDto } from "../interfaces/ProjectExport";
import LoggingService from "@/logger/LoggingService";
import { ServerError, ServerErrorData } from "../ServerError";
import { ProjectExportService } from "@/services/ProjectExportService";

import {
  Body,
  Controller,
  Path,
  Post,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { transactionRunner } from "..";
import { ExportServiceImpl } from "@/services/ExportService";
import { TestResultServiceImpl } from "@/services/TestResultService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { ConfigsService } from "@/services/ConfigsService";
import { ExportFileRepositoryServiceImpl } from "@/services/ExportFileRepositoryService";
import { ProjectsServiceImpl } from "@/services/ProjectsService";
import { TestProgressServiceImpl } from "@/services/TestProgressService";
import {
  createExportFileRepository,
  createScreenshotFileRepository,
  createWorkingFileRepository,
} from "@/gateways/fileRepository";

@Route("projects/{projectId}/export")
@Tags("projects")
export class ProjectExportController extends Controller {
  /**
   * Export project and test result information.
   * @param projectId Target project id.
   * @param requestBody Flags to export.
   * @returns Download url for exported project information and test result information.
   */
  @Response<ServerErrorData<"export_project_failed">>(
    500,
    "Export project failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async exportProject(
    @Path() projectId: string,
    @Body() requestBody: CreateProjectExportDto
  ): Promise<{ url: string }> {
    try {
      const timestampService = new TimestampServiceImpl();
      const screenshotFileRepository = createScreenshotFileRepository();
      const exportFileRepository = createExportFileRepository();
      const workingFileRepository = await createWorkingFileRepository();
      const exportFileRepositoryService = new ExportFileRepositoryServiceImpl({
        exportFileRepository,
        screenshotFileRepository,
        workingFileRepository,
        timestamp: timestampService,
      });
      const testResultService = new TestResultServiceImpl({
        timestamp: timestampService,
        testStep: new TestStepServiceImpl({
          screenshotFileRepository,
          timestamp: timestampService,
          config: new ConfigsService(),
        }),
      });
      const exportService = new ExportServiceImpl({
        testResult: testResultService,
        exportFileRepository: exportFileRepositoryService,
      });

      const testProgressService = new TestProgressServiceImpl(
        transactionRunner
      );

      const projectService = new ProjectsServiceImpl();

      const url = await new ProjectExportService().export(
        projectId,
        requestBody.includeProject,
        requestBody.includeTestResults,
        {
          projectService,
          testResultService,
          exportService,
          exportFileRepositoryService,
          testProgressService,
        }
      );
      return {
        url,
      };
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("Export project failed.", error);
        throw new ServerError(500, {
          code: "export_project_failed",
        });
      }
      throw error;
    }
  }
}

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

import path from "path";
import { deserializeTestResult } from "@/services/helper/testResultImportHelper";
import { getRepository } from "typeorm";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import { NoteEntity } from "@/entities/NoteEntity";
import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { TagEntity } from "@/entities/TagEntity";
import { TimestampService } from "./TimestampService";
import { FileRepository } from "@/interfaces/fileRepository";
import { ImportFileRepository } from "@/interfaces/importFileRepository";
import {
  DeserializedTestResult,
  DeserializedTestStep,
} from "@/interfaces/exportData";

export interface TestResultImportService {
  importTestResult(
    importFile: { data: string; name: string },
    testResultId: string | null
  ): Promise<{ testResultId: string }>;
  saveImportFileDatas(
    ...args: {
      importFileData: {
        testResultFile: {
          fileName: string;
          data: string;
        };
        fileData: {
          filePath: string;
          data: Buffer;
        }[];
      };
      testResultId: string | null;
    }[]
  ): Promise<{ newTestResultId: string; oldTestResultId?: string }[]>;
  saveImportFileData(
    importFileData: {
      testResultFile: {
        fileName: string;
        data: string;
      };
      fileData: {
        filePath: string;
        data: Buffer;
      }[];
    },
    testResultId: string | null
  ): Promise<{ newTestResultId: string; oldTestResultId?: string }>;
}

export class TestResultImportServiceImpl implements TestResultImportService {
  constructor(
    private service: {
      importFileRepository: ImportFileRepository;
      screenshotFileRepository: FileRepository;
      movieFileRepository: FileRepository;
      timestamp: TimestampService;
    }
  ) {}

  public async importTestResult(
    importFile: { data: string; name: string },
    testResultId: string | null
  ): Promise<{ testResultId: string }> {
    console.log(importFile.name);

    const importFileData = await this.readImportFile(importFile.data);

    const { newTestResultId } = await this.saveImportFileData(
      importFileData,
      testResultId
    );

    return {
      testResultId: newTestResultId,
    };
  }

  private async readImportFile(base64FileData: string) {
    const files = await this.service.importFileRepository.read(base64FileData);
    const testResultFile = files.find((file) => file.filePath === "log.json");

    if (!testResultFile || typeof testResultFile.data !== "string") {
      throw Error("Invalid test result file.");
    }

    const fileData = files.filter(
      (file): file is { filePath: string; data: Buffer } => {
        return (
          [".png", ".webp", ".webm"].includes(path.extname(file.filePath)) &&
          typeof file.data !== "string"
        );
      }
    );

    return {
      testResultFile: {
        fileName: testResultFile.filePath,
        data: testResultFile.data,
      },
      fileData,
    };
  }

  public async saveImportFileDatas(
    ...args: {
      importFileData: {
        testResultFile: {
          fileName: string;
          data: string;
        };
        fileData: {
          filePath: string;
          data: Buffer;
        }[];
      };
      testResultId: string | null;
    }[]
  ): Promise<{ newTestResultId: string; oldTestResultId?: string }[]> {
    return Promise.all(
      args.map(({ importFileData, testResultId }) =>
        this.saveImportFileData(importFileData, testResultId)
      )
    );
  }

  public async saveImportFileData(
    importFileData: {
      testResultFile: {
        fileName: string;
        data: string;
      };
      fileData: {
        filePath: string;
        data: Buffer;
      }[];
    },
    testResultId: string | null
  ): Promise<{ newTestResultId: string; oldTestResultId?: string }> {
    const testResult = deserializeTestResult(
      importFileData.testResultFile.data
    );

    const screenshotFilePathToEntity =
      testResult.mediaType === "image"
        ? new Map(
            await Promise.all(
              importFileData.fileData.map<Promise<[string, ScreenshotEntity]>>(
                async (screenshot) => {
                  const screenshotEntity = await getRepository(
                    ScreenshotEntity
                  ).save(new ScreenshotEntity());
                  const substrings = screenshot.filePath.split(".");
                  const fileExt =
                    substrings.length >= 2 ? `.${substrings.pop()}` : "";
                  const fileName = `${screenshotEntity.id}${fileExt}`;
                  await this.service.screenshotFileRepository.outputFile(
                    fileName,
                    screenshot.data
                  );
                  const imageFileUrl =
                    this.service.screenshotFileRepository.getFileUrl(fileName);
                  screenshotEntity.fileUrl = imageFileUrl;

                  return [screenshot.filePath, screenshotEntity];
                }
              )
            )
          )
        : undefined;

    const tagNameToEntity = new Map(
      (await getRepository(TagEntity).find()).map<[string, TagEntity]>(
        (tagEntity) => {
          return [tagEntity.name, tagEntity];
        }
      )
    );

    const newTestResultEntity = await getRepository(TestResultEntity).save(
      this.createTestResultEntity(
        testResult,
        tagNameToEntity,
        screenshotFilePathToEntity
      )
    );

    if (testResult.mediaType === "movie") {
      const fileName = `${newTestResultEntity.id}.webm`;
      await this.service.movieFileRepository.outputFile(
        fileName,
        importFileData.fileData[0].data
      );
    }

    return {
      newTestResultId: newTestResultEntity.id,
      oldTestResultId: testResultId ?? undefined,
    };
  }

  private createTestResultEntity(
    testResult: DeserializedTestResult,
    tagNameToEntity: Map<string, TagEntity>,
    screenshotFilePathToEntity?: Map<string, ScreenshotEntity>
  ) {
    const testStepEntities = testResult.testSteps.map((testStep) => {
      return this.createTestStepEntity(
        testStep,
        tagNameToEntity,
        screenshotFilePathToEntity
      );
    });
    const coverageSourceEntities: CoverageSourceEntity[] =
      testResult.coverageSources.map((coverageSource) => {
        return new CoverageSourceEntity({
          title: coverageSource.title,
          url: coverageSource.url,
          screenElements: JSON.stringify(coverageSource.screenElements),
        });
      });

    const noteEntities = testStepEntities.flatMap(({ notes }) => notes ?? []);

    const testPurposeEntities = testStepEntities.flatMap(({ testPurpose }) =>
      testPurpose ? [testPurpose] : []
    );

    return new TestResultEntity({
      name:
        testResult.name ??
        `session_${this.service.timestamp.format("YYYYMMDD_HHmmss")}`,
      startTimestamp:
        testResult.startTimeStamp ??
        (testResult.initialUrl
          ? this.service.timestamp.epochMilliseconds()
          : 0),
      lastUpdateTimestamp: testResult.lastUpdateTimeStamp,
      initialUrl: testResult.initialUrl ?? "",
      testingTime: testResult.testingTime,
      mediaType: testResult.mediaType,
      movieStartTimestamp: testResult.movieStartTimestamp,
      screenshots: screenshotFilePathToEntity
        ? Array.from(screenshotFilePathToEntity.values())
        : undefined,
      testSteps: testStepEntities,
      coverageSources: coverageSourceEntities,
      notes: noteEntities,
      testPurposes: testPurposeEntities,
    });
  }

  private createTestStepEntity(
    testStep: DeserializedTestStep,
    tagNameToEntity: Map<string, TagEntity>,
    screenshotFilePathToEntity?: Map<string, ScreenshotEntity>
  ) {
    const screenshotEntity = screenshotFilePathToEntity
      ? screenshotFilePathToEntity.get(
          path.basename(testStep.operation.imageFileUrl)
        )
      : undefined;

    const testPurposeEntity = testStep.testPurpose
      ? this.createTestPurposeEntity(testStep.testPurpose)
      : null;

    const noteEntities = testStep.notes.map((note) => {
      const tagEntities = note.tags.map(
        (tagName) =>
          tagNameToEntity.get(tagName) ?? new TagEntity({ name: tagName })
      );
      return this.createNoteEntity(
        note,
        tagEntities,
        screenshotFilePathToEntity
      );
    });
    return new TestStepEntity({
      pageTitle: testStep.operation.title,
      pageUrl: testStep.operation.url,
      operationType: testStep.operation.type,
      operationInput: testStep.operation.input,
      operationElement: JSON.stringify(testStep.operation.elementInfo),
      inputElements: JSON.stringify(testStep.operation.inputElements),
      windowHandle: testStep.operation.windowHandle,
      keywordTexts: JSON.stringify(testStep.operation.keywordTexts ?? []),
      isAutomatic: testStep.operation.isAutomatic,
      timestamp: parseInt(testStep.operation.timestamp, 10),
      screenshot: screenshotEntity,
      testPurpose: testPurposeEntity,
      notes: noteEntities,
    });
  }

  private createNoteEntity(
    note: {
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl: string;
      tags: string[];
      timestamp: number;
    },
    tagEntities: TagEntity[],
    screenshotFilePathToEntity?: Map<string, ScreenshotEntity>
  ) {
    const screenshotEntity = screenshotFilePathToEntity
      ? screenshotFilePathToEntity.get(path.basename(note.imageFileUrl))
      : undefined;

    return new NoteEntity({
      value: note.value,
      details: note.details,
      timestamp: note.timestamp,
      screenshot: screenshotEntity,
      tags: tagEntities,
    });
  }

  private createTestPurposeEntity(testPurpose: {
    id: string;
    type: string;
    value: string;
    details: string;
    imageFileUrl: string;
    tags: string[];
    timestamp: number;
  }) {
    return new TestPurposeEntity({
      title: testPurpose.value,
      details: testPurpose.details,
    });
  }
}

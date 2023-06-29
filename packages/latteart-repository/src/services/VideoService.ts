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

import { TestResultEntity } from "@/entities/TestResultEntity";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { getRepository } from "typeorm";
import path from "path";

export class VideoService {
  public async append(testResultId: string, base64: string): Promise<void> {
    const buf = Uint8Array.from(Buffer.from(base64, "base64"));

    const { videos } = await getRepository(TestResultEntity).findOneOrFail(
      testResultId,
      {
        relations: ["videos"],
      }
    );

    if (!videos || videos.length === 0) {
      throw new Error(`Video not found.`);
    }

    const videoUrl = path.basename(videos[videos.length - 1].fileUrl);

    const fileRepositoryManager = await createFileRepositoryManager();
    const videoFileRepository = fileRepositoryManager.getRepository("video");
    await videoFileRepository.appendFile(videoUrl, buf);
  }
}

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

import path from "path";
import fs from "fs-extra";
import { FileRepository } from "@/interfaces/StaticDirectory";

export class StaticDirectory {
  constructor(private staticRootPath: string) {}

  public async outputFile(
    relativePath: string,
    data: string | Buffer,
    encoding?: "utf8" | "base64"
  ): Promise<void> {
    const decode =
      typeof data === "string" ? Buffer.from(data, encoding) : data;
    await fs.outputFile(path.join(this.staticRootPath, relativePath), decode);
  }

  public async removeFile(relativePath: string): Promise<void> {
    await fs.remove(path.join(this.staticRootPath, relativePath));
  }

  public getFileUrl(relativePath: string): string {
    return `${relativePath.split(path.sep).join("/")}`;
  }

  public getFilePath(relativePath: string): string {
    return path.join(this.staticRootPath, relativePath);
  }

  public async moveFile(
    sourceFilePath: string,
    destRelativePath: string
  ): Promise<void> {
    const destFilePath = path.join(this.staticRootPath, destRelativePath);

    await fs.mkdirp(path.dirname(destFilePath));
    await fs.copyFile(sourceFilePath, destFilePath);
    await fs.remove(sourceFilePath);
  }

  public async copyFile(
    sourceFilePath: string,
    destRelativePath: string
  ): Promise<void> {
    const destFilePath = path.join(this.staticRootPath, destRelativePath);

    await fs.mkdirp(path.dirname(destFilePath));
    await fs.copyFile(sourceFilePath, destFilePath);
  }
}

export class FileRepositoryImpl implements FileRepository {
  constructor(
    private staticDirectory: StaticDirectory,
    private directoryPath: string
  ) {}

  public async outputFile(
    relativePath: string,
    data: string | Buffer,
    encoding?: "utf8" | "base64"
  ): Promise<void> {
    return this.staticDirectory.outputFile(
      path.join(this.directoryPath, relativePath),
      data,
      encoding
    );
  }

  public async removeFile(relativePath: string): Promise<void> {
    return this.staticDirectory.removeFile(
      path.join(this.directoryPath, relativePath)
    );
  }

  public getFileUrl(relativePath: string): string {
    return this.staticDirectory.getFileUrl(
      path.join(this.directoryPath, relativePath)
    );
  }

  public getFilePath(relativePath: string): string {
    return this.staticDirectory.getFilePath(
      path.join(this.directoryPath, relativePath)
    );
  }

  public async moveFile(
    sourceFilePath: string,
    destRelativePath: string
  ): Promise<void> {
    return this.staticDirectory.moveFile(
      sourceFilePath,
      path.join(this.directoryPath, destRelativePath)
    );
  }

  public async copyFile(
    sourceFilePath: string,
    destRelativePath: string
  ): Promise<void> {
    return this.staticDirectory.copyFile(
      sourceFilePath,
      path.join(this.directoryPath, destRelativePath)
    );
  }
}

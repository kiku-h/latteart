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
import os from "os";
import { FileRepository, RepositoryName } from "@/interfaces/fileRepository";
import { publicDirPath } from "@/common";
import FileArchiver from "./FileArchiver";

export class StaticDirectory {
  constructor(private staticDirPath: string) {}

  public async readFile(
    relativePath: string,
    encoding?: "utf8" | "base64" | "binary"
  ): Promise<string | Buffer> {
    return fs.promises.readFile(path.join(this.staticDirPath, relativePath), {
      encoding,
    });
  }

  public async outputFile(
    relativePath: string,
    data: string | Buffer,
    encoding?: "utf8" | "base64"
  ): Promise<void> {
    const decode =
      typeof data === "string" ? Buffer.from(data, encoding) : data;
    await fs.outputFile(path.join(this.staticDirPath, relativePath), decode);
  }

  public async outputJSON<T>(relativePath: string, data: T): Promise<void> {
    await fs.outputJSON(path.join(this.staticDirPath, relativePath), data);
  }

  public async outputZip(
    relativePath: string,
    deleteSource: boolean
  ): Promise<string> {
    const dirPath = path.join(this.staticDirPath, relativePath);
    return new FileArchiver(dirPath, { deleteSource: deleteSource }).zip();
  }

  public async removeFile(relativePath: string): Promise<void> {
    await fs.remove(path.join(this.staticDirPath, relativePath));
  }

  public getFileUrl(relativePath: string): string {
    return `${relativePath.split(path.sep).join("/")}`;
  }

  public getFilePath(relativePath: string): string {
    return path.join(this.staticDirPath, relativePath);
  }

  public async moveFile(
    sourceFilePath: string,
    destRelativePath: string
  ): Promise<void> {
    const destFilePath = path.join(this.staticDirPath, destRelativePath);

    await fs.mkdirp(path.dirname(destFilePath));
    await fs.copyFile(sourceFilePath, destFilePath);
    await fs.remove(sourceFilePath);
  }

  public async copyFile(
    sourceFilePath: string,
    destRelativePath: string
  ): Promise<void> {
    const destFilePath = path.join(this.staticDirPath, destRelativePath);

    console.log(`${sourceFilePath} => ${destFilePath}`);

    await fs.mkdirp(path.dirname(destFilePath));
    await fs.copyFile(sourceFilePath, destFilePath);
  }
}

export async function createFileRepository(name: RepositoryName) {
  const tmpDirPath = await fs.mkdtemp(path.join(os.tmpdir(), "latteart-"));
  const fileRepositories = new Map([
    [
      "screenshot",
      new StaticDirectory(path.join(publicDirPath, "screenshots")),
    ],
    [
      "attachedFile",
      new StaticDirectory(path.join(publicDirPath, "attached-files")),
    ],
    ["snapshot", new StaticDirectory(path.join(publicDirPath, "snapshots"))],
    [
      "testScript",
      new StaticDirectory(path.join(publicDirPath, "test-scripts")),
    ],
    ["export", new StaticDirectory(path.join(publicDirPath, "exports"))],
    ["temp", new StaticDirectory(path.join(publicDirPath, "temp"))],
    ["work", new StaticDirectory(path.join(tmpDirPath, "work"))],
  ]);

  return new MultipleFileRepository(name, fileRepositories);
}

export class MultipleFileRepository implements FileRepository {
  constructor(
    private name: RepositoryName,
    private fileRepositories: Map<string, StaticDirectory>
  ) {}

  public async readFile(
    relativePath: string,
    encoding?: "utf8" | "base64" | "binary"
  ): Promise<string | Buffer> {
    const repository = this.fileRepositories.get(this.name);
    if (!repository) {
      throw new Error("File repository not found.");
    }
    return repository.readFile(relativePath, encoding);
  }

  public async outputFile(
    relativePath: string,
    data: string | Buffer,
    encoding?: "utf8" | "base64"
  ): Promise<void> {
    const repository = this.fileRepositories.get(this.name);
    if (!repository) {
      throw new Error("File repository not found.");
    }
    return repository.outputFile(relativePath, data, encoding);
  }

  public async outputJSON<T>(relativePath: string, data: T): Promise<void> {
    const repository = this.fileRepositories.get(this.name);
    if (!repository) {
      throw new Error("File repository not found.");
    }
    return repository.outputJSON(relativePath, data);
  }

  public async outputZip(
    relativePath: string,
    deleteSource: boolean
  ): Promise<string> {
    const repository = this.fileRepositories.get(this.name);
    if (!repository) {
      throw new Error("File repository not found.");
    }
    return repository.outputZip(relativePath, deleteSource);
  }

  public async removeFile(relativePath: string): Promise<void> {
    const repository = this.fileRepositories.get(this.name);
    if (!repository) {
      throw new Error("File repository not found.");
    }
    return repository.removeFile(relativePath);
  }

  public getFileUrl(relativePath: string): string {
    const repository = this.fileRepositories.get(this.name);
    if (!repository) {
      throw new Error("File repository not found.");
    }
    return repository.getFileUrl(relativePath);
  }

  public getFilePath(relativePath: string): string {
    const repository = this.fileRepositories.get(this.name);
    if (!repository) {
      throw new Error("File repository not found.");
    }
    return repository.getFilePath(relativePath);
  }

  public async moveFile(
    sourceFilePath: string,
    destRelativePath: string
  ): Promise<void> {
    const fileRepository = this.fileRepositories.get(this.name);
    if (!fileRepository) {
      throw new Error("File repository not found.");
    }

    return fileRepository.moveFile(sourceFilePath, destRelativePath);
  }

  public async copyFile(
    sourceFileName: string,
    destRelativePath: string,
    sourceRepositoryName: RepositoryName
  ): Promise<void> {
    const destFileRepository = this.fileRepositories.get(this.name);
    if (!destFileRepository) {
      throw new Error("File repository not found.");
    }

    const sourceFileRepository =
      this.fileRepositories.get(sourceRepositoryName);
    if (!sourceFileRepository) {
      throw new Error("File repository not found.");
    }

    const sourceFilePath = sourceFileRepository.getFilePath(sourceFileName);

    return destFileRepository.copyFile(sourceFilePath, destRelativePath);
  }
}

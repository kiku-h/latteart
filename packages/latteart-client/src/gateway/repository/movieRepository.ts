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

import { RESTClient } from "@/network/http/client";
import {
  createConnectionRefusedFailure,
  createRepositoryAccessFailure,
  createRepositoryAccessSuccess,
  RepositoryAccessResult,
} from "./result";

export interface MovieRepository {
  fetchWebm(videoUrl: string): Promise<RepositoryAccessResult<Blob | null>>;
  appendBuffer(
    testResultId: string,
    buffer: ArrayBuffer
  ): Promise<RepositoryAccessResult<void>>;
}

export class MovieRestRepository implements MovieRepository {
  constructor(private restClient: RESTClient) {}

  public async fetchWebm(
    videoUrl: string
  ): Promise<RepositoryAccessResult<Blob | null>> {
    try {
      const response = await this.restClient.httpGetFile(videoUrl);
      if (response.status === 404) {
        return createRepositoryAccessSuccess({
          data: null as null,
        });
      }
      if (response.status === 200) {
        return createRepositoryAccessSuccess({
          data: response.data as Blob,
        });
      }
      return createRepositoryAccessFailure(response);
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async appendBuffer(
    testResultId: string,
    buffer: ArrayBuffer
  ): Promise<RepositoryAccessResult<void>> {
    try {
      const response = await this.restClient.httpPatch(
        `api/v1/movies/${testResultId}`,
        {
          base64: this.arrayBuffer2Base64(buffer),
        }
      );

      if (response.status !== 204) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as void,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  private arrayBuffer2Base64(arrayBuffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

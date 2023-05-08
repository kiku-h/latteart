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

import { MovieRepository } from "latteart-client";

export class CapturedMovieManager {
  private recorder: MediaRecorder | null;
  private testResultId: string;
  private webm: Blob | null;
  private moveRepository: MovieRepository;
  private chunks: Blob[] = [];
  private setWebmUrlToStoreFunc: (url: string) => void;
  private firstTimeCaptured = false;

  constructor(
    testResultId: string,
    moveRepository: MovieRepository,
    setWebmUrlToStoreFunc: (url: string) => void
  ) {
    this.testResultId = testResultId;
    this.moveRepository = moveRepository;
    this.recorder = null;
    this.webm = null;
    this.setWebmUrlToStoreFunc = setWebmUrlToStoreFunc;
  }

  public async fetchChunksFromRepository(): Promise<void> {
    const res = await this.moveRepository.fetchWebm(this.testResultId);
    if (res.isFailure()) {
      throw new Error("failed fetchWebm");
    }
    if (res.data === null) {
      return;
    }
    this.chunks.push(res.data);
    this.createWebm();
    const url = this.getCaptureMovieUrl();
    this.setWebmUrlToStoreFunc(url);
  }

  public async setMediaRecorder(
    frameRate: number,
    mimeType: string,
    videoBitsPerSecond: number
  ): Promise<void> {
    const stream = await (navigator.mediaDevices as any).getDisplayMedia({
      audio: false,
      video: { frameRate },
    });
    const tracks = [...stream.getTracks()];
    const mediaStream = new MediaStream(tracks);
    const recorder = new MediaRecorder(mediaStream, {
      mimeType,
      videoBitsPerSecond,
    });
    this.recorder = recorder;
  }

  public setOndataavailable(): void {
    if (this.recorder === null) {
      throw new Error("recorder not found.");
    }
    this.recorder.ondataavailable = async (blobEvent) => {
      this.chunks.push(blobEvent.data);

      this.createWebm();
      const url = this.getCaptureMovieUrl();
      this.setWebmUrlToStoreFunc(url);

      const buffer = await blobEvent.data.arrayBuffer();
      this.moveRepository.appendBuffer(
        this.testResultId,
        this.arrayBuffer2Base64(buffer)
      );
    };
  }

  public startRecorder(): number {
    if (this.recorder === null) {
      throw new Error("recorder is null");
    }
    this.recorder.start();
    return new Date().getTime();
  }

  public createWebm(): void {
    this.webm = new Blob(this.chunks, { type: "video/webm" });
  }

  public getCaptureMovieUrl(): string {
    if (this.webm === null) {
      throw new Error("webm not found.");
    }
    return window.URL.createObjectURL(this.webm);
  }

  public requestData(): void {
    if (!this.firstTimeCaptured) {
      this.firstTimeCaptured = true;
      return;
    }
    if (this.recorder === null) {
      throw new Error("recorder not found.");
    }
    if (this.recorder.state !== "recording") {
      throw new Error(`recorder state: ${this.recorder.state}`);
    }
    this.recorder.requestData();
  }

  public arrayBuffer2Base64(arrayBuffer: ArrayBuffer): string {
    // let binary = "";
    // const bytes = new Uint16Array(arrayBuffer);
    // for (let i = 0; i < bytes.byteLength; i++) {
    //   binary += String.fromCharCode(bytes[i]);
    // }
    // return window.btoa(binary);
    //return String.fromCharCode.apply(null, new Uint16Array(arrayBuffer) as any);

    // const uint8Array = new Uint8Array(arrayBuffer);
    // const data = uint8Array.reduce(
    //   (acc, i) => (acc += String.fromCharCode.apply(null, [i])),
    //   ""
    // );
    // return data;
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

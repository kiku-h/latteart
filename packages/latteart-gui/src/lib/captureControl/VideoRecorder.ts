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

import {
  ServiceResult,
  ServiceSuccess,
  TestResultAccessor,
  Video,
} from "latteart-client";

export type VideoRecorder = {
  readonly recordingVideo?: Video;
  startRecording(): Promise<ServiceResult<void>>;
  requestData(): void;
};

export function createVideoRecorder(
  testResult: TestResultAccessor
): VideoRecorder {
  return new VideoRecorderImpl(testResult);
}

class VideoRecorderImpl implements VideoRecorder {
  private mediaRecorder: MediaRecorder | null;
  private videoInfo?: Video;

  constructor(private testResult: TestResultAccessor) {
    this.mediaRecorder = null;
  }

  public get recordingVideo(): Video | undefined {
    return this.videoInfo;
  }

  public async startRecording(): Promise<ServiceResult<void>> {
    const stream = await (navigator.mediaDevices as any).getDisplayMedia({
      audio: false,
      video: { frameRate: 10 },
    });
    const tracks = [...stream.getTracks()];
    const mediaStream = new MediaStream(tracks);

    const mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: "video/webm; codecs=vp9",
      videoBitsPerSecond: 2048000,
    });
    mediaRecorder.ondataavailable = async (blobEvent) => {
      const buffer = await blobEvent.data.arrayBuffer();

      this.testResult.appendVideoBuffer(buffer);
    };

    mediaRecorder.start();

    const startTimestamp = new Date().getTime();

    const createVideoResult = await this.testResult.createVideo(startTimestamp);

    if (createVideoResult.isFailure()) {
      return createVideoResult;
    }

    this.mediaRecorder = mediaRecorder;
    this.videoInfo = createVideoResult.data;

    this.requestData();

    return new ServiceSuccess(undefined);
  }

  public requestData(): void {
    if (this.mediaRecorder === null) {
      return;
    }
    if (this.mediaRecorder.state !== "recording") {
      return;
    }

    this.mediaRecorder.requestData();
  }
}

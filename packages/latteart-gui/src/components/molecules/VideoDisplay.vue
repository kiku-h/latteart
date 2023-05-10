<!--
 Copyright 2023 NTT Corporation.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<template>
  <div style="position: relative; height: 100%">
    <video ref="video" controls style="height: 100%">
      <source type="video/webm" />
    </video>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from "vue-property-decorator";

@Component
export default class VideoDisplay extends Vue {
  @Prop({ type: String, default: "" })
  public readonly videoUrl!: string;
  @Prop({ type: Number, default: 0 })
  public readonly startTime!: number;
  @Prop({ type: Boolean, default: false })
  public readonly pictureInPicture!: boolean;

  private resizeObserver?: ResizeObserver;

  mounted() {
    const video = this.$refs.video as HTMLVideoElement;

    video.addEventListener(
      "enterpictureinpicture",
      this.notifyEnterPictureInPicture
    );
    video.addEventListener(
      "leavepictureinpicture",
      this.notifyLeavePictureInPicture
    );

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.$emit("changeSize", {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    this.resizeObserver.observe(video);
  }

  beforeDestroy() {
    this.resizeObserver?.disconnect();

    const video = this.$refs.video as HTMLVideoElement;

    video.removeEventListener(
      "enterpictureinpicture",
      this.notifyEnterPictureInPicture
    );
    video.removeEventListener(
      "leavepictureinpicture",
      this.notifyLeavePictureInPicture
    );
  }

  @Watch("videoUrl")
  private updateVideo(): void {
    const video = this.$refs.video as HTMLVideoElement;
    video.src = this.videoUrl;
  }

  @Watch("startTime")
  private updateCurrentTime(): void {
    const video = this.$refs.video as HTMLVideoElement;
    video.currentTime = this.startTime;
  }

  @Watch("pictureInPicture")
  private switchPictureInPicture(): void {
    if (this.pictureInPicture) {
      this.enterPictureInPicture();
    } else {
      this.exitPictureInPicture();
    }
  }

  private async enterPictureInPicture(): Promise<void> {
    if (!document.pictureInPictureElement) {
      const video = this.$refs.video as HTMLVideoElement;
      await video.requestPictureInPicture();
    }
  }

  private async exitPictureInPicture(): Promise<void> {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }
  }

  private notifyEnterPictureInPicture() {
    this.$emit("enterPictureInPicture");
  }

  private notifyLeavePictureInPicture() {
    this.$emit("leavePictureInPicture");
  }
}
</script>

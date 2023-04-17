<template>
  <v-layout>
    <video ref="video" controls>
      <source type="video/webm" />
    </video>
    <div :style="rectStyle" class="rect-area"></div>
  </v-layout>
</template>

<script lang="ts">
import {
  OperationHistory,
  OperationWithNotes,
} from "@/lib/operationHistory/types";
import { Vue, Prop, Component, Watch } from "vue-property-decorator";

@Component
export default class CaptureMovieDisplay extends Vue {
  @Prop({ type: Array, default: () => [] })
  public readonly history!: OperationHistory;

  private currentTime = 0;

  get currentOperation(): OperationWithNotes | undefined {
    return (this.history ?? []).find((val) => {
      return (
        val.operation.sequence ===
        Number(this.$store.state.operationHistory.selectedOperationSequence)
      );
    });
  }

  get startTimestamp(): number {
    return this.$store.state.captureControl.movieStartTimestamp;
  }

  get rectStyle(): {
    top?: string;
    left?: string;
    width?: string;
    height?: string;
    display: string;
  } {
    console.log(this.currentOperation);
    if (!this.currentOperation?.operation.elementInfo?.boundingRect) {
      return {
        display: "none",
      };
    }
    const video = this.$refs.video as HTMLVideoElement;
    const videoRect = video.getBoundingClientRect();

    const opeRect = this.currentOperation.operation.elementInfo?.boundingRect;
    if (
      opeRect.top === undefined ||
      this.currentOperation.operation.elementInfo?.outerHeight === undefined ||
      this.currentOperation.operation.elementInfo?.innerHeight === undefined ||
      opeRect.left === undefined ||
      this.currentOperation.operation.elementInfo?.outerWidth === undefined ||
      this.currentOperation.operation.elementInfo?.innerWidth === undefined ||
      opeRect.width === undefined ||
      opeRect.height === undefined
    ) {
      return {
        display: "none",
      };
    }
    const magni =
      videoRect.height /
      this.currentOperation.operation.elementInfo?.outerHeight;

    const opeRectToolbarHeight =
      this.currentOperation.operation.elementInfo?.outerHeight -
      this.currentOperation.operation.elementInfo?.innerHeight;
    const style = {
      top: `${Math.floor((opeRect.top + opeRectToolbarHeight) * magni)}px`,
      left: `${Math.floor(opeRect.left * magni)}px`,
      width: `${Math.floor(opeRect.width * magni)}px`,
      height: `${Math.floor(opeRect.height * magni)}px`,
      display: "block",
    };
    console.log({ style });
    return style;
  }

  get videoSrc(): string {
    return this.$store.state.captureControl.capturedMovieUrl;
  }

  @Watch("videoSrc")
  private updateVideo(): void {
    console.log("videoUrl: " + this.videoSrc);
    const video = this.$refs.video as HTMLVideoElement;
    video.src = this.videoSrc;
    video.currentTime = this.currentTime;
  }

  @Watch("currentOperation")
  private updateCurrentTime(): void {
    if (!this.currentOperation?.operation.timestamp || !this.startTimestamp) {
      this.currentTime = 0;
      return;
    }
    this.currentTime =
      (Number(this.currentOperation.operation.timestamp) -
        this.startTimestamp) /
      1000;

    const video = this.$refs.video as HTMLVideoElement;
    video.currentTime = this.currentTime;
  }
}
</script>

<style lang="sass" scoped>
.rect-area
  position: absolute
  border: solid 2px #F00
</style>

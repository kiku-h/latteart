<template>
  <v-container fluid class="fill-height">
    <video-display
      :videoUrl="videoSrc"
      :startTime="currentTime"
      :pictureInPicture="isPipMode"
      @changeSize="updateVideoSize"
      @enterPictureInPicture="isPipMode = true"
      @leavePictureInPicture="isPipMode = false"
    >
      <div v-if="!isPipMode" :style="rectStyle" class="rect-area"></div>
    </video-display>
  </v-container>
</template>

<script lang="ts">
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import {
  OperationHistory,
  OperationWithNotes,
} from "@/lib/operationHistory/types";
import { OperationHistoryState } from "@/store/operationHistory";
import { Vue, Prop, Component, Watch } from "vue-property-decorator";

@Component({
  components: {
    "video-display": VideoDisplay,
  },
})
export default class CaptureMovieDisplay extends Vue {
  @Prop({ type: Array, default: () => [] })
  public readonly history!: OperationHistory;

  private currentTime = 0;
  private videoSize = { width: 0, height: 0 };

  private isPipMode = false;

  private updateVideoSize(size: { width: number; height: number }) {
    this.videoSize = size;
  }

  get currentOperation(): OperationWithNotes | undefined {
    return (this.history ?? []).find((val) => {
      return (
        val.operation.sequence ===
        Number(this.$store.state.operationHistory.selectedOperationSequence)
      );
    });
  }

  get startTimestamp(): number {
    return (this.$store.state.operationHistory as OperationHistoryState)
      .testResultInfo.movieStartTimestamp;
  }

  get rectStyle(): {
    top?: string;
    left?: string;
    width?: string;
    height?: string;
    display: string;
  } {
    if (!this.currentOperation?.operation.elementInfo?.boundingRect) {
      return {
        display: "none",
      };
    }

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
      this.videoSize.height /
      this.currentOperation.operation.elementInfo?.outerHeight;

    const opeRectToolbarHeight =
      this.currentOperation.operation.elementInfo?.outerHeight -
      this.currentOperation.operation.elementInfo?.innerHeight;
    const style = {
      top: `${(opeRect.top + opeRectToolbarHeight) * magni}px`,
      left: `${opeRect.left * magni}px`,
      width: `${opeRect.width * magni}px`,
      height: `${opeRect.height * magni}px`,
      display: "block",
    };
    return style;
  }

  get videoSrc(): string {
    return this.$store.state.captureControl.capturedMovieUrl;
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
  }
}
</script>

<style lang="sass" scoped>
.rect-area
  position: absolute
  outline: solid 2px #F00
</style>

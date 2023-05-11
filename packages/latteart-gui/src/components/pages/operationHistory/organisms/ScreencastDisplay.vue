<template>
  <v-container fluid class="fill-height">
    <video-display
      :videoUrl="videoUrl"
      :startTime="currentTime"
      :pictureInPicture="isPipMode"
      @playing="rectStyle = { display: 'none' }"
      @enterPictureInPicture="togglePipMode(true)"
      @leavePictureInPicture="togglePipMode(false)"
    >
      <div v-if="isRectDisplayed" :style="rectStyle" class="rect-area"></div>
    </video-display>
  </v-container>
</template>

<script lang="ts">
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { OperationHistory } from "@/lib/operationHistory/types";
import { OperationHistoryState } from "@/store/operationHistory";
import { ElementInfo } from "latteart-client";
import { Vue, Prop, Component, Watch } from "vue-property-decorator";

@Component({
  components: {
    "video-display": VideoDisplay,
  },
})
export default class ScreencastDisplay extends Vue {
  @Prop({ type: Array, default: () => [] })
  public readonly history!: OperationHistory;

  private currentTime = 0;

  private isRectDisplayed = false;

  private rectStyle: {
    top?: string;
    left?: string;
    width?: string;
    height?: string;
    display: string;
  } = { display: "none" };

  private get operationHistoryState() {
    return this.$store.state.operationHistory as OperationHistoryState;
  }

  private get isPipMode() {
    return this.operationHistoryState.isPictureInPictureWindowDisplayed;
  }

  private get selectedOperationSequence() {
    return this.operationHistoryState.selectedOperationSequence;
  }

  private get startTimestamp(): number {
    return this.operationHistoryState.testResultInfo.movieStartTimestamp;
  }

  private get videoUrl(): string {
    return this.$store.state.captureControl.capturedMovieUrl;
  }

  private togglePipMode(isPipMode: boolean) {
    this.isRectDisplayed = !isPipMode;

    this.$store.commit("operationHistory/setPictureInPictureWindowDisplayed", {
      isDisplayed: isPipMode,
    });
  }

  @Watch("selectedOperationSequence")
  private displayRect() {
    const selectedItem = (this.history ?? []).find(({ operation }) => {
      return operation.sequence === this.selectedOperationSequence;
    });

    if (!selectedItem) {
      return;
    }

    this.updateCurrentTime(selectedItem.operation);
    this.updateRect(selectedItem.operation);
  }

  private updateCurrentTime(operation: OperationForGUI) {
    const operationTimestamp = Number(operation.timestamp);

    if (!operationTimestamp || !this.startTimestamp) {
      this.currentTime = 0;
      return;
    }

    this.currentTime = (operationTimestamp - this.startTimestamp) / 1000;
  }

  private updateRect(operation: OperationForGUI) {
    this.rectStyle = this.buildRectStyle(operation.elementInfo);
    this.isRectDisplayed = true;
  }

  private buildRectStyle(rectElement: ElementInfo | null) {
    if (!rectElement?.boundingRect) {
      return { display: "none" };
    }

    const { outerHeight, innerHeight, outerWidth, innerWidth } = rectElement;

    if (!outerHeight || !innerHeight || !outerWidth || !innerWidth) {
      return { display: "none" };
    }

    const { top, left, width, height } = rectElement.boundingRect;
    const toolbarHeight = outerHeight - innerHeight;

    return {
      top: `${((top + toolbarHeight) / outerHeight) * 100}%`,
      left: `${(left / outerWidth) * 100}%`,
      width: `${(width / outerWidth) * 100}%`,
      height: `${(height / outerHeight) * 100}%`,
      display: "block",
    };
  }
}
</script>

<style lang="sass" scoped>
.rect-area
  position: absolute
  outline: solid 2px #F00
</style>

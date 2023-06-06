<template>
  <v-container fluid class="fill-height">
    <video-display
      v-if="videoUrl"
      :videoUrl="videoUrl"
      :pictureInPicture="isPipMode"
      @playing="isRectDisplayed = false"
      @enterPictureInPicture="togglePipMode(true)"
      @leavePictureInPicture="togglePipMode(false)"
    >
      <div v-if="isRectDisplayed" :style="rectStyle" class="rect-area"></div>
    </video-display>
  </v-container>
</template>

<script lang="ts">
import VideoDisplay from "@/components/molecules/VideoDisplay.vue";
import { OperationHistory } from "@/lib/operationHistory/types";
import { OperationHistoryState } from "@/store/operationHistory";
import { Vue, Prop, Component, Watch } from "vue-property-decorator";

@Component({
  components: {
    "video-display": VideoDisplay,
  },
})
export default class ScreencastDisplay extends Vue {
  @Prop({ type: Array, default: () => [] })
  public readonly history!: OperationHistory;

  private isRectDisplayed = false;

  private get selectedOperation() {
    const selectedItem = (this.history ?? []).find(({ operation }) => {
      return operation.sequence === this.selectedOperationSequence;
    });

    return selectedItem?.operation ?? null;
  }

  private get operationHistoryState() {
    return this.$store.state.operationHistory as OperationHistoryState;
  }

  private get isPipMode() {
    return this.operationHistoryState.isPictureInPictureWindowDisplayed;
  }

  private get selectedOperationSequence() {
    return this.operationHistoryState.selectedOperationSequence;
  }

  private get rectStyle(): {
    top?: string;
    left?: string;
    width?: string;
    height?: string;
    display: string;
  } {
    const rectElement = this.selectedOperation?.elementInfo;

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

  private togglePipMode(isPipMode: boolean) {
    if (isPipMode) {
      this.isRectDisplayed = false;
    }

    this.$store.commit("operationHistory/setPictureInPictureWindowDisplayed", {
      isDisplayed: isPipMode,
    });
  }

  @Watch("selectedOperationSequence")
  private displayRect() {
    if (this.isPipMode) {
      return;
    }

    this.isRectDisplayed = true;
  }

  private get videoUrl() {
    const operation = this.selectedOperation;

    if (!operation?.video) {
      return "";
    }

    const operationTimestamp = Number(operation.timestamp);
    const videoStartTimestamp = operation.video.startTimestamp;

    const time =
      videoStartTimestamp > 0
        ? (operationTimestamp - videoStartTimestamp) / 1000
        : 0;

    return `${operation.video.url}#t=${time}`;
  }
}
</script>

<style lang="sass" scoped>
.rect-area
  position: absolute
  outline: solid 2px #F00
</style>

<template>
  <v-container
    v-if="videoUrl"
    fluid
    class="fill-height"
    style="overflow: scroll"
  >
    <video-display
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
import { OperationHistoryState } from "@/store/operationHistory";
import { Vue, Component, Watch } from "vue-property-decorator";

@Component({
  components: {
    "video-display": VideoDisplay,
  },
})
export default class ScreencastDisplay extends Vue {
  private isRectDisplayed = false;

  private get operationHistoryState() {
    return (
      (this.$store.state.operationHistory as OperationHistoryState) ?? null
    );
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
    const screenImage = this.operationHistoryState.screenImage;

    if (
      !screenImage ||
      !("videoFileUrl" in screenImage.background) ||
      !screenImage.overlay?.markerRect
    ) {
      return { display: "none" };
    }

    const { width, height, offset, markerRect } = screenImage.overlay;

    return {
      top: `${((markerRect.top + (offset?.y ?? 0)) / height) * 100}%`,
      left: `${(markerRect.left / width) * 100}%`,
      width: `${(markerRect.width / width) * 100}%`,
      height: `${(markerRect.height / height) * 100}%`,
      display: "block",
    };
  }

  private get videoUrl() {
    this.isRectDisplayed = true;

    const screenImage = this.operationHistoryState.screenImage;

    if (!screenImage || !("videoFileUrl" in screenImage.background)) {
      return "";
    }

    const { videoFileUrl, time } = screenImage.background;

    return `${videoFileUrl}#t=${time}`;
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
}
</script>

<style lang="sass" scoped>
.rect-area
  position: absolute
  outline: solid 2px #F00
</style>

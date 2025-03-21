<!--
 Copyright 2025 NTT Corporation.

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
  <div>
    <v-menu :close-on-content-click="false" persistent>
      <template #activator="{ props }">
        <v-btn
          v-if="!isViewerMode"
          id="optionMenuButton"
          :disabled="isDisabled"
          variant="text"
          v-bind="props"
          icon
          size="large"
          class="mx-2"
          @click="changeOpenedFlag"
          >...</v-btn
        >
      </template>
      <v-list>
        <test-tesult-export-button />
        <generate-test-script-button />
        <replay-button />
        <screenshots-download-button v-slot="slotProps">
          <v-list-item :disabled="slotProps.obj.isDisabled" @click="slotProps.obj.execute">
            <v-list-item-title>{{ $t("common.export-screenshots") }}</v-list-item-title>
          </v-list-item>
        </screenshots-download-button>
        <compare-history-button />
        <delete-test-result-button />
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import TestResultFileExportButton from "./TestResultFileExportButton.vue";
import ReplayHistoryButton from "./ReplayHistoryButton.vue";
import GenerateTestScriptButton from "./GenerateTestScriptButton.vue";
import ScreenshotsDownloadButton from "@/components/organisms/common/ScreenshotsDownloadButton.vue";
import DeleteTestResultButton from "./DeleteTestResultButton.vue";
import CompareHistoryButton from "./CompareHistoryButton.vue";
import { computed, defineComponent, ref, inject } from "vue";
import { useCaptureControlStore } from "@/stores/captureControl";

export default defineComponent({
  components: {
    "replay-button": ReplayHistoryButton,
    "test-tesult-export-button": TestResultFileExportButton,
    "generate-test-script-button": GenerateTestScriptButton,
    "screenshots-download-button": ScreenshotsDownloadButton,
    "delete-test-result-button": DeleteTestResultButton,
    "compare-history-button": CompareHistoryButton
  },
  setup() {
    const captureControlStore = useCaptureControlStore();

    const opened = ref(false);

    const isViewerMode = computed((): boolean => {
      return inject("isViewerMode") ?? false;
    });

    const isDisabled = computed((): boolean => {
      return captureControlStore.isReplaying && opened.value;
    });

    const changeOpenedFlag = () => {
      opened.value = opened.value ? false : true;
    };

    return { isViewerMode, isDisabled, changeOpenedFlag };
  }
});
</script>

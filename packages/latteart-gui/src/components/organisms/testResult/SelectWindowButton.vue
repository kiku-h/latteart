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
    <v-btn
      id="openWindowSelectorButton"
      :disabled="!windowSelectorIsEnabled"
      icon="tab"
      size="small"
      :title="$t('common.target-tab-window')"
      class="mx-2"
      @click="isWindowSelectorDialogOpened = true"
    >
    </v-btn>

    <window-select-dialog
      :opened="!isReplaying && isWindowSelectorDialogOpened"
      @close="isWindowSelectorDialogOpened = false"
    >
    </window-select-dialog>
  </div>
</template>

<script lang="ts">
import { type DeviceSettings } from "@/lib/common/settings/Settings";
import WindowSelectDialog from "@/components/organisms/dialog/WindowSelectDialog.vue";
import { computed, defineComponent } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";

export default defineComponent({
  components: {
    "window-select-dialog": WindowSelectDialog
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();

    const config = computed((): DeviceSettings => {
      return rootStore.userSettings.deviceSettings;
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return captureControlStore.isReplaying;
    });

    const windowSelectorIsEnabled = computed(() => {
      if (captureControlStore.isRunning) {
        return false;
      }
      if (!isCapturing.value) {
        return false;
      }
      if (config.value.platformName === "iOS") {
        return false;
      }
      return true;
    });

    const isWindowSelectorDialogOpened = computed({
      get: () => captureControlStore.isWindowSelectorDialogOpened,
      set: (isOpened: boolean) => {
        captureControlStore.isWindowSelectorDialogOpened = isOpened;
      }
    });

    return {
      isReplaying,
      windowSelectorIsEnabled,
      isWindowSelectorDialogOpened
    };
  }
});
</script>

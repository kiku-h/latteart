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
  <v-card flat class="pa-0">
    <v-card-text>
      <v-text-field
        v-model="captureOption.url"
        variant="underlined"
        :label="$t('capture-option.url')"
      />
      <v-text-field
        v-model="captureOption.testResultName"
        variant="underlined"
        :label="$t('common.test-result-name')"
      ></v-text-field>
    </v-card-text>

    <v-card-subtitle>
      {{ $t("capture-option.device") }}
    </v-card-subtitle>

    <v-card-text>
      <v-select
        v-model="captureOption.platform"
        variant="underlined"
        :label="$t('capture-option.platform')"
        :items="platforms"
      ></v-select>

      <v-card v-show="isMobileSelected" class="pa-2 mb-4" variant="outlined">
        <v-card-text>
          <v-btn class="mb-3" @click="updateDevices">{{
            $t("capture-option.update-device")
          }}</v-btn>
          <v-select
            v-model="captureOption.device"
            variant="underlined"
            :label="$t('capture-option.select-device')"
            :items="devices"
            item-title="modelNumber"
            item-value="deviceName"
            :no-data-text="$t('capture-option.no-device')"
            return-object
          ></v-select>
          <v-text-field
            v-model="captureOption.device.osVersion"
            variant="underlined"
            :label="$t('capture-option.os-version')"
            readonly
          ></v-text-field>
        </v-card-text>
      </v-card>

      <v-select
        v-model="captureOption.browser"
        variant="underlined"
        :label="$t('capture-option.browser')"
        :items="browsers"
      ></v-select>

      <number-field
        v-show="isMobileSelected"
        arrow-only
        :value="captureOption.waitTimeForStartupReload"
        :max-value="60"
        :min-value="0"
        :label="$t('capture-option.reload-setting')"
        :suffix="$t('capture-option.reload-suffix')"
        @update-number-field-value="
          ({ value }) => {
            captureOption.waitTimeForStartupReload = value;
          }
        "
      ></number-field>
    </v-card-text>

    <v-card-subtitle>
      {{ $t("capture-option.media-type") }}
    </v-card-subtitle>

    <v-card-text class="mb-3 pt-1">
      <v-radio-group
        v-model="captureOption.mediaType"
        :disabled="isMediaTypeDisabled"
        class="py-0 my-0"
        inline
        :hint="$t('capture-option.media-config-hint')"
        persistent-hint
      >
        <v-radio :label="$t('common.image')" value="image" />
        <v-radio :label="$t('common.video')" value="video" />
        <v-radio :label="$t('capture-option.video-and-image')" value="video_and_image" />
      </v-radio-group>
    </v-card-text>

    <v-card-subtitle>
      {{ $t("capture-option.window-size") }}
    </v-card-subtitle>

    <v-card-text class="mb-3 mt-0 pt-1">
      <v-checkbox
        v-model="captureWindowSize.isEnabled"
        class="mt-0"
        :label="$t('capture-option.specify-window-size')"
        hide-details
      ></v-checkbox>
      <div class="d-flex align-start">
        <v-text-field
          v-model="captureOption.captureWindowSize.width"
          :disabled="!captureWindowSize.isEnabled"
          variant="underlined"
          label="Width"
          class="pl-2"
          style="max-width: 120px"
        ></v-text-field>
        <v-text-field
          v-model="captureOption.captureWindowSize.height"
          :disabled="!captureWindowSize.isEnabled"
          variant="underlined"
          label="Height"
          class="pl-2"
          style="max-width: 120px"
        ></v-text-field>
        <v-select
          @update:modelValue="
            (windowSize) => {
              captureOption.captureWindowSize.width = windowSize.width;
              captureOption.captureWindowSize.height = windowSize.height;
            }
          "
          :disabled="!captureWindowSize.isEnabled"
          variant="underlined"
          :items="captureWindowSizeItems"
          item-title="label"
          item-value="value"
          :label="$t('capture-option.window-size-preset')"
          hide-details
          style="max-width: 500px"
          class="capture-window-size pt-0 pl-4"
        ></v-select>
      </div>
    </v-card-text>

    <v-card-subtitle>
      {{ $t("common.test-purpose") }}
    </v-card-subtitle>

    <v-card-text class="pt-1">
      <v-checkbox
        v-model="captureOption.shouldRecordTestPurpose"
        class="mt-0"
        :label="$t('common.use-test-purpose')"
        hide-details
      ></v-checkbox>

      <v-card v-show="captureOption.shouldRecordTestPurpose" class="pa-2 mb-4" variant="outlined">
        <v-card-subtitle>
          {{ $t("common.first-test-purpose") }}
        </v-card-subtitle>

        <v-card-text>
          <v-text-field
            v-model="captureOption.firstTestPurpose"
            variant="underlined"
            :label="$t('common.summary')"
          ></v-text-field>
          <v-textarea
            v-model="captureOption.firstTestPurposeDetails"
            variant="underlined"
            :label="$t('common.non-required-details')"
          ></v-textarea>
        </v-card-text>
      </v-card>
    </v-card-text>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-card>
</template>

<script lang="ts">
import NumberField from "@/components/molecules/NumberField.vue";
import { type SettingsForRepository } from "latteart-client";
import {
  type CaptureMediaSetting,
  type CaptureWindowSize,
  type DeviceSettings
} from "@/lib/common/settings/Settings";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import { type CaptureOptionParams } from "@/lib/common/captureOptionParams";
import { computed, defineComponent, ref, watch } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";

export default defineComponent({
  components: {
    "number-field": NumberField,
    "error-message-dialog": ErrorMessageDialog
  },
  setup(_, context) {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const platforms = ref<DeviceSettings["platformName"][]>(["PC", "Android", "iOS"]);

    const devices = ref<{ deviceName: string; modelNumber: string; osVersion: string }[]>([]);

    const projectSettings = computed((): SettingsForRepository | undefined => {
      return rootStore.projectSettings;
    });

    const mediaType = ref<CaptureMediaSetting["mediaType"]>(
      rootStore.userSettings.captureMediaSetting.mediaType
    );

    const captureWindowSize = ref<CaptureWindowSize>(rootStore.userSettings.captureWindowSize);
    const captureWindowSizeItems = [
      {
        label: `${rootStore.userSettings.captureWindowSize.width} * ${rootStore.userSettings.captureWindowSize.height} - ${rootStore.message("capture-option.previous-capture-window-size")}`,
        value: {
          width: rootStore.userSettings.captureWindowSize.width,
          height: rootStore.userSettings.captureWindowSize.height
        }
      },
      {
        label: "800 * 600 - SVGA",
        value: { width: 800, height: 600 }
      },
      {
        label: "1024 * 768 - XGA",
        value: { width: 1024, height: 768 }
      },
      {
        label: "1280 * 800 - WZGA",
        value: { width: 1280, height: 800 }
      },
      {
        label: "1600 * 900 - HD+",
        value: { width: 1600, height: 900 }
      },
      {
        label: "1920 * 1080 - Full HD ",
        value: { width: 1920, height: 1080 }
      }
    ];

    const deviceSettings = computed((): DeviceSettings | undefined => {
      return rootStore.userSettings.deviceSettings;
    });

    const captureOption = ref<Required<CaptureOptionParams>>({
      url: "",
      testResultName: "",
      platform: deviceSettings.value?.platformName ?? "PC",
      device: deviceSettings.value?.device ?? {
        deviceName: "",
        modelNumber: "",
        osVersion: ""
      },
      waitTimeForStartupReload: 0,
      browser: deviceSettings.value?.browser ?? "Chrome",
      mediaType: mediaType.value ?? "image",
      captureWindowSize: captureWindowSize.value,
      shouldRecordTestPurpose: false,
      firstTestPurpose: "",
      firstTestPurposeDetails: ""
    });

    const browsers = computed((): DeviceSettings["browser"][] => {
      if (captureOption.value.platform === "Android") return ["Chrome"];
      if (captureOption.value.platform === "iOS") return ["Safari"];

      return ["Chrome", "Edge"];
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const captureArch = computed(() => {
      return projectSettings.value?.config.experimentalFeatureSetting.captureArch ?? "polling";
    });

    const isMediaTypeDisabled = computed(() => {
      return (
        isCapturing.value || captureArch.value === "push" || captureOption.value.platform !== "PC"
      );
    });

    const isMobileSelected = computed(() => {
      return captureOption.value.platform !== "PC";
    });

    const update = (): void => {
      context.emit("update", {
        ...captureOption.value,
        waitTimeForStartupReload: isMobileSelected.value
          ? captureOption.value.waitTimeForStartupReload
          : 0,
        firstTestPurpose: captureOption.value.shouldRecordTestPurpose
          ? captureOption.value.firstTestPurpose
          : "",
        firstTestPurposeDetails: captureOption.value.shouldRecordTestPurpose
          ? captureOption.value.firstTestPurposeDetails
          : "",
        captureWindowSize: {
          isEnabled: !!captureOption.value.captureWindowSize.isEnabled,
          width: captureOption.value.captureWindowSize.width,
          height: captureOption.value.captureWindowSize.height
        }
      });
    };

    const initializeBrowserSelection = () => {
      captureOption.value.browser = browsers.value[0];
    };

    const updateDevices = async () => {
      try {
        devices.value = [...(await recognizeDevices(captureOption.value.platform))];
        captureOption.value.device = getDefaultDevice(devices.value);
      } catch (error) {
        if (error instanceof Error) {
          errorMessageDialogOpened.value = true;
          errorMessage.value = error.message;

          return;
        }

        throw error;
      }
    };

    const getDefaultDevice = (
      devices: { deviceName: string; modelNumber: string; osVersion: string }[]
    ) => {
      return devices.length > 0 ? devices[0] : { deviceName: "", modelNumber: "", osVersion: "" };
    };

    const recognizeDevices = async (
      platformName: string
    ): Promise<{ deviceName: string; modelNumber: string; osVersion: string }[]> => {
      return captureControlStore.recognizeDevices({
        platformName
      });
    };

    watch(captureOption, update, { deep: true });
    watch(browsers, initializeBrowserSelection);
    watch(() => captureOption.value.platform, updateDevices);

    return {
      errorMessageDialogOpened,
      errorMessage,
      platforms,
      devices,
      captureOption,
      browsers,
      isMediaTypeDisabled,
      isMobileSelected,
      updateDevices,
      captureWindowSize,
      captureWindowSizeItems
    };
  }
});
</script>

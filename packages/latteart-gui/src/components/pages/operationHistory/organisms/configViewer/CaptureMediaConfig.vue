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
  <v-container class="mt-0 pt-0">
    <v-row>
      <v-col cols="12">
        <h4>メディアタイプ</h4>
        <v-radio-group
          :value="tempConfig.mediaType"
          @change="changeCaptureMediaType"
          class="py-0 my-0"
          row
        >
          <v-radio label="静止画" value="image" />
          <v-radio label="動画" value="movie" />
        </v-radio-group>
      </v-col>
      <v-col cols="12" style="margin-top: 10p; margin-left: 8px">
        <h4>画像圧縮設定</h4>
        <v-checkbox
          v-model="tempConfig.imageCompression.isEnabled"
          :label="
            $store.getters.message('config-view.image-compression-enabled')
          "
          :disabled="tempConfig.mediaType === 'movie'"
          @change="saveConfig"
          class="py-0 my-0"
        >
        </v-checkbox>
      </v-col>
      <v-col cols="12">
        <v-checkbox
          v-model="tempConfig.imageCompression.isDeleteSrcImage"
          :label="
            $store.getters.message(
              'config-view.image-compression-delete-source-image'
            )
          "
          :disabled="
            !tempConfig.imageCompression.isEnabled ||
            tempConfig.mediaType === 'movie'
          "
          @change="saveConfig"
        >
        </v-checkbox>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { CaptureMediaSetting } from "@/lib/common/settings/Settings";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class CaptureMediaConfig extends Vue {
  @Prop({ type: Boolean, required: true })
  public readonly opened!: boolean;
  @Prop({ type: Object, default: null })
  public readonly captureMediaSetting!: CaptureMediaSetting;

  private tempConfig: {
    mediaType: "image" | "movie";
    imageCompression: { isEnabled: boolean; isDeleteSrcImage: boolean };
  } = {
    ...this.captureMediaSetting,
  };

  @Watch("captureMediaSetting")
  private updateTempConfig() {
    console.log({ captureMediaSetting: this.captureMediaSetting });
    if (!this.opened) {
      this.tempConfig = { ...this.captureMediaSetting };
    }
  }

  @Watch("tempConfig")
  private saveConfig() {
    if (this.opened) {
      this.$emit("save-config", {
        captureMediaSetting: this.tempConfig,
      });
    }
  }

  private changeCaptureMediaType(mediaType: "image" | "movie") {
    this.tempConfig = {
      ...this.tempConfig,
      mediaType,
    };
  }
}
</script>

<!--
 Copyright 2022 NTT Corporation.

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
    <v-img :src="imageFileUrl" @click="openImageFile" style="cursor: pointer" />
    <v-dialog v-model="imageFileOpened">
      <v-card>
        <v-img :src="imageFileUrl" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class PopupImage extends Vue {
  @Prop({ type: String, default: "" }) public readonly imageFileUrl!: string;

  private imageFileOpened = false;

  private openImageFile() {
    this.imageFileOpened = true;
  }
}
</script>

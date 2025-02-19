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
  <v-list-tile @click="exportData" :disabled="isDisabled">
    <v-list-tile-title>{{
      $store.getters.message("config-io.export-config")
    }}</v-list-tile-title>
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />

    <download-link-dialog
      :opened="downloadLinkDialogOpened"
      :title="downloadLinkDialogTitle"
      :message="downloadLinkDialogMessage"
      :alertMessage="downloadLinkDialogAlertMessage"
      :linkUrl="downloadLinkDialogLinkUrl"
      :downloadFileName="downloadFileName"
      @close="downloadLinkDialogOpened = false"
    />
  </v-list-tile>
</template>

<script lang="ts">
import DownloadLinkDialog from "@/components/pages/common/DownloadLinkDialog.vue";
import ErrorMessageDialog from "@/components/pages/common/ErrorMessageDialog.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "download-link-dialog": DownloadLinkDialog,
  },
})
export default class ConfigExportButton extends Vue {
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private downloadLinkDialogOpened = false;
  private downloadLinkDialogTitle = "";
  private downloadLinkDialogMessage = "";
  private downloadLinkDialogAlertMessage = "";
  private downloadLinkDialogLinkUrl = "";
  private downloadFileName = "";

  private isExportingData = false;

  private get isDisabled(): boolean {
    return (
      this.isCapturing ||
      this.isReplaying ||
      this.isResuming ||
      this.isExportingData
    );
  }

  private get isCapturing(): boolean {
    return this.$store.state.captureControl.isCapturing;
  }

  private get isReplaying(): boolean {
    return this.$store.state.captureControl.isReplaying;
  }

  private get isResuming(): boolean {
    return this.$store.state.captureControl.isResuming;
  }

  private exportData() {
    (async () => {
      this.isExportingData = true;

      try {
        this.$store.dispatch("openProgressDialog", {
          message: this.$store.getters.message("config-io.export-config"),
        });
        const result = await this.$store
          .dispatch("exportProjectSettings")
          .catch((error) => {
            console.error(error);
          });
        const blob = await (
          await fetch(`${this.currentRepositoryUrl}/${result.url}`)
        ).blob();

        this.$store.dispatch("closeProgressDialog");
        this.downloadLinkDialogTitle =
          this.$store.getters.message("common.confirm");
        this.downloadLinkDialogMessage = this.$store.getters.message(
          "config-io.completed-export"
        );
        this.downloadLinkDialogAlertMessage = "";
        this.downloadLinkDialogLinkUrl = window.URL.createObjectURL(blob);
        this.downloadFileName = result.url.split("/").pop();
        this.downloadLinkDialogOpened = true;
      } catch (error) {
        this.$store.dispatch("closeProgressDialog");
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      } finally {
        this.isExportingData = false;
      }
    })();
  }

  private get currentRepositoryUrl(): string {
    return this.$store.state.repositoryService.serviceUrl;
  }
}
</script>

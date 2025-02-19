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
    <note-common-dialog
      :opened="opened"
      :isCapturing="true"
      :noteInfo="noteInfo"
      @execute="takeNote"
      @close="close()"
    />
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { NoteEditInfo } from "@/lib/captureControl/types";
import { NoteDialogInfo } from "@/lib/operationHistory/types";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ErrorMessageDialog from "./ErrorMessageDialog.vue";
import NoteCommonDialog from "./NoteCommonDialog.vue";

@Component({
  components: {
    "note-common-dialog": NoteCommonDialog,
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class TakeNoteDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;

  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private noteInfo: NoteDialogInfo = {
    value: "",
    details: "",
    index: null,
    tags: [],
    imageFilePath: "",
    sequence: 1,
    maxSequence: 1,
  };

  @Watch("opened")
  private initialize() {
    if (!this.opened) {
      return;
    }
    const { sequence } =
      this.$store.state.operationHistory.selectedOperationNote;

    this.noteInfo = {
      value: "",
      details: "",
      index: null,
      tags: [],
      imageFilePath:
        this.$store.state.operationHistory.history[sequence - 1].operation
          .imageFilePath ?? "",
      sequence: sequence,
      maxSequence: this.$store.state.operationHistory.history.length,
    };
  }

  private takeNote(noteEditInfo: NoteEditInfo) {
    (async () => {
      this.close();
      try {
        await this.$store.dispatch("captureControl/takeNote", {
          noteEditInfo,
        });
      } catch (error) {
        if (error instanceof Error) {
          this.errorMessage = error.message;
          this.errorMessageDialogOpened = true;
        } else {
          throw error;
        }
      }
    })();
  }

  private close(): void {
    this.$emit("close");
  }
}
</script>

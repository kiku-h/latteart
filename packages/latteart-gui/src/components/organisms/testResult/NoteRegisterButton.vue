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
  <div :title="$t('common.record-note') + ': ' + $t('note-register-button.details')">
    <v-btn
      :disabled="isDisabled"
      color="green"
      icon="edit"
      size="small"
      class="mx-2"
      @click="open"
    />
  </div>

  <take-not-with-purpose-dialog
    :opened="takeNoteWithPurposeDialogOpened"
    @close="takeNoteWithPurposeDialogOpened = false"
  />
  <take-note-dialog :opened="takeNoteDialogOpened" @close="takeNoteDialogOpened = false" />
</template>

<script lang="ts">
import TakeNoteWithPurposeDialog from "@/components/organisms/dialog/TakeNoteWithPurposeDialog.vue";
import TakeNoteDialog from "@/components/organisms/dialog/TakeNoteDialog.vue";
import { computed, defineComponent, ref } from "vue";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { checkExcludeOperationType } from "@/lib/common/util";

export default defineComponent({
  components: {
    "take-not-with-purpose-dialog": TakeNoteWithPurposeDialog,
    "take-note-dialog": TakeNoteDialog
  },
  setup() {
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();

    const takeNoteWithPurposeDialogOpened = ref(false);
    const takeNoteDialogOpened = ref(false);

    const history = computed(() => {
      return operationHistoryStore.history;
    });

    const isDisabled = computed((): boolean => {
      if (captureControlStore.isRunning) {
        return true;
      }
      if (!captureControlStore.isCapturing) {
        return true;
      }
      if (captureControlStore.testOption.shouldRecordTestPurpose) {
        return false;
      }
      const target = history.value.at(-1)?.operation.type ?? "";
      return checkExcludeOperationType(target);
    });

    const open = () => {
      const sequence = history.value.length;
      operationHistoryStore.selectOperation({ sequence, doScroll: false });
      operationHistoryStore.selectedOperationNote = { sequence, index: null };
      if (captureControlStore.testOption.shouldRecordTestPurpose) {
        takeNoteWithPurposeDialogOpened.value = true;
      } else {
        takeNoteDialogOpened.value = true;
      }
    };

    return {
      takeNoteWithPurposeDialogOpened,
      takeNoteDialogOpened,
      isDisabled,
      open
    };
  }
});
</script>

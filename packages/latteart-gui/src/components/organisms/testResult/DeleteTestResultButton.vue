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
    <v-list-item :disabled="isDisabled" @click="openConfirmDialog">
      <v-list-item-title>{{
        $t("delete-test-result-button.delete-test-result")
      }}</v-list-item-title>
    </v-list-item>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="$t('delete-test-result-button.delete-test-result')"
      :message="confirmMessage"
      :on-accept="deleteTestResult"
      @close="confirmDialogOpened = false"
    />

    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="$t('common.confirm')"
      :message="$t('common.delete-test-result-succeeded')"
      @close="goToTestResultListPage"
    ></information-message-dialog>

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/components/molecules/InformationMessageDialog.vue";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useRootStore } from "@/stores/root";
import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    "confirm-dialog": ConfirmDialog,
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();
    const router = useRouter();

    const confirmDialogOpened = ref(false);
    const confirmMessage = ref("");

    const informationMessageDialogOpened = ref(false);

    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const isDisabled = computed((): boolean => {
      return (
        isCapturing.value || isReplaying.value || isResuming.value || testResultInfo.value.id === ""
      );
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return captureControlStore.isReplaying;
    });

    const isResuming = computed((): boolean => {
      return captureControlStore.isResuming;
    });

    const testResultInfo = computed(() => {
      return operationHistoryStore.testResultInfo;
    });

    const openConfirmDialog = async () => {
      const sessions: string[] = (await operationHistoryStore.getSessionIds()) ?? [];

      confirmMessage.value =
        sessions.length > 0
          ? rootStore.message(
              "delete-test-result-button.delete-test-result-associated-session-message",
              {
                value: testResultInfo.value.name
              }
            )
          : rootStore.message("delete-test-result-button.delete-test-result-message", {
              value: testResultInfo.value.name
            });
      confirmDialogOpened.value = true;
    };

    const deleteTestResult = async (): Promise<void> => {
      rootStore.openProgressDialog({
        message: rootStore.message("common.deleting-test-results")
      });

      try {
        await operationHistoryStore.deleteTestResults({
          testResultIds: [testResultInfo.value.id]
        });
        operationHistoryStore.removeStoringTestResultInfos({
          testResultInfos: [{ id: testResultInfo.value.id, name: testResultInfo.value.name }]
        });
        operationHistoryStore.clearTestResult();
        operationHistoryStore.clearScreenTransitionDiagramGraph();
        operationHistoryStore.clearElementCoverages();
        operationHistoryStore.clearInputValueTable();
        captureControlStore.resetTimer();

        informationMessageDialogOpened.value = true;
      } catch (error) {
        if (error instanceof Error) {
          errorMessageDialogOpened.value = true;
          errorMessage.value = error.message;
        } else {
          throw error;
        }
      } finally {
        rootStore.closeProgressDialog();
      }
    };

    const goToTestResultListPage = () => {
      informationMessageDialogOpened.value = false;

      router.push({ path: "/page/test-result-list" });
    };

    return {
      confirmDialogOpened,
      confirmMessage,
      informationMessageDialogOpened,
      errorMessageDialogOpened,
      errorMessage,
      isDisabled,
      openConfirmDialog,
      deleteTestResult,
      goToTestResultListPage
    };
  }
});
</script>

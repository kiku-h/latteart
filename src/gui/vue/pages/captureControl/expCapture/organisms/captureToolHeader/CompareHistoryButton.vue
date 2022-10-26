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
    <v-list-tile @click="openConfirmDialog" :disabled="isDisabled">
      <v-list-tile-title>{{
        $store.getters.message("history-view.compare-test-result")
      }}</v-list-tile-title>
    </v-list-tile>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="$store.getters.message('history-view.compare-test-result-title')"
      :message="
        $store.getters.message('history-view.compare-test-result-message')
      "
      :onAccept="compareHistory"
      @close="confirmDialogOpened = false"
    />

    <comparison-result-dialog
      :opened="resultDialogOpened"
      :comparisonResult="comparisonResult"
      @close="resultDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </div>
</template>

<script lang="ts">
import { Operation } from "@/lib/operationHistory/Operation";
import { TestResultSummary } from "@/lib/operationHistory/types";
import ConfirmDialog from "@/vue/pages/common/ConfirmDialog.vue";
import { Component, Vue } from "vue-property-decorator";
import ErrorMessageDialog from "../../../../common/ErrorMessageDialog.vue";
import ComparisonResultDialog from "../ComparisonResultDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "confirm-dialog": ConfirmDialog,
    "comparison-result-dialog": ComparisonResultDialog,
  },
})
export default class CompareHistoryButton extends Vue {
  private confirmDialogOpened = false;
  private errorMessageDialogOpened = false;
  private errorMessage = "";
  private resultDialogOpened = false;

  private comparisonResult: {
    url: string;
    diffCount: number;
    diffs: {
      [key: string]: {
        a: string | undefined;
        b: string | undefined;
      };
    }[];
    hasInvalidScreenshots: boolean;
  } | null = null;

  private get isDisabled(): boolean {
    return (
      this.isCapturing ||
      this.isReplaying ||
      this.isResuming ||
      this.operations.length === 0 ||
      this.testResultSource === ""
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

  private get testResultId(): string {
    return this.$store.state.operationHistory.testResultInfo.id;
  }

  private get testResultSource(): string {
    return this.$store.state.operationHistory.testResultInfo.source;
  }

  private get operations(): Operation[] {
    return this.$store.getters["operationHistory/getOperations"]();
  }

  private openConfirmDialog() {
    this.confirmDialogOpened = true;
  }

  private async compareHistory(): Promise<void> {
    await this.$store.dispatch("openProgressDialog", {
      message: this.$store.getters.message(
        "history-view.comparing-test-result"
      ),
    });

    try {
      const destTestResultId = this.testResultId;

      const testResults: TestResultSummary[] = await this.$store.dispatch(
        "operationHistory/getTestResults"
      );

      if (testResults.length === 0) {
        throw new Error(
          this.$store.getters.message(
            "history-view.compare-test-result-not-exist"
          )
        );
      }

      const sourceTestResultId = this.findSourceTestResultId(testResults);

      if (!sourceTestResultId) {
        throw new Error(
          this.$store.getters.message(
            "history-view.compare-test-result-not-exist"
          )
        );
      }

      const comparedInfo: {
        url: string;
        diffCount: number;
        diffs: {
          [key: string]: {
            a: string | undefined;
            b: string | undefined;
          };
        }[];
        hasInvalidScreenshots: boolean;
      } = await this.$store.dispatch("operationHistory/compareTestResult", {
        testResultId1: destTestResultId,
        testResultId2: sourceTestResultId,
      });

      this.comparisonResult = comparedInfo;
      this.resultDialogOpened = true;
    } catch (error) {
      if (error instanceof Error) {
        this.errorMessageDialogOpened = true;
        this.errorMessage = error.message;
      } else {
        throw error;
      }
    } finally {
      await this.$store.dispatch("closeProgressDialog");
    }
  }

  private findSourceTestResultId(testResults: TestResultSummary[]) {
    const destTestResult = testResults.find((testResult) => {
      return testResult.id === this.testResultId;
    });

    const sourceTestResult = testResults.find((testResult) => {
      return testResult.id === destTestResult?.source;
    });

    return sourceTestResult?.id ?? undefined;
  }
}
</script>

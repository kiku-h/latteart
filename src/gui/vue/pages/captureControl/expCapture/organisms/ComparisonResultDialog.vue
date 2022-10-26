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
  <scrollable-dialog :opened="opened">
    <template v-slot:title>
      <span>{{ $store.getters.message("common.confirm") }}</span>
    </template>
    <template v-slot:content>
      <span class="pre-wrap break-word">{{ dialogMessage }}</span>
      <a :href="downloadLinkUrl" class="px-2" download>{{
        $store.getters.message("common.download-link")
      }}</a>
      <div v-if="diffs.length > 0">
        <v-divider class="mt-3 mb-2" />
        <v-data-table
          :headers="headers"
          :items="diffs"
          hide-actions
          class="hover-disabled"
        >
          <template v-slot:items="props">
            <td>
              {{ props.item.sequence }}
            </td>
            <td>
              {{ props.item.fieldNames }}
            </td>
          </template>
        </v-data-table>
      </div>
    </template>
    <template v-slot:footer>
      <v-spacer></v-spacer>
      <v-btn color="blue" dark @click="$emit('close')">{{
        $store.getters.message("common.ok")
      }}</v-btn>
    </template>
  </scrollable-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ScrollableDialog from "@/vue/molecules/ScrollableDialog.vue";

@Component({
  components: {
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class ComparisonResultDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened!: boolean;
  @Prop({
    type: Object,
    default: () => {
      /* Do nothing */
    },
  })
  public readonly comparisonResult!: {
    url: string;
    diffCount: number;
    diffs: {
      [key: string]: {
        a: string | undefined;
        b: string | undefined;
      };
    }[];
    hasInvalidScreenshots: boolean;
  } | null;

  private get headers() {
    return [
      {
        text: `${this.$store.getters.message(
          "history-view.compare-diffs-sequence"
        )}`,
        value: "sequence",
        sortable: false,
      },
      {
        text: `${this.$store.getters.message(
          "history-view.compare-diffs-field"
        )}`,
        value: "fieldNames",
        sortable: false,
      },
    ];
  }

  private get dialogMessage() {
    if (!this.comparisonResult) {
      return "";
    }

    return `${this.$store.getters.message("history-view.compate-test-result")}${
      this.comparisonResult.hasInvalidScreenshots
        ? this.$store.getters.message(
            "history-view.compate-test-result-skip-image-compare"
          )
        : ""
    }${
      this.comparisonResult.diffCount === 0
        ? this.$store.getters.message(
            "history-view.compare-test-result-is-same"
          )
        : this.$store.getters.message(
            "history-view.compare-test-result-is-different",
            {
              diffCount: this.comparisonResult.diffCount,
            }
          )
    }`;
  }

  private get downloadLinkUrl() {
    if (!this.comparisonResult) {
      return "";
    }

    return `${this.currentRepositoryUrl}/${this.comparisonResult.url}`;
  }

  private get diffs() {
    if (!this.comparisonResult) {
      return [];
    }

    const sequenceAndFieldNames = this.comparisonResult.diffs.map(
      (diff, index) => {
        const fieldNames = Object.keys(diff)
          .map((key) => {
            if (key === "elementInfo") {
              return this.$store.getters.message("operation.elementinfo");
            }

            if (key === "url") {
              return this.$store.getters.message("operation.pageUrl");
            }

            if (key === "screenElements") {
              return this.$store.getters.message("operation.screenelements");
            }

            return this.$store.getters.message(`operation.${key}`);
          })
          .join(", ");

        return { sequence: index + 1, fieldNames };
      }
    );

    return sequenceAndFieldNames.filter(({ fieldNames }) => fieldNames !== "");
  }

  private get currentRepositoryUrl(): string {
    return this.$store.state.repositoryContainer.serviceUrl;
  }
}
</script>

<style lang="sass" scoped>
.hover-disabled ::v-deep
  tbody
    tr:hover
      background-color: transparent !important
</style>

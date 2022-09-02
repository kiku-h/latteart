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
  <v-container class="mt-0 pt-0">
    <v-layout row wrap>
      <v-flex xs12>
        <v-checkbox
          v-model="isEnableExclusionQuery"
          :label="$store.getters.message('config-view.exclude-query-enabled')"
          hide-details
        >
        </v-checkbox>
      </v-flex>
      <v-flex xs12 class="select-box">
        <v-select
          v-model="exclusionQuery"
          :items="queries"
          item-text="queryName"
          item-value="queryValue"
          :menu-props="{ maxHeight: '400' }"
          :label="$store.getters.message('config-view.exclude-compare-query')"
          multiple
          @change="changeQuery"
          :disabled="!isEnableExclusionQuery"
          class="px-1"
        ></v-select>
      </v-flex>
      <v-flex xs12>
        <v-checkbox
          v-model="isEnableExclusionTag"
          :label="$store.getters.message('config-view.exclude-tags-enabled')"
          hide-details
        >
        </v-checkbox>
      </v-flex>
      <v-flex xs12 class="select-box">
        <v-select
          v-model="exclusionTag"
          :items="tags"
          :menu-props="{ maxHeight: '400' }"
          :label="$store.getters.message('config-view.exclude-compare-tags')"
          multiple
          @change="changeTag"
          :disabled="!isEnableExclusionTag"
          class="px-1"
        ></v-select>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { CompareInfo } from "@/lib/common/settings/Settings";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class CompareSetting extends Vue {
  private queryList: string[] = [];
  private tagList: string[] = [];

  private tags = this.$store.state.operationHistory.defaultTagList.sort();

  private get queries(): { queryName: string; queryValue: string }[] {
    return [
      {
        queryName: `${this.$store.getters.message("operation.input")}`,
        queryValue: "input",
      },
      {
        queryName: `${this.$store.getters.message("operation.type")}`,
        queryValue: "type",
      },
      {
        queryName: `${this.$store.getters.message("operation.elementinfo")}`,
        queryValue: "elementInfo",
      },
      {
        queryName: `${this.$store.getters.message("operation.title")}`,
        queryValue: "title",
      },
      {
        queryName: `${this.$store.getters.message("operation.url")}`,
        queryValue: "url",
      },
      {
        queryName: `${this.$store.getters.message("operation.screenelements")}`,
        queryValue: "screenElements",
      },
    ];
  }

  private get compareInfo(): CompareInfo {
    return this.$store.state.operationHistory.config.compare;
  }

  private get isEnableExclusionQuery(): boolean {
    return this.compareInfo.exclude.query.isEnabled;
  }

  private set isEnableExclusionQuery(isEnabled: boolean) {
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          compare: {
            exclude: {
              query: {
                isEnabled: isEnabled,
                item: this.compareInfo.exclude.query.item,
              },
              tags: {
                isEnabled: this.compareInfo.exclude.tags.isEnabled,
                item: this.compareInfo.exclude.tags.item,
              },
            },
          },
        },
      });
    })();
  }

  private get isEnableExclusionTag(): boolean {
    return this.compareInfo.exclude.tags.isEnabled;
  }

  private set isEnableExclusionTag(isEnabled: boolean) {
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          compare: {
            exclude: {
              query: {
                isEnabled: this.compareInfo.exclude.query.isEnabled,
                item: this.compareInfo.exclude.query.item,
              },
              tags: {
                isEnabled: isEnabled,
                item: this.compareInfo.exclude.tags.item,
              },
            },
          },
        },
      });
    })();
  }

  private get exclusionQuery(): string[] {
    return this.compareInfo.exclude.query.item.split(",") ?? [];
  }

  private set exclusionQuery(excludeQueries: string[]) {
    this.queryList = excludeQueries;
  }

  private get exclusionTag(): string[] {
    return this.compareInfo.exclude.tags.item.split(",") ?? [];
  }

  private set exclusionTag(excludeTags: string[]) {
    this.tagList = excludeTags;
  }

  private changeQuery() {
    const tmpList = this.queryList.filter((tag) => {
      return tag !== "";
    });
    const queryText = tmpList.length > 0 ? tmpList.join(",") : "";
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          compare: {
            exclude: {
              query: {
                isEnabled: this.compareInfo.exclude.query.isEnabled,
                item: queryText,
              },
              tags: {
                isEnabled: this.compareInfo.exclude.tags.isEnabled,
                item: this.compareInfo.exclude.tags.item,
              },
            },
          },
        },
      });
    })();
  }

  private changeTag() {
    const tmpList = this.tagList.filter((tag) => {
      return tag !== "";
    });
    const tagText = tmpList.length > 0 ? tmpList.join(",") : "";
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          compare: {
            exclude: {
              query: {
                isEnabled: this.compareInfo.exclude.query.isEnabled,
                item: this.compareInfo.exclude.query.item,
              },
              tags: {
                isEnabled: this.compareInfo.exclude.tags.isEnabled,
                item: tagText,
              },
            },
          },
        },
      });
    })();
  }
}
</script>

<style lang="sass" scoped>
.select-box
  padding-left: 1.5em
</style>

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
          v-model="isEnableExclusion"
          :label="$store.getters.message('config-view.exclude-tags-enabled')"
        >
        </v-checkbox>
      </v-flex>
      <v-select
        v-model="exclusionQuery"
        :items="queries"
        :menu-props="{ maxHeight: '400' }"
        :label="$store.getters.message('config-view.exclude-compare-query')"
        multiple
        @change="changeQuery"
        :disabled="!isEnableExclusion"
        class="px-1"
      ></v-select>
      <v-select
        v-model="exclusionTag"
        :items="tags"
        :menu-props="{ maxHeight: '400' }"
        :label="$store.getters.message('config-view.exclude-compare-tags')"
        multiple
        @change="changeTag"
        :disabled="!isEnableExclusion"
        class="px-1"
      ></v-select>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class CompareSetting extends Vue {
  private queryList: string[] = [];
  private tagList: string[] = [];

  private queries = [
    "input",
    "type",
    "elementInfo",
    "title",
    "url",
    "windowHandle",
    "keywordTexts",
    "screenElements",
  ];

  private tags = this.$store.state.operationHistory.defaultTagList;

  private get isEnableExclusion(): boolean {
    return this.$store.state.operationHistory.config.compare.exclude.isEnabled;
  }
  private set isEnableExclusion(isEnabled: boolean) {
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          compare: {
            exclude: {
              isEnabled: isEnabled,
              query:
                this.$store.state.operationHistory.config.compare.exclude.query,
              tags: this.$store.state.operationHistory.config.compare.exclude
                .tags,
            },
          },
        },
      });
    })();
  }

  private get exclusionQuery(): string[] {
    return (
      this.$store.state.operationHistory.config.compare.exclude.query.split(
        ","
      ) ?? []
    );
  }

  private set exclusionQuery(excludeQueries: string[]) {
    this.queryList = excludeQueries;
  }

  private get exclusionTag(): string[] {
    return (
      this.$store.state.operationHistory.config.compare.exclude.tags.split(
        ","
      ) ?? []
    );
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
              isEnabled:
                this.$store.state.operationHistory.config.compare.exclude
                  .isEnabled,
              query: queryText,
              tags: this.$store.state.operationHistory.config.compare.exclude
                .tags,
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
              isEnabled:
                this.$store.state.operationHistory.config.compare.exclude
                  .isEnabled,
              query:
                this.$store.state.operationHistory.config.compare.exclude.query,
              tags: tagText,
            },
          },
        },
      });
    })();
  }
}
</script>

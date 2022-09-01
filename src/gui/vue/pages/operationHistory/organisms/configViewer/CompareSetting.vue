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
      <div class="head-label">
        {{ $store.getters.message("config-view.exclude-compare-query") }}
      </div>
      <v-flex
        style="width: 150px"
        v-for="query in queries"
        v-bind:key="query"
        pa-1
      >
        <v-card class="ma-1 pa-1" color="#EEE">
          <v-card-text class="my-0 py-0">
            <v-layout align-center ma-0 pa-0>
              <v-flex xs10 ma-0 pa-0>
                {{ query }}
              </v-flex>
              <v-flex xs2 ma-0 pa-0 align-right>
                <v-checkbox
                  v-model="excludeQueryCheckBox"
                  :value="query"
                  :disabled="!isEnableExclusion"
                />
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
      <div class="head-label">
        {{ $store.getters.message("config-view.exclude-compare-tags") }}
      </div>
      <v-flex style="width: 150px" v-for="tag in tagList" v-bind:key="tag" pa-1>
        <v-card class="ma-1 pa-1" color="#EEE">
          <v-card-text class="my-0 py-0">
            <v-layout align-center ma-0 pa-0>
              <v-flex xs10 ma-0 pa-0 class="tagName">
                {{ tag }}
              </v-flex>
              <v-flex xs2 ma-0 pa-0 align-right>
                <v-checkbox
                  v-model="excludeTagCheckBox"
                  :value="tag"
                  :disabled="!isEnableExclusion"
                />
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class CompareSetting extends Vue {
  private exclusionTagMap = new Map();
  private exclusionQueryMap = new Map();
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

  private tagList = this.$store.state.operationHistory.defaultTagList;

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

  private get excludeQueryCheckBox() {
    this.initExclusionQueryMap();
    const excludeQueries =
      this.$store.state.operationHistory.config.compare.exclude.query.split(
        ","
      ) ?? [];
    excludeQueries.forEach((query: string) => {
      this.exclusionQueryMap.set(query, true);
    });
    return excludeQueries;
  }

  private set excludeQueryCheckBox(list: string[]) {
    const tmpList = list.filter((item) => {
      return item !== "";
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

  private get excludeTagCheckBox() {
    this.initExclusionTagMap();
    const excludeTags =
      this.$store.state.operationHistory.config.compare.exclude.tags.split(
        ","
      ) ?? [];
    excludeTags.forEach((tag: string) => {
      this.exclusionTagMap.set(tag, true);
    });
    return excludeTags;
  }

  private set excludeTagCheckBox(list: string[]) {
    const tmpList = list.filter((item) => {
      return item !== "";
    });
    console.log(tmpList);
    console.log(list);
    const tagText = tmpList.length > 0 ? tmpList.join(",") : "";
    console.log(tagText);
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

  private initExclusionQueryMap() {
    const queryMap = new Map();
    this.queries.forEach((query: string) => {
      queryMap.set(query, false);
    });
    this.exclusionQueryMap = queryMap;
  }

  private initExclusionTagMap() {
    const tagyMap = new Map();
    this.$store.state.operationHistory.defaultTagList.forEach((tag: string) => {
      tagyMap.set(tag, false);
    });
    this.exclusionTagMap = tagyMap;
  }
}
</script>

<style lang="sass" scoped>
.tagName
  word-break: break-all

.head-label
  width: 100%
  padding-left: 5px
</style>

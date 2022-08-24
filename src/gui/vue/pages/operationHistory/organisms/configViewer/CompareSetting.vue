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
      <v-flex xs12>
        <v-text-field
          single-line
          :label="$store.getters.message('config-view.exclude-compare-query')"
          v-model="excludeQuery"
          @change="changeExcludeQuery"
          :disabled="!isEnableExclusion"
        ></v-text-field>
      </v-flex>
      <v-flex xs12>
        <v-text-field
          single-line
          :label="$store.getters.message('config-view.exclude-compare-tags')"
          v-model="excludeTags"
          @change="changeExcludeTags"
          :disabled="!isEnableExclusion"
        ></v-text-field>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class CompareSetting extends Vue {
  private tagText = "";
  private queryText = "";

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

  private get excludeQuery(): string {
    return this.$store.state.operationHistory.config.compare.exclude.query;
  }

  private set excludeQuery(query: string) {
    this.queryText = query;
  }

  private get excludeTags(): string {
    return this.$store.state.operationHistory.config.compare.exclude.tags;
  }

  private set excludeTags(tags: string) {
    this.tagText = tags;
  }

  private changeExcludeTags() {
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
              tags: this.tagText,
            },
          },
        },
      });
    })();
  }

  private changeExcludeQuery() {
    (async () => {
      await this.$store.dispatch("operationHistory/writeSettings", {
        config: {
          compare: {
            exclude: {
              isEnabled:
                this.$store.state.operationHistory.config.compare.exclude
                  .isEnabled,
              query: this.queryText,
              tags: this.$store.state.operationHistory.config.compare.exclude
                .tags,
            },
          },
        },
      });
    })();
  }
}
</script>

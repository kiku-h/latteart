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
  <v-container fluid class="fill-height pa-0">
    <iframe style="width: 100%; height: 100%" :src="historyPageUrl" frameborder="0"></iframe>
  </v-container>
</template>

<script lang="ts">
import { type Story } from "@/lib/testManagement/types";
import { useTestManagementStore } from "@/stores/testManagement";
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  setup() {
    const testManagementStore = useTestManagementStore();
    const route = useRoute();
    const rootStore = useRootStore();

    const querySessionId = computed(() => {
      const sessionId = route.query.sessionIds?.at(0)?.toString() ?? "";
      return sessionId;
    });

    const tempStory = computed(() => {
      return testManagementStore.tempStory as Story;
    });

    const historyPageUrl = computed(() => {
      const storyId = tempStory.value.id;
      const sessionId = querySessionId.value;

      return `data/${storyId}/${sessionId}/index.html`;
    });

    rootStore.changeWindowTitle({
      title: rootStore.message(route.meta?.title ?? "")
    });

    return {
      historyPageUrl
    };
  }
});
</script>

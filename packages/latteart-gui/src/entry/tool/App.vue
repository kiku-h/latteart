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
  <v-app>
    <error-handler>
      <router-view></router-view>
    </error-handler>
  </v-app>
</template>

<script lang="ts">
import ErrorHandler from "@/ErrorHandler.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    "error-handler": ErrorHandler,
  },
})
export default class App extends Vue {
  private created() {
    if (this.$route.query.capture) {
      this.$store.commit("setCaptureClServiceDispatcherConfig", {
        serviceUrl: this.$route.query.capture,
      });
    }

    if (this.$route.query.repository) {
      this.$store.commit("setRepositoryServiceUrl", {
        url: this.$route.query.repository,
      });
    }
  }
}
</script>

<style lang="sass">
html
  overflow-y: auto !important
</style>

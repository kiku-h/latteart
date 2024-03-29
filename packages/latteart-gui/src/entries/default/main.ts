/**
 * Copyright 2023 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createApp } from "vue";
import App from "./App.vue";
import { collectPlugins } from "@/plugins";
import { useRootStore } from "@/stores/root";
import i18n from "@/plugins/i18n";
import { RESTClientImpl, createRepositoryService } from "latteart-client";
import { RepositoryDataLoader } from "@/lib/common/dataLoader";
import type { I18nProvider } from "@/lib/common/internationalization";

const app = createApp(App);
const plugins = collectPlugins("default");

for (const plugin of plugins) {
  app.use(plugin);
}

// initialize store
const i18nProvider: I18nProvider = {
  message(message: string, args?: { [key: string]: string }) {
    return i18n.global.t(message, args ?? {});
  },

  getLocale() {
    return i18n.global.locale;
  },

  setLocale(locale) {
    i18n.global.locale = locale;
  }
};
const repositoryService = createRepositoryService(new RESTClientImpl("http://127.0.0.1:3002"));

const rootStore = useRootStore();
rootStore.i18nProvider = i18nProvider;
rootStore.repositoryService = repositoryService;
rootStore.dataLoader = new RepositoryDataLoader(repositoryService);

app.mount("#app");

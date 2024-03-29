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

import PageFrame from "@/components/pages/PageFrame.vue";
import RootPage from "@/components/pages/RootPage.vue";
import StartCapturePage from "@/components/pages/startCapture/StartCapturePage.vue";

const defaultRoutes = [
  {
    path: "/",
    name: "root",
    component: RootPage,
    children: [
      {
        path: "page",
        name: "pageFrame",
        component: PageFrame,
        children: [
          {
            path: "start",
            component: StartCapturePage,
            meta: { title: "start-capture-page.title" }
          }
        ]
      }
    ]
  }
];

export default defaultRoutes;

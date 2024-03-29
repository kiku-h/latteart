<!--
 Copyright 2023 NTT Corporation.

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
  <v-data-table
    :headers-length="headersLength"
    :items="items"
    :headers="addedPaddingCellheaders"
    :header-props="{
      'sort-icon': sortIcon
    }"
    :hide-default-header="hideDefaultHeader"
    :hide-default-footer="hideActions"
    v-model:options="optionsSync"
  >
    <template v-for="(slot, name) of $slots" #[name]="props">
      <slot :name="name" v-bind="props"></slot>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  props: {
    headersLength: { type: Number, default: undefined },
    items: { type: Array, default: [] },
    headers: {
      type: Array as PropType<
        {
          value?: string;
          align?: string;
          sortable?: boolean;
          class?: string[];
          text?: string;
          width?: string;
        }[]
      >,
      default: []
    },
    sortIcon: { type: String, default: undefined },
    hideActions: { type: Boolean, default: false },
    options: {
      type: Object as PropType<{
        page: number;
        itemsPerPage: number;
        sortBy: string[];
        sortDesc: boolean[];
        groupBy: string[];
        groupDesc: boolean[];
        multiSort: boolean;
        mustSort: boolean;
      }>,
      default: undefined
    },
    gridColumnNumber: { type: Number, default: 7 },
    hideDefaultHeader: { type: Boolean, default: false }
  },
  setup(props, context) {
    const optionsSync = computed({
      get: (): {
        page: number;
        itemsPerPage: number;
        sortBy: string[];
        sortDesc: boolean[];
        groupBy: string[];
        groupDesc: boolean[];
        multiSort: boolean;
        mustSort: boolean;
      } => props.options,
      set: (value: {
        page: number;
        itemsPerPage: number;
        sortBy: string[];
        sortDesc: boolean[];
        groupBy: string[];
        groupDesc: boolean[];
        multiSort: boolean;
        mustSort: boolean;
      }) => {
        context.emit("update:options", value);
      }
    });

    const addedPaddingCellheaders = computed(
      (): {
        value?: string;
        align?: string;
        sortable?: boolean;
        class?: string[];
        text?: string;
        width?: string;
      }[] => {
        const result = props.headers.map((header) => header);
        if (result.length < props.gridColumnNumber) {
          result.push({ sortable: false });
        }

        return result;
      }
    );

    return { optionsSync, addedPaddingCellheaders };
  }
});
</script>

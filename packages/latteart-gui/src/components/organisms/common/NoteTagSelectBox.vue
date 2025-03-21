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
  <v-combobox
    v-model="selectedTags"
    v-model:search="search"
    :label="label"
    :hide-no-data="!search"
    :items="tagSelectionItems"
    multiple
    closable-chips
    chips
    hide-selected
    :readonly="readonly"
    variant="underlined"
  >
    <template #no-data>
      <v-list-item>
        <v-list-item-title>
          No results matching "<strong>{{ search }}</strong
          >". Press <kbd>enter</kbd> to create a new one
        </v-list-item-title>
      </v-list-item>
    </template>
    <template #chip="{ item, index }">
      <v-chip
        :color="getChipColor(item.raw)"
        variant="elevated"
        @click:close="selectedTags.splice(index, 1)"
      >
        <span class="pr-2">{{ item.raw }} </span>
      </v-chip>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import { defaultNoteTagColor, noteTagPreset } from "@/lib/operationHistory/NoteTagPreset";
import { defineComponent, ref, watch, type PropType } from "vue";

export default defineComponent({
  props: {
    label: { type: String, default: "" },
    modelValue: { type: Array as PropType<string[]>, default: () => [], required: true },
    readonly: { type: Boolean, default: false }
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const selectedTags = ref<string[]>(props.modelValue);
    const search = ref(null);
    const tagSelectionItems = ref(noteTagPreset.items.map(({ text }) => text));

    const getChipColor = (text: string) => {
      return noteTagPreset.items.find((item) => item.text === text)?.color ?? defaultNoteTagColor;
    };

    watch(selectedTags, (newTags) => {
      context.emit("update:modelValue", newTags);
    });

    return {
      search,
      selectedTags,
      tagSelectionItems,
      getChipColor
    };
  }
});
</script>

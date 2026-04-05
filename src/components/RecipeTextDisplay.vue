<template>
  <div class="recipe-display">
    <div v-if="recipes.length === 0" class="no-recipes">
      No recipes found
    </div>
    <div v-else class="recipes-list">
      <div
        v-for="(recipe, index) in recipes"
        :key="index"
        class="recipe-item"
      >
        <button
          :class="['recipe-header', { expanded: expandedIndex === index }]"
          @click="toggleRecipe(index)"
        >
          <span class="toggle-icon">{{ expandedIndex === index ? '▼' : '▶' }}</span>
          Recipe {{ index + 1 }}
        </button>
        <div v-if="expandedIndex === index" class="recipe-json">
          <VueJsonPretty
            :data="recipe"
            :deep="3"
            :show-length="true"
            show-line-numbers
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import '@/styles/colors.css'
import type { Recipe } from '@/types'

defineProps<{
  recipes: Recipe[]
}>()

const expandedIndex = ref<number | null>(null)

const toggleRecipe = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}
</script>

<style scoped>
.recipe-display {
  flex: 1;
  overflow-y: auto;
}

.no-recipes {
  color: var(--color-text-muted);
  padding: 16px;
  text-align: center;
}

.recipes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recipe-item {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.recipe-header {
  width: 100%;
  padding: 12px 16px;
  background: var(--color-bg-primary);
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  transition: background-color 0.2s;
  text-align: left;
}

.recipe-header:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-white);
}

.recipe-header.expanded {
  background: var(--color-bg-active);
  color: var(--color-text-white);
}

.toggle-icon {
  display: inline-block;
  font-size: 10px;
  min-width: 12px;
}

.recipe-json {
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  padding: 16px;
  overflow-x: auto;
}
</style>

<style>
/* Override vue-json-pretty styles for dark theme */
:deep(.vjs-tree) {
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: var(--color-text-secondary);
}

:deep(.vjs-key) {
  color: var(--color-json-key);
}

:deep(.vjs-value.vjs-string) {
  color: var(--color-json-string);
}

:deep(.vjs-value.vjs-number) {
  color: var(--color-json-number);
}

:deep(.vjs-value.vjs-boolean) {
  color: var(--color-json-boolean);
}

:deep(.vjs-value.vjs-null) {
  color: var(--color-json-boolean);
}

:deep(.vjs-line-number) {
  color: var(--color-text-muted);
}

:deep(.vjs-indent) {
  background-color: transparent;
}
</style>

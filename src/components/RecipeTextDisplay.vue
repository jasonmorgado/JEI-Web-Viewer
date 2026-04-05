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
        <div class="recipe-header">
          <span class="recipe-title">Recipe {{ index + 1 }}</span>
        </div>

        <div class="recipe-slots">
          <div class="slots-container">
            <div class="slots-section">
              <h3 class="slots-label">Input</h3>
              <div class="slots-grid" :style="getGridStyle(recipe)">
                <div
                  v-for="(slot, slotIndex) in getSlotsByRole(recipe, 'INPUT')"
                  :key="slotIndex"
                  class="slot"
                  @click="slot.items.length > 0 && $emit('select-output', getFullItemId(getCurrentItem(slot)!.item))"
                  @contextmenu.prevent="slot.items.length > 0 && $emit('select-input', getFullItemId(getCurrentItem(slot)!.item))"
                >
                  <div v-if="slot.items.length > 0" class="item-stack">
                    <div class="item-name">{{ getCurrentItem(slot)?.name }}</div>
                    <div class="item-count" v-if="(getCurrentItem(slot)?.count ?? 1) > 1">
                      ×{{ getCurrentItem(slot)?.count }}
                    </div>
                  </div>
                  <div v-else class="empty-slot">-</div>
                </div>
              </div>
            </div>

            <div class="slots-section">
              <h3 class="slots-label">Output</h3>
              <div class="slots-grid" :style="getGridStyle(recipe)">
                <div
                  v-for="(slot, slotIndex) in getSlotsByRole(recipe, 'OUTPUT')"
                  :key="slotIndex"
                  class="slot"
                  @click="slot.items.length > 0 && $emit('select-output', getFullItemId(getCurrentItem(slot)!.item))"
                  @contextmenu.prevent="slot.items.length > 0 && $emit('select-input', getFullItemId(getCurrentItem(slot)!.item))"
                >
                  <div v-if="slot.items.length > 0" class="item-stack">
                    <div class="item-name">{{ getCurrentItem(slot)?.name }}</div>
                    <div class="item-count" v-if="(getCurrentItem(slot)?.count ?? 1) > 1">
                      ×{{ getCurrentItem(slot)?.count }}
                    </div>
                  </div>
                  <div v-else class="empty-slot">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          :class="['json-toggle', { expanded: expandedIndex === index }]"
          @click="toggleRecipe(index)"
        >
          <span class="toggle-icon">{{ expandedIndex === index ? '▼' : '▶' }}</span>
          View Recipe JSON
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import '@/styles/colors.css'
import type { Recipe, Role, Slot } from '@/types'
import { useRecipeIndexStore } from '@/stores/recipeIndex'

const store = useRecipeIndexStore()

defineProps<{
  recipes: Recipe[]
}>()

defineEmits<{
  'select-input': [itemId: string]
  'select-output': [itemId: string]
}>()

const expandedIndex = ref<number | null>(null)
const currentItemIndex = ref(0)
let itemCycleInterval: NodeJS.Timeout | null = null

const getSlotsByRole = (recipe: Recipe, role: Role): Slot[] => {
  return recipe.slots.filter(slot => slot.role === role)
}

const getGridStyle = (recipe: Recipe) => {
  // If a Recipe has maxWidth, use it to enforce grid column count.
  const maxWidth = recipe.MAX_WIDTH as number | undefined
  if (maxWidth && maxWidth > 0) {
    return { gridTemplateColumns: `repeat(${maxWidth}, minmax(80px, 1fr))` }
  }
  return {}
}

const getCurrentItem = (slot: Slot) => {
  if (slot.items.length === 0) return null
  return slot.items[currentItemIndex.value % slot.items.length]
}

const getFullItemId = (shortId: string) => {
  // Try to find the full item ID from the items list
  const item = store.items?.find(item => item.id.endsWith(':' + shortId) || item.id === shortId)
  return item?.id || shortId
}

const toggleRecipe = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

onMounted(() => {
  itemCycleInterval = setInterval(() => {
    currentItemIndex.value++
  }, 2000)
})

onBeforeUnmount(() => {
  if (itemCycleInterval) {
    clearInterval(itemCycleInterval)
  }
})
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
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.recipe-title {
  font-weight: 600;
}

.recipe-slots {
  padding: 16px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.slots-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.slots-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slots-label {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.slot {
  padding: 8px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.slot:has(.item-stack):hover {
  background-color: var(--color-bg-hover);
}

.item-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.item-name {
  font-size: 11px;
  color: var(--color-text-primary);
  word-break: break-word;
  line-height: 1.3;
}

.item-count {
  font-size: 10px;
  color: var(--color-text-muted);
  font-weight: 600;
}

.empty-slot {
  color: var(--color-text-muted);
  font-size: 14px;
}

.json-toggle {
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

.json-toggle:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-white);
}

.json-toggle.expanded {
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

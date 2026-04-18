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
        <div class="recipe-slots">
          <div class="slots-container">
            <div class="slots-section">
              <h3 class="slots-label">Input</h3>
              <div class="slots-grid" :style="getGridStyle(recipe)">
                <SlotDisplay
                  v-for="(slot, slotIndex) in getSlotsByRole(recipe, 'INPUT')"
                  :key="slotIndex"
                  :slot="slot"
                  :current-item-index="currentItemIndex"
                  @select-output="$emit('select-output', $event)"
                  @select-input="$emit('select-input', $event)"
                />
              </div>
            </div>

            <div class="slots-section">
              <h3 class="slots-label">Output</h3>
              <div class="slots-grid" :style="getGridStyle(recipe)">
                <SlotDisplay
                  v-for="(slot, slotIndex) in getSlotsByRole(recipe, 'OUTPUT')"
                  :key="slotIndex"
                  :slot="slot"
                  :current-item-index="currentItemIndex"
                  @select-output="$emit('select-output', $event)"
                  @select-input="$emit('select-input', $event)"
                />
              </div>
            </div>
          </div>

          <button class="json-button" @click="openJsonModal(recipe)">
            {...}
          </button>
        </div>
      </div>
    </div>

    <JsonModal :is-open="isModalOpen" :data="modalRecipe" @close="closeJsonModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import '@/styles/colors.css'
import type { Recipe, Role, Slot } from '@/types'
import SlotDisplay from './SlotDisplay.vue'
import JsonModal from './JsonModal.vue'

defineProps<{
  recipes: Recipe[]
}>()

defineEmits<{
  'select-input': [itemId: string]
  'select-output': [itemId: string]
}>()

const currentItemIndex = ref(0)
let itemCycleInterval: ReturnType<typeof setInterval> | null = null
const isModalOpen = ref(false)
const modalRecipe = ref<Recipe | null>(null)

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

const openJsonModal = (recipe: Recipe) => {
  modalRecipe.value = recipe
  isModalOpen.value = true
}

const closeJsonModal = () => {
  isModalOpen.value = false
  modalRecipe.value = null
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

.recipe-slots {
  padding: 16px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  position: relative;
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

.json-button {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 8px 12px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.json-button:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-white);
  border-color: var(--color-border-dark);
}

/* On mobile devices, hide the JSON button, and put Output under Input slots. */
@media (max-width: 768px) {
  .json-button {
    display: none;
  }

  .slots-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>

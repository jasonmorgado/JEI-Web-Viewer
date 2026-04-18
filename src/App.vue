<script setup lang="ts">
import TextItemListPanel from './components/TextItemListPanel.vue'
import RecipeDisplay from './components/RecipeDisplay.vue'
import Toast from './components/Toast.vue'
import '@/styles/colors.css'
import { onMounted, ref, computed, watch } from 'vue'
import { useRecipeIndexStore } from '@/stores/recipeIndex'
import type { ItemId, Role, Recipe } from '@/types'

const store = useRecipeIndexStore()
onMounted(() => store.load())

const selectedItem = ref<ItemId | null>(null)
const selectedRole = ref<Role | null>(null)
const selectedRecipeType = ref<string | null>(null)
const currentRecipes = ref<Recipe[]>([])
const loadingRecipes = ref(false)

// When left clicking an item, we want to get recipes that OUTPUT it.
const handleItemSelectedOutput = (itemId: ItemId) => {
  const isNewSelection = selectedItem.value !== itemId || selectedRole.value !== 'OUTPUT'
  selectedItem.value = itemId
  selectedRole.value = 'OUTPUT'
  if (isNewSelection) {
    selectedRecipeType.value = null
  }
  isMobileMenuOpen.value = false
}

// When right-clicking an item, we want to get recipes that take it as INPUT.
const handleItemSelectedInput = (itemId: ItemId) => {
  const isNewSelection = selectedItem.value !== itemId || selectedRole.value !== 'INPUT'
  selectedItem.value = itemId
  selectedRole.value = 'INPUT'
  if (isNewSelection) {
    selectedRecipeType.value = null
  }
  isMobileMenuOpen.value = false
}

// When selecting from the dropdown, clear item selection
const handleRecipeTypeSelected = (recipeType: string) => {
  selectedRecipeType.value = recipeType || null
  if (recipeType) {
    selectedItem.value = null
    selectedRole.value = null
    isMobileMenuOpen.value = false
  }
}

function getRecipeList(recipeType: string, itemUid: ItemId | null, role: Role | null, allRecipes: Recipe[]): Recipe[] {
  if (!itemUid || !role) {
    return allRecipes
  }
  const recipeIndices = store.recipeIndex?.[recipeType]?.[itemUid]?.[role] ?? []
  return recipeIndices
    .map(idx => allRecipes[idx])
    .filter((r): r is Recipe => r !== undefined)
}

async function loadAndDisplayRecipes() {
  if (!selectedRecipeType.value) {
    currentRecipes.value = []
    return
  }

  loadingRecipes.value = true
  try {
    const allRecipes = await store.loadRecipesForType(selectedRecipeType.value)
    currentRecipes.value = getRecipeList(selectedRecipeType.value, selectedItem.value, selectedRole.value, allRecipes)
  } finally {
    loadingRecipes.value = false
  }
}

// Hamburger menu for opening Itemlist on mobile
const isMobileMenuOpen = ref(false)

const allRecipeTypes = computed(() => store.allRecipeTypes)

const availableRecipeTypes = computed(() => {
  if (!selectedItem.value || !selectedRole.value) return []
  return store.recipeTypesFor(selectedItem.value, selectedRole.value)
})

// Auto-select first recipe type when available (only for item-based selection, not dropdown selection)
watch(
  availableRecipeTypes,
  (types) => {
    if (types.length > 0 && !selectedRecipeType.value && selectedItem.value) {
      selectedRecipeType.value = types[0]
    }
  }
)

// Load recipes when recipe type, item, or role changes
watch(
  [selectedRecipeType, selectedItem, selectedRole],
  () => {
    loadAndDisplayRecipes()
  }
)
</script>

<template>
  <Toast />
  <div class="layout">
    <button class="mobile-menu-toggle" @click="isMobileMenuOpen = !isMobileMenuOpen" title="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <aside class="sidebar-left">
      <h2 class="sidebar-title">Data Size</h2>
      <p class="data-size-info">{{ store.totalDataSize }}</p>
    </aside>
    <main class="main">
      <h2 class="main-title">Main</h2>
      <div class="recipe-type-filter">
        <label for="recipe-type-dropdown">View All Recipes By Type:</label>
        <select
          id="recipe-type-dropdown"
          :value="selectedItem ? '' : selectedRecipeType"
          @change="(e) => handleRecipeTypeSelected((e.target as HTMLSelectElement).value)"
          class="recipe-type-dropdown"
        >
          <option value="">-- Select a recipe type --</option>
          <option v-for="type in allRecipeTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
      <div v-if="selectedItem" class="recipe-tabs">
        <button
          v-for="recipeType in availableRecipeTypes"
          :key="recipeType"
          :class="['tab', { active: selectedRecipeType === recipeType }]"
          @click="selectedRecipeType = recipeType"
        >
          {{ recipeType }}
        </button>
      </div>
      <div v-if="selectedRecipeType && selectedItem" class="main-content">
        <p class="item-info">{{ selectedItem }} · {{ selectedRole }}</p>
        <p class="recipe-type-info">Recipe Type: {{ selectedRecipeType }}</p>
        <div v-if="loadingRecipes" class="loading">Loading recipes...</div>
        <RecipeDisplay v-else :recipes="currentRecipes" @select-output="handleItemSelectedOutput" @select-input="handleItemSelectedInput" />
      </div>
      <div v-else-if="selectedRecipeType" class="main-content">
        <p class="recipe-type-info">Recipe Type: {{ selectedRecipeType }}</p>
        <div v-if="loadingRecipes" class="loading">Loading recipes...</div>
        <RecipeDisplay v-else :recipes="currentRecipes" @select-output="handleItemSelectedOutput" @select-input="handleItemSelectedInput" />
      </div>
      <div v-else-if="selectedItem" class="main-content">
        <p class="item-info">{{ selectedItem }} · {{ selectedRole }}</p>
        <p class="select-recipe-type">Select a recipe type above</p>
      </div>
      <p v-else class="no-selection">
        Select a recipe type or item to view recipes
      </p>
    </main>
    <TextItemListPanel
      class="sidebar-right"
      :class="{ open: isMobileMenuOpen }"
      @item-selected-output="handleItemSelectedOutput"
      @item-selected-input="handleItemSelectedInput"
    />
  </div>
</template>
<style scoped>
.layout {
  display: flex;
  height: 100dvh;
  background: var(--color-bg-secondary);
  position: relative;
  overflow: hidden;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 100;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  width: 40px;
  height: 40px;
}

.mobile-menu-toggle span {
  width: 24px;
  height: 2px;
  background: var(--color-text-primary);
  border-radius: 1px;
  transition: all 0.3s;
}

.sidebar-left {
  flex: 1;
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
  padding: 16px;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
.sidebar-title {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.data-size-info {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  font-family: monospace;
}
.main {
  flex: 2;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
.main-title {
  margin: 0 0 16px 0;
  font-size: 16px;
}
.recipe-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 12px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-dark);
  border-bottom: none;
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  font-size: 12px;
  transition: all 0.2s;
}

.tab:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-white);
}

.tab.active {
  background-color: var(--color-bg-active);
  color: white;
  border-color: var(--color-bg-active);
}

.item-info {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-white);
}

.recipe-type-info {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.no-selection {
  color: var(--color-text-muted);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.select-recipe-type {
  color: var(--color-text-muted);
  margin: 0;
}

.loading {
  color: var(--color-text-secondary);
  padding: 16px;
}

.recipe-type-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.recipe-type-dropdown {
  padding: 6px 8px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 12px;
  cursor: pointer;
  flex: 1;
  max-width: 300px;
}

.recipe-type-dropdown:hover {
  border-color: var(--color-border-dark);
}

.recipe-type-dropdown:focus {
  outline: none;
  border-color: var(--color-bg-active);
  box-shadow: 0 0 0 2px rgba(100, 150, 255, 0.1);
}

/* Mobile Version behaviors */
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .main {
    padding-top: 60px;
    flex: 1;
  }

  .sidebar-left {
    display: none;
  }

  .sidebar-right {
    position: absolute;
    top: 0;
    right: 0;
    width: 70%;
    max-width: 300px;
    height: 100%;
    border-left: 1px solid var(--color-border);
    z-index: 99;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .sidebar-right.open {
    transform: translateX(0);
  }

  .recipe-tabs {
    gap: 2px;
    margin-bottom: 8px;
  }

  .tab {
    padding: 6px 8px;
    font-size: 11px;
  }
}
</style>

<style>
:deep(.text-item-list-panel) {
  flex: 1;
}

@media (max-width: 768px) {
  :deep(.text-item-list-panel) {
    position: absolute;
    top: 0;
    right: 0;
    width: 70%;
    max-width: 300px;
    height: 100%;
    flex: none;
  }
}
</style>
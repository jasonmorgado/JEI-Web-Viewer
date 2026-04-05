<template>
  <aside class="text-item-list-panel" ref="containerRef">
    <div class="panel-content">
      <div class="pagination">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ← Prev
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next →
        </button>
      </div>

      <div class="items-list">
        <TextItemListItem
          v-for="itemId in paginatedItems"
          :key="itemId"
          :itemId="itemId"
          @select-input="$emit('item-selected-input', $event)"
          @select-output="$emit('item-selected-output', $event)"
        />
      </div>

      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter items..."
          class="search-input"
        />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRecipeIndexStore } from '@/stores/recipeIndex'
import '@/styles/colors.css'
import type { ItemId } from '@/types'
import TextItemListItem from './TextItemListItem.vue'

const store = useRecipeIndexStore()

defineEmits<{
  'item-selected-input': [itemId: ItemId]
  'item-selected-output': [itemId: ItemId]
}>()
const currentPage = ref(1)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)
const itemsPerPage = ref(10)

const calculateItemsPerPage = () => {
  if (!containerRef.value) return

  const container = containerRef.value
  const panelHeight = container.clientHeight

  // Approximate heights
  const paginationHeight = 50
  const searchBarHeight = 50
  const availableHeight = panelHeight - paginationHeight - searchBarHeight

  // Each item is approximately 30px tall (including border and padding)
  const itemHeight = 30
  const itemsToShow = Math.max(3, Math.floor(availableHeight / itemHeight * 0.6 + 1))
  // Magic numbers to make the list not overflow and look good at scale.

  itemsPerPage.value = itemsToShow
}

onMounted(() => {
  calculateItemsPerPage()

  const resizeObserver = new ResizeObserver(() => {
    calculateItemsPerPage()
  })

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const filteredItems = computed(() => {
  if (!searchQuery.value) return store.allItemIds
  return store.allItemIds.filter(id =>
    id.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => {
  const itemCount = filteredItems.value.length
  const perPage = itemsPerPage.value || 10
  return itemCount === 0 ? 1 : Math.ceil(itemCount / perPage)
})

const paginatedItems = computed(() => {
  const perPage = itemsPerPage.value || 10
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return filteredItems.value.slice(start, end)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}
</script>

<style scoped>
.text-item-list-panel {
  flex: 1;
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg-secondary);
}

.panel-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
}

.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.items-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.search-bar {
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
}

.pagination-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border-dark);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  color: var(--color-text-white);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border-dark);
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-bg-active);
  box-shadow: 0 0 0 2px rgba(170, 59, 255, 0.2);
  background: var(--color-bg-hover);
  color: var(--color-text-white);
}
</style>

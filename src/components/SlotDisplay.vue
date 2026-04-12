<template>
  <div
    class="slot"
    @click="handleClick"
    @contextmenu.prevent="handleContextMenu"
  >
    <div v-if="slot.items.length > 0" class="item-stack">
      <img :src="iconUrl" class="item-icon" @error="onIconError" v-show="iconVisible" :title="getCurrentItem()?.name" />
      <div class="item-name">{{ getCurrentItem()?.name }}</div>
      <div class="item-count" v-if="(getCurrentItem()?.count ?? 1) > 1">
        ×{{ getCurrentItem()?.count }}
      </div>
    </div>
    <div v-else class="empty-slot">-</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Slot } from '@/types'
import { useRecipeIndexStore } from '@/stores/recipeIndex'

const props = defineProps<{
  slot: Slot
  currentItemIndex: number
}>()

const emit = defineEmits<{
  'select-input': [itemId: string]
  'select-output': [itemId: string]
}>()

const store = useRecipeIndexStore()
const iconVisible = ref(true)

const getCurrentItem = () => {
  if (props.slot.items.length === 0) return null
  return props.slot.items[props.currentItemIndex % props.slot.items.length]
}

const iconUrl = computed(() => {
  const item = getCurrentItem()
  if (!item) return ''
  return new URL(`../static/extracted-icons/${item.uid}.png`, import.meta.url).href
})

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

const onIconError = () => { iconVisible.value = false }

const handleClick = () => {
  if (props.slot.items.length > 0) {
    const item = getCurrentItem()!
    emit('select-output', item.uid)
  }
}

const handleContextMenu = () => {
  if (props.slot.items.length > 0) {
    const item = getCurrentItem()!
    emit('select-input', item.uid)
  }
}

onMounted(async () => {
  const item = getCurrentItem()
  if (!item || !iconUrl.value) return

  const exists = await checkIconExists(iconUrl.value)
  if (!exists) {
    iconVisible.value = false
    return
  }

  try {
    const response = await fetch(iconUrl.value)
    const blob = await response.blob()
    store.registerIconSize(item.uid, blob.size)
  } catch {
    // Icon fetch failed, just skip size tracking
  }
})
</script>

<style scoped>
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

.item-icon {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
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
</style>

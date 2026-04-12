<template>
  <div
    class="item"
    @click="$emit('select-output', itemId)"
    @contextmenu.prevent="$emit('select-input', itemId)"
  >
    <img :src="iconUrl" class="item-icon" @error="onIconError" v-show="iconVisible" />
    <span class="item-label">{{ itemId }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import '@/styles/colors.css'
import type { ItemId } from '@/types'
import { useRecipeIndexStore } from '@/stores/recipeIndex'

const props = defineProps<{
  itemId: ItemId
}>()

defineEmits<{
  'select-input': [itemId: ItemId]
  'select-output': [itemId: ItemId]
}>()

const store = useRecipeIndexStore()
const iconUrl = new URL(`../static/extracted-icons/${props.itemId}.png`, import.meta.url).href
const iconVisible = ref(true)

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

const onIconError = () => { iconVisible.value = false }

onMounted(async () => {
  const exists = await checkIconExists(iconUrl)
  if (!exists) {
    iconVisible.value = false
    return
  }

  try {
    const response = await fetch(iconUrl)
    const blob = await response.blob()
    store.registerIconSize(props.itemId, blob.size)
  } catch {
    // Icon fetch failed, just skip size tracking
  }
})
</script>

<style scoped>
.item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  color: var(--color-text-primary);
}

.item:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-white);
}

.item-icon {
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
  flex-shrink: 0;
}

.item-label {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

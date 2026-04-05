<template>
  <div
    class="item"
    @click="$emit('select-output', itemId)"
    @contextmenu.prevent="$emit('select-input', itemId)"
  >
    {{ itemId }}
  </div>
</template>

<script setup lang="ts">
import '@/styles/colors.css'
import type { ItemId } from '@/types'

defineProps<{
  itemId: ItemId
}>()

defineEmits<{
  'select-input': [itemId: ItemId]
  'select-output': [itemId: ItemId]
}>()
</script>

<style scoped>
.item {
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  color: var(--color-text-primary);
}

.item:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-white);
}
</style>

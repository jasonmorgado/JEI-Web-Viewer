<template>
  <div class="item">
    {{ itemId }}
  </div>
</template>

<script setup lang="ts">
import type { ItemId } from '@/types'

defineProps<{
  itemId: ItemId
}>()
</script>

<style scoped>
.item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.item:hover {
  background-color: #f9f9f9;
}
</style>

<template>
  <aside class="text-panel">
    <div class="panel-content">
      <!-- Text items will go here -->
    </div>
  </aside>
</template>

<script setup lang="ts">
import '@/styles/colors.css'
</script>

<style scoped>
.text-panel {
  width: 25%;
  border-left: 1px solid var(--color-border-light);
  overflow-y: auto;
}

.panel-content {
  padding: 16px;
}
</style>

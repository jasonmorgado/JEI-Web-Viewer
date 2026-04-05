<template>
  <aside class="text-list-panel">
    <div class="panel-content">
      <!-- Text list items will go here -->
    </div>
  </aside>
</template>

<script setup lang="ts">
import '@/styles/colors.css'
</script>

<style scoped>
.text-list-panel {
  width: 25%;
  border-left: 1px solid var(--color-border-light);
  overflow-y: auto;
}

.panel-content {
  padding: 16px;
}
</style>

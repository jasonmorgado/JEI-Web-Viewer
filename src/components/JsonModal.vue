<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Recipe JSON</h2>
        <button class="modal-close" @click="handleClose">✕</button>
      </div>
      <div class="modal-body">
        <VueJsonPretty
          v-if="data"
          :data="data"
          :deep="3"
          :show-length="true"
          show-line-numbers
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

defineProps<{
  isOpen: boolean
  data: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-bg-primary);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-width: 80vw;
  max-height: 80vh;
  width: 600px;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: var(--color-text-primary);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
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

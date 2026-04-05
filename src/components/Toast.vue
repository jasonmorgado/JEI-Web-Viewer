<script setup lang="ts">
import '@/styles/colors.css'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const getToastClass = (type: string) => {
  return {
    'toast-error': type === 'error',
    'toast-warning': type === 'warning',
    'toast-success': type === 'success',
    'toast-info': type === 'info',
  }
}
</script>

<template>
  <div v-if="toastStore.toasts.length > 0" class="toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="['toast', getToastClass(toast.type)]"
      >
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="toastStore.removeToast(toast.id)">
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

.toast-error {
  background-color: var(--color-toast-error-bg);
  color: white;
  border-left: 4px solid var(--color-toast-error-border);
}

.toast-warning {
  background-color: var(--color-toast-warning-bg);
  color: white;
  border-left: 4px solid var(--color-toast-warning-border);
}

.toast-success {
  background-color: var(--color-toast-success-bg);
  color: white;
  border-left: 4px solid var(--color-toast-success-border);
}

.toast-info {
  background-color: var(--color-toast-info-bg);
  color: white;
  border-left: 4px solid var(--color-toast-info-border);
}

.toast-message {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}
</style>

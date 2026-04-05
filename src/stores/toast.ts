import { defineStore } from 'pinia'

export interface Toast {
  id: string
  message: string
  type: 'error' | 'warning' | 'success' | 'info'
  duration?: number
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),

  actions: {
    addToast(message: string, type: 'error' | 'warning' | 'success' | 'info' = 'info', duration = 5000) {
      const id = Math.random().toString(36).substring(7)
      const toast: Toast = { id, message, type, duration }

      this.toasts.push(toast)

      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id)
        }, duration)
      }

      return id
    },

    removeToast(id: string) {
      const index = this.toasts.findIndex(t => t.id === id)
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    },

    error(message: string, duration?: number) {
      return this.addToast(message, 'error', duration)
    },

    warning(message: string, duration?: number) {
      return this.addToast(message, 'warning', duration)
    },

    success(message: string, duration?: number) {
      return this.addToast(message, 'success', duration)
    },

    info(message: string, duration?: number) {
      return this.addToast(message, 'info', duration)
    },
  },
})

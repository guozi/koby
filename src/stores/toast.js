import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: []
  }),
  actions: {
    add(message, type = 'info', duration = 3000) {
      const id = Date.now() + Math.random()
      this.toasts.push({ id, message, type })
      if (duration > 0) {
        setTimeout(() => this.remove(id), duration)
      }
    },
    remove(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
    success(message) { this.add(message, 'success') },
    error(message) { this.add(message, 'error', 5000) },
    info(message) { this.add(message, 'info') }
  }
})

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium backdrop-blur-sm"
          :class="toastClass(toast.type)"
          role="alert"
        >
          <svg v-if="toast.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="flex-1">{{ toast.message }}</span>
          <button @click="toastStore.remove(toast.id)" class="flex-shrink-0 opacity-60 hover:opacity-100" aria-label="关闭通知">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()
const toasts = computed(() => toastStore.toasts)

function toastClass(type) {
  switch (type) {
    case 'success': return 'bg-green-600 text-white'
    case 'error': return 'bg-red-600 text-white'
    default: return 'bg-gray-800 text-white dark:bg-gray-700'
  }
}
</script>

<style scoped>
.toast-enter-active { animation: toast-in 0.3s ease-out; }
.toast-leave-active { animation: toast-out 0.2s ease-in forwards; }
.toast-move { transition: transform 0.3s ease; }

@keyframes toast-in {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes toast-out {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(100%); }
}
</style>

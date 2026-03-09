<template>
  <div class="space-y-4">
    <!-- Base font size -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.pxremBase') }}</label>
      <input v-model.number="base" type="number" min="1" max="100" class="input font-mono text-sm w-32" />
    </div>

    <!-- Converter -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- PX → REM -->
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.pxremPxToRem') }}</label>
        <input v-model.number="pxVal" type="number" step="0.5" class="input font-mono text-sm" placeholder="16" />
        <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900 mt-2">{{ pxVal ? (pxVal / base).toFixed(4).replace(/\.?0+$/, '') + 'rem' : '' }}</div>
      </div>
      <!-- REM → PX -->
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.pxremRemToPx') }}</label>
        <input v-model.number="remVal" type="number" step="0.125" class="input font-mono text-sm" placeholder="1" />
        <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900 mt-2">{{ remVal ? (remVal * base).toFixed(2).replace(/\.?0+$/, '') + 'px' : '' }}</div>
      </div>
    </div>

    <!-- Batch convert -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.pxremBatch') }}</label>
      <textarea v-model="batchInput" class="input font-mono text-sm resize-none" rows="4" :placeholder="t('toolbox.pxremBatchHint')"></textarea>
      <div v-if="batchOutput" class="mt-2">
        <div class="flex gap-1">
          <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900 flex-1 whitespace-pre-wrap">{{ batchOutput }}</div>
          <button @click="copyResult(batchOutput)" class="btn btn-outline text-sm px-2 self-start">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Reference table -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.pxremRefTable') }}</label>
      <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        <div v-for="px in refSizes" :key="px"
          class="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
          <div class="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{{ px }}px</div>
          <div class="text-xs font-mono text-primary">{{ (px / base).toFixed(4).replace(/\.?0+$/, '') }}rem</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const base = ref(16)
const pxVal = ref(null)
const remVal = ref(null)
const batchInput = ref('')

const refSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 128]

const batchOutput = computed(() => {
  if (!batchInput.value.trim()) return ''
  return batchInput.value.replace(/(\d+(?:\.\d+)?)px/g, (_, n) => {
    return (parseFloat(n) / base.value).toFixed(4).replace(/\.?0+$/, '') + 'rem'
  })
})
</script>

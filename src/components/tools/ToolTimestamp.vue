<template>
  <div class="space-y-4">
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.currentTime') }}</label>
      <div class="flex items-center gap-3">
        <div class="input bg-gray-50 dark:bg-gray-900 font-mono text-sm flex-1">{{ nowTimestamp }}</div>
        <button @click="copyResult(String(nowTimestamp))" class="btn btn-outline text-sm flex-shrink-0">{{ t('toolbox.copy') }}</button>
      </div>
    </div>
    <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.tsToDate') }}</label>
      <div class="flex gap-2">
        <input v-model="tsInput" type="text" class="input font-mono text-sm flex-1" placeholder="1709712000" />
        <button @click="convertTs" class="btn btn-primary text-sm">{{ t('toolbox.convert') }}</button>
      </div>
      <div v-if="tsResult" class="mt-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm font-mono text-gray-700 dark:text-gray-300">{{ tsResult }}</div>
    </div>
    <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.dateToTs') }}</label>
      <div class="flex gap-2">
        <input v-model="dateInput" type="datetime-local" class="input text-sm flex-1" />
        <button @click="convertDate" class="btn btn-primary text-sm">{{ t('toolbox.convert') }}</button>
      </div>
      <div v-if="dateResult !== null" class="mt-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm font-mono text-gray-700 dark:text-gray-300">{{ dateResult }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const nowTimestamp = ref(Math.floor(Date.now() / 1000))
const tsInput = ref('')
const tsResult = ref('')
const dateInput = ref('')
const dateResult = ref(null)
let timer = null

onMounted(() => { timer = setInterval(() => { nowTimestamp.value = Math.floor(Date.now() / 1000) }, 1000) })
onUnmounted(() => { clearInterval(timer) })

function convertTs() {
  const n = Number(tsInput.value)
  if (isNaN(n)) { tsResult.value = 'Invalid timestamp'; return }
  const ms = n > 1e12 ? n : n * 1000
  tsResult.value = new Date(ms).toLocaleString()
}
function convertDate() {
  if (!dateInput.value) return
  dateResult.value = Math.floor(new Date(dateInput.value).getTime() / 1000)
}
</script>

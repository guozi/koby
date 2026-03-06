<template>
  <div class="space-y-3">
    <textarea v-model="input" class="input font-mono text-sm resize-none" rows="3" :placeholder="t('toolbox.inputText')"></textarea>
    <button @click="generate" class="btn btn-primary text-sm">{{ t('toolbox.generate') }}</button>
    <div v-if="results.length" class="space-y-2">
      <div v-for="h in results" :key="h.algo" class="flex items-center gap-2">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 w-14 flex-shrink-0">{{ h.algo }}</span>
        <div class="input font-mono text-xs bg-gray-50 dark:bg-gray-900 flex-1 truncate">{{ h.value }}</div>
        <button @click="copyResult(h.value)" class="btn btn-outline text-xs px-2 flex-shrink-0">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const input = ref('')
const results = ref([])

async function generate() {
  if (!input.value) return
  const encoder = new TextEncoder()
  const data = encoder.encode(input.value)
  const algos = [
    { name: 'SHA-1', algo: 'SHA-1' },
    { name: 'SHA-256', algo: 'SHA-256' },
    { name: 'SHA-384', algo: 'SHA-384' },
    { name: 'SHA-512', algo: 'SHA-512' },
  ]
  const res = []
  for (const a of algos) {
    const buf = await crypto.subtle.digest(a.algo, data)
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    res.push({ algo: a.name, value: hex })
  }
  results.value = res
}
</script>

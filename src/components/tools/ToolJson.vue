<template>
  <div class="space-y-3">
    <div class="flex gap-2 mb-1">
      <button @click="formatJson" class="btn btn-primary text-sm">{{ t('toolbox.format') }}</button>
      <button @click="minifyJson" class="btn btn-outline text-sm">{{ t('toolbox.minify') }}</button>
      <button v-if="output" @click="copyResult(output)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
    </div>
    <div v-if="error" class="text-xs text-red-500">{{ error }}</div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.input') }}</label>
        <textarea v-model="input" class="input font-mono text-sm resize-none" rows="16" :placeholder="t('toolbox.jsonInputHint')"></textarea>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.output') }}</label>
        <textarea v-model="output" readonly class="input font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900" rows="16" :placeholder="t('toolbox.outputHint')"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const input = ref('')
const output = ref('')
const error = ref('')

function formatJson() {
  error.value = ''
  try { output.value = JSON.stringify(JSON.parse(input.value), null, 2) }
  catch (e) { error.value = e.message }
}
function minifyJson() {
  error.value = ''
  try { output.value = JSON.stringify(JSON.parse(input.value)) }
  catch (e) { error.value = e.message }
}
</script>

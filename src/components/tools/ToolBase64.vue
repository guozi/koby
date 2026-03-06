<template>
  <div class="space-y-3">
    <textarea v-model="input" class="input font-mono text-sm resize-none" rows="4" :placeholder="t('toolbox.inputText')"></textarea>
    <div class="flex gap-2">
      <button @click="encode" class="btn btn-primary text-sm">{{ t('toolbox.encode') }}</button>
      <button @click="decode" class="btn btn-outline text-sm">{{ t('toolbox.decode') }}</button>
      <button v-if="output" @click="copyResult(output)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
    </div>
    <div v-if="error" class="text-xs text-red-500">{{ error }}</div>
    <textarea v-if="output" v-model="output" readonly class="input font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900" rows="4"></textarea>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const input = ref('')
const output = ref('')
const error = ref('')

function encode() {
  error.value = ''
  try { output.value = btoa(unescape(encodeURIComponent(input.value))) }
  catch (e) { error.value = e.message }
}
function decode() {
  error.value = ''
  try { output.value = decodeURIComponent(escape(atob(input.value))) }
  catch (e) { error.value = e.message }
}
</script>

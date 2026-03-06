<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <label class="text-xs text-gray-500 dark:text-gray-400">{{ t('toolbox.count') }}</label>
      <input v-model.number="count" type="number" min="1" max="50" class="input text-sm w-20 text-center" />
      <button @click="generate" class="btn btn-primary text-sm">{{ t('toolbox.generate') }}</button>
      <button v-if="output" @click="copyResult(output)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
    </div>
    <textarea v-if="output" v-model="output" readonly class="input font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900" :rows="Math.min(count, 10)"></textarea>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const count = ref(5)
const output = ref('')

function generate() {
  const uuids = []
  for (let i = 0; i < count.value; i++) {
    uuids.push(crypto.randomUUID())
  }
  output.value = uuids.join('\n')
}
</script>

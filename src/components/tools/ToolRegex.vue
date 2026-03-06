<template>
  <div class="space-y-3">
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.regexPattern') }}</label>
      <div class="flex gap-2">
        <input v-model="pattern" type="text" class="input font-mono text-sm flex-1" placeholder="\\d+" />
        <input v-model="flags" type="text" class="input font-mono text-sm w-16 text-center" placeholder="gi" />
      </div>
      <div v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</div>
    </div>
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.testString') }}</label>
      <textarea v-model="testStr" class="input font-mono text-sm resize-none" rows="4" placeholder="Hello World 123"></textarea>
    </div>
    <div v-if="matches.length > 0" class="space-y-1">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('toolbox.matches') }} ({{ matches.length }})</label>
      <div class="flex flex-wrap gap-1.5">
        <span v-for="(m, i) in matches" :key="i"
          class="px-2 py-0.5 text-xs font-mono rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
          {{ m }}
        </span>
      </div>
    </div>
    <div v-else-if="pattern && testStr && !error" class="text-xs text-gray-400">{{ t('toolbox.noMatch') }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t } = useToolHelper()

const pattern = ref('')
const flags = ref('g')
const testStr = ref('')
const error = ref('')

const matches = computed(() => {
  error.value = ''
  if (!pattern.value || !testStr.value) return []
  try {
    const re = new RegExp(pattern.value, flags.value)
    const result = []
    let m
    if (flags.value.includes('g')) {
      while ((m = re.exec(testStr.value)) !== null) {
        result.push(m[0])
        if (!m[0]) break
      }
    } else {
      m = re.exec(testStr.value)
      if (m) result.push(m[0])
    }
    return result
  } catch (e) {
    error.value = e.message
    return []
  }
})
</script>

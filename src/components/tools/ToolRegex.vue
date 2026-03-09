<template>
  <div class="space-y-3">
    <!-- Pattern + Flags -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.regexPattern') }}</label>
      <div class="flex gap-2">
        <input v-model="pattern" type="text" class="input font-mono text-sm flex-1" placeholder="\d+" />
        <input v-model="flags" type="text" class="input font-mono text-sm w-16 text-center" placeholder="gi" />
      </div>
      <div v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</div>
    </div>

    <!-- Quick templates -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.regexTemplates') }}</label>
      <div class="flex flex-wrap gap-1.5">
        <button v-for="tpl in templates" :key="tpl.name" @click="applyTemplate(tpl)"
          class="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary transition-colors">
          {{ tpl.name }}
        </button>
      </div>
    </div>

    <!-- Test string -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.testString') }}</label>
      <textarea v-model="testStr" class="input font-mono text-sm resize-none" rows="4" placeholder="Hello World 123"></textarea>
    </div>

    <!-- Highlighted matches -->
    <div v-if="pattern && testStr && !error && matchRanges.length > 0">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.regexHighlight') }}</label>
      <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm whitespace-pre-wrap break-all" v-html="highlightedText"></div>
    </div>

    <!-- Match list -->
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

    <!-- Capture groups -->
    <div v-if="groups.length > 0">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.regexGroups') }}</label>
      <div class="space-y-1">
        <div v-for="(g, i) in groups" :key="i" class="flex gap-2 text-xs font-mono">
          <span class="text-gray-400 w-6 text-right">{{ i + 1 }}:</span>
          <span class="text-purple-600 dark:text-purple-400">{{ g }}</span>
        </div>
      </div>
    </div>

    <!-- Replace -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.regexReplace') }}</label>
      <input v-model="replacePattern" type="text" class="input font-mono text-sm" :placeholder="t('toolbox.regexReplacePattern')" />
      <div v-if="replaceResult !== null" class="mt-2">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ t('toolbox.regexResult') }}</label>
        <div class="flex gap-1">
          <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900 flex-1 whitespace-pre-wrap">{{ replaceResult }}</div>
          <button @click="copyResult(replaceResult)" class="btn btn-outline text-sm px-2 self-start">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'
import { escapeHtml } from '../../utils/color'

const { t, copyResult } = useToolHelper()

const pattern = ref('')
const flags = ref('g')
const testStr = ref('')
const error = ref('')
const replacePattern = ref('')

const templates = [
  { name: t('toolbox.regexEmail'), pattern: '[\\w.-]+@[\\w.-]+\\.\\w+', flags: 'g' },
  { name: t('toolbox.regexPhone'), pattern: '1[3-9]\\d{9}', flags: 'g' },
  { name: t('toolbox.regexIp'), pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', flags: 'g' },
  { name: t('toolbox.regexUrl'), pattern: 'https?://[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+', flags: 'gi' },
]

function applyTemplate(tpl) {
  pattern.value = tpl.pattern
  flags.value = tpl.flags
}

const compiledRegex = computed(() => {
  if (!pattern.value) return null
  try {
    return { re: new RegExp(pattern.value, flags.value), error: null }
  } catch (e) {
    return { re: null, error: e.message }
  }
})

watchEffect(() => {
  error.value = compiledRegex.value?.error || ''
})

const matchRanges = computed(() => {
  if (!compiledRegex.value?.re || !testStr.value) return []
  const re = new RegExp(compiledRegex.value.re.source, flags.value.includes('g') ? flags.value : flags.value + 'g')
  const ranges = []
  let m
  while ((m = re.exec(testStr.value)) !== null) {
    ranges.push({ start: m.index, end: m.index + m[0].length })
    if (!m[0]) break
  }
  return ranges
})

const highlightedText = computed(() => {
  if (matchRanges.value.length === 0) return ''
  const str = testStr.value
  let result = ''
  let last = 0
  for (const { start, end } of matchRanges.value) {
    result += escapeHtml(str.slice(last, start))
    result += '<mark class="bg-yellow-200 dark:bg-yellow-700/50 text-yellow-900 dark:text-yellow-100 rounded px-0.5">' + escapeHtml(str.slice(start, end)) + '</mark>'
    last = end
  }
  result += escapeHtml(str.slice(last))
  return result
})

const matches = computed(() => {
  if (!compiledRegex.value?.re || !testStr.value) return []
  const re = new RegExp(compiledRegex.value.re.source, flags.value)
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
})

const groups = computed(() => {
  if (!compiledRegex.value?.re || !testStr.value) return []
  const re = new RegExp(compiledRegex.value.re.source, flags.value.replace('g', ''))
  const m = re.exec(testStr.value)
  if (!m || m.length <= 1) return []
  return m.slice(1)
})

const replaceResult = computed(() => {
  if (!compiledRegex.value?.re || !testStr.value || replacePattern.value === '') return null
  const re = new RegExp(compiledRegex.value.re.source, flags.value)
  return testStr.value.replace(re, replacePattern.value)
})
</script>

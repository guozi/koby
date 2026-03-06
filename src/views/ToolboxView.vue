<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('toolbox.title') }}</h1>
      <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">{{ t('toolbox.subtitle') }}</p>
    </div>

    <!-- No tool selected: card grid -->
    <div v-if="!activeTool" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <button v-for="tool in tools" :key="tool.id" @click="activeTool = tool.id"
        class="group text-left p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
               hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
            :style="{ backgroundColor: tool.color + '15', color: tool.color }">
            {{ tool.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{{ tool.name }}</div>
            <div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{{ tool.desc }}</div>
          </div>
        </div>
      </button>
    </div>

    <!-- Tool selected: full-width layout -->
    <div v-else>
      <!-- Back bar -->
      <div class="flex items-center gap-3 mb-5">
        <button @click="activeTool = null"
          class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
          {{ t('toolbox.allTools') }}
        </button>
        <span class="text-gray-200 dark:text-gray-700">/</span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold" :style="{ color: activeToolMeta.color }">{{ activeToolMeta.icon }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ activeToolMeta.name }}</span>
        </div>
      </div>

      <!-- Tool content -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 md:p-6">

          <!-- JSON Formatter -->
          <div v-if="activeTool === 'json'" class="space-y-3">
            <div class="flex gap-2 mb-1">
              <button @click="formatJson" class="btn btn-primary text-sm">{{ t('toolbox.format') }}</button>
              <button @click="minifyJson" class="btn btn-outline text-sm">{{ t('toolbox.minify') }}</button>
              <button v-if="jsonOutput" @click="copyResult(jsonOutput)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
            </div>
            <div v-if="jsonError" class="text-xs text-red-500">{{ jsonError }}</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.input') }}</label>
                <textarea v-model="jsonInput" class="input font-mono text-sm resize-none" rows="16" :placeholder="t('toolbox.jsonInputHint')"></textarea>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.output') }}</label>
                <textarea v-model="jsonOutput" readonly class="input font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900" rows="16" :placeholder="t('toolbox.outputHint')"></textarea>
              </div>
            </div>
          </div>

          <!-- Base64 -->
          <div v-if="activeTool === 'base64'" class="space-y-3">
            <textarea v-model="base64Input" class="input font-mono text-sm resize-none" rows="4" :placeholder="t('toolbox.inputText')"></textarea>
            <div class="flex gap-2">
              <button @click="base64Encode" class="btn btn-primary text-sm">{{ t('toolbox.encode') }}</button>
              <button @click="base64Decode" class="btn btn-outline text-sm">{{ t('toolbox.decode') }}</button>
              <button v-if="base64Output" @click="copyResult(base64Output)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
            </div>
            <div v-if="base64Error" class="text-xs text-red-500">{{ base64Error }}</div>
            <textarea v-if="base64Output" v-model="base64Output" readonly class="input font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900" rows="4"></textarea>
          </div>

          <!-- URL Encode/Decode -->
          <div v-if="activeTool === 'url'" class="space-y-3">
            <textarea v-model="urlInput" class="input font-mono text-sm resize-none" rows="3" :placeholder="t('toolbox.inputText')"></textarea>
            <div class="flex gap-2">
              <button @click="urlOutput = encodeURIComponent(urlInput)" class="btn btn-primary text-sm">{{ t('toolbox.encode') }}</button>
              <button @click="urlDecode" class="btn btn-outline text-sm">{{ t('toolbox.decode') }}</button>
              <button v-if="urlOutput" @click="copyResult(urlOutput)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
            </div>
            <div v-if="urlError" class="text-xs text-red-500">{{ urlError }}</div>
            <textarea v-if="urlOutput" v-model="urlOutput" readonly class="input font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900" rows="3"></textarea>
          </div>

          <!-- Timestamp -->
          <div v-if="activeTool === 'timestamp'" class="space-y-4">
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

          <!-- UUID Generator -->
          <div v-if="activeTool === 'uuid'" class="space-y-3">
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-500 dark:text-gray-400">{{ t('toolbox.count') }}</label>
              <input v-model.number="uuidCount" type="number" min="1" max="50" class="input text-sm w-20 text-center" />
              <button @click="generateUuids" class="btn btn-primary text-sm">{{ t('toolbox.generate') }}</button>
              <button v-if="uuidOutput" @click="copyResult(uuidOutput)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
            </div>
            <textarea v-if="uuidOutput" v-model="uuidOutput" readonly class="input font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900" :rows="Math.min(uuidCount, 10)"></textarea>
          </div>

          <!-- Color Converter -->
          <div v-if="activeTool === 'color'" class="space-y-4">
            <div class="flex items-center gap-3">
              <input v-model="colorHex" type="color" class="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
              <input v-model="colorHex" type="text" class="input font-mono text-sm flex-1" placeholder="#3B82F6" @input="colorFromHex" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div v-for="item in [{ label: 'HEX', value: colorHex }, { label: 'RGB', value: colorRgb }, { label: 'HSL', value: colorHsl }]" :key="item.label">
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">{{ item.label }}</label>
                <div class="flex gap-1">
                  <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900 flex-1">{{ item.value }}</div>
                  <button @click="copyResult(item.value)" class="btn btn-outline text-sm px-2">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Word Counter -->
          <div v-if="activeTool === 'wordcount'" class="space-y-3">
            <textarea v-model="wcInput" class="input text-sm resize-none" rows="6" :placeholder="t('toolbox.wcHint')"></textarea>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div v-for="stat in [
                { value: wcChars, label: t('toolbox.chars') },
                { value: wcCharsNoSpace, label: t('toolbox.charsNoSpace') },
                { value: wcWords, label: t('toolbox.words') },
                { value: wcLines, label: t('toolbox.lines') }
              ]" :key="stat.label" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                <div class="text-2xl font-bold text-primary tabular-nums">{{ stat.value }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- Hash Generator -->
          <div v-if="activeTool === 'hash'" class="space-y-3">
            <textarea v-model="hashInput" class="input font-mono text-sm resize-none" rows="3" :placeholder="t('toolbox.inputText')"></textarea>
            <button @click="generateHashes" class="btn btn-primary text-sm">{{ t('toolbox.generate') }}</button>
            <div v-if="hashResults.length" class="space-y-2">
              <div v-for="h in hashResults" :key="h.algo" class="flex items-center gap-2">
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 w-14 flex-shrink-0">{{ h.algo }}</span>
                <div class="input font-mono text-xs bg-gray-50 dark:bg-gray-900 flex-1 truncate">{{ h.value }}</div>
                <button @click="copyResult(h.value)" class="btn btn-outline text-xs px-2 flex-shrink-0">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Regex Tester -->
          <div v-if="activeTool === 'regex'" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.regexPattern') }}</label>
              <div class="flex gap-2">
                <input v-model="regexPattern" type="text" class="input font-mono text-sm flex-1" placeholder="\\d+" />
                <input v-model="regexFlags" type="text" class="input font-mono text-sm w-16 text-center" placeholder="gi" />
              </div>
              <div v-if="regexError" class="text-xs text-red-500 mt-1">{{ regexError }}</div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.testString') }}</label>
              <textarea v-model="regexTestStr" class="input font-mono text-sm resize-none" rows="4" placeholder="Hello World 123"></textarea>
            </div>
            <div v-if="regexMatches.length > 0" class="space-y-1">
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('toolbox.matches') }} ({{ regexMatches.length }})</label>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="(m, i) in regexMatches" :key="i"
                  class="px-2 py-0.5 text-xs font-mono rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                  {{ m }}
                </span>
              </div>
            </div>
            <div v-else-if="regexPattern && regexTestStr && !regexError" class="text-xs text-gray-400">{{ t('toolbox.noMatch') }}</div>
          </div>

          <!-- Diff Tool -->
          <div v-if="activeTool === 'diff'" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.original') }}</label>
                <textarea v-model="diffLeft" class="input font-mono text-sm resize-none" rows="8" :placeholder="t('toolbox.pasteText')"></textarea>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.modified') }}</label>
                <textarea v-model="diffRight" class="input font-mono text-sm resize-none" rows="8" :placeholder="t('toolbox.pasteText')"></textarea>
              </div>
            </div>
            <button @click="computeDiff" class="btn btn-primary text-sm">{{ t('toolbox.compare') }}</button>
            <div v-if="diffResult.length" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-xs space-y-0 overflow-x-auto">
              <div v-for="(line, i) in diffResult" :key="i"
                :class="{
                  'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20': line.type === 'add',
                  'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20': line.type === 'remove',
                  'text-gray-500 dark:text-gray-400': line.type === 'same'
                }" class="px-2 py-0.5 whitespace-pre">{{ line.prefix }}{{ line.text }}</div>
            </div>
          </div>

          <!-- Date Calculator -->
          <div v-if="activeTool === 'datecalc'" class="space-y-5">
            <!-- Date Difference -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{{ t('toolbox.dateDiff') }}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.startDate') }}</label>
                  <input v-model="dateDiffStart" type="date" class="input text-sm" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.endDate') }}</label>
                  <input v-model="dateDiffEnd" type="date" class="input text-sm" />
                </div>
              </div>
              <div v-if="dateDiffResult" class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div v-for="stat in dateDiffResult" :key="stat.label" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <div class="text-2xl font-bold text-primary tabular-nums">{{ stat.value }}</div>
                  <div class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</div>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-100 dark:border-gray-700"></div>

            <!-- Date Offset -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{{ t('toolbox.dateOffset') }}</h3>
              <div class="flex flex-wrap items-end gap-3">
                <div>
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.baseDate') }}</label>
                  <input v-model="offsetBase" type="date" class="input text-sm" />
                </div>
                <div class="flex items-center gap-1.5">
                  <select v-model="offsetDirection" class="select text-sm w-16">
                    <option value="add">+</option>
                    <option value="sub">-</option>
                  </select>
                  <input v-model.number="offsetValue" type="number" min="0" class="input text-sm w-20 text-center" />
                  <select v-model="offsetUnit" class="select text-sm">
                    <option value="days">{{ t('toolbox.days') }}</option>
                    <option value="weeks">{{ t('toolbox.weeks') }}</option>
                    <option value="months">{{ t('toolbox.months') }}</option>
                    <option value="years">{{ t('toolbox.years') }}</option>
                  </select>
                </div>
                <button @click="calcOffset" class="btn btn-primary text-sm">{{ t('toolbox.convert') }}</button>
              </div>
              <div v-if="offsetResult" class="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center gap-3">
                <span class="text-sm font-mono text-gray-700 dark:text-gray-300">{{ offsetResult }}</span>
                <span class="text-xs text-gray-400">({{ offsetResultWeekday }})</span>
                <button @click="copyResult(offsetResult)" class="btn btn-outline text-xs px-2 ml-auto">{{ t('toolbox.copy') }}</button>
              </div>
            </div>
          </div>

          <!-- SQL Formatter -->
          <div v-if="activeTool === 'sql'" class="space-y-3">
            <div class="flex gap-2 mb-1">
              <button @click="formatSql" class="btn btn-primary text-sm">{{ t('toolbox.format') }}</button>
              <button @click="minifySql" class="btn btn-outline text-sm">{{ t('toolbox.minify') }}</button>
              <button @click="sqlInput = sqlOutput; sqlOutput = ''" class="btn btn-outline text-sm">{{ t('toolbox.sqlApply') }}</button>
              <button v-if="sqlOutput" @click="copyResult(sqlOutput)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.input') }}</label>
                <textarea v-model="sqlInput" class="input font-mono text-sm resize-none" rows="16" :placeholder="t('toolbox.sqlInputHint')"></textarea>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.output') }}</label>
                <textarea v-model="sqlOutput" readonly class="input font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900" rows="16" :placeholder="t('toolbox.outputHint')"></textarea>
              </div>
            </div>
          </div>

          <!-- Lorem Ipsum -->
          <div v-if="activeTool === 'lorem'" class="space-y-3">
            <div class="flex items-center gap-3">
              <label class="text-xs text-gray-500 dark:text-gray-400">{{ t('toolbox.paragraphs') }}</label>
              <input v-model.number="loremCount" type="number" min="1" max="20" class="input text-sm w-20 text-center" />
              <button @click="generateLorem" class="btn btn-primary text-sm">{{ t('toolbox.generate') }}</button>
              <button v-if="loremOutput" @click="copyResult(loremOutput)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
            </div>
            <textarea v-if="loremOutput" v-model="loremOutput" readonly class="input text-sm resize-none bg-gray-50 dark:bg-gray-900" rows="8"></textarea>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../i18n'
import { useToastStore } from '../stores/toast'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)
const toast = useToastStore()

const tools = computed(() => [
  { id: 'json',      icon: '{ }',  color: '#F59E0B', name: t('toolbox.json'),      desc: t('toolbox.jsonDesc') },
  { id: 'base64',    icon: 'B64',  color: '#8B5CF6', name: t('toolbox.base64'),    desc: t('toolbox.base64Desc') },
  { id: 'url',       icon: '%',    color: '#3B82F6', name: t('toolbox.url'),       desc: t('toolbox.urlDesc') },
  { id: 'timestamp', icon: '',    color: '#10B981', name: t('toolbox.timestamp'), desc: t('toolbox.timestampDesc') },
  { id: 'uuid',      icon: '#',    color: '#EC4899', name: t('toolbox.uuid'),      desc: t('toolbox.uuidDesc') },
  { id: 'color',     icon: '',    color: '#F43F5E', name: t('toolbox.color'),     desc: t('toolbox.colorDesc') },
  { id: 'wordcount', icon: 'Aa',   color: '#6366F1', name: t('toolbox.wordcount'), desc: t('toolbox.wordcountDesc') },
  { id: 'hash',      icon: '#!',   color: '#0EA5E9', name: t('toolbox.hash'),      desc: t('toolbox.hashDesc') },
  { id: 'regex',     icon: '.*',   color: '#D97706', name: t('toolbox.regex'),     desc: t('toolbox.regexDesc') },
  { id: 'diff',      icon: '+-',   color: '#059669', name: t('toolbox.diff'),      desc: t('toolbox.diffDesc') },
  { id: 'datecalc',  icon: '',   color: '#0D9488', name: t('toolbox.datecalc'),  desc: t('toolbox.datecalcDesc') },
  { id: 'sql',       icon: 'SQL',  color: '#2563EB', name: t('toolbox.sql'),       desc: t('toolbox.sqlDesc') },
  { id: 'lorem',     icon: 'Lp',   color: '#7C3AED', name: t('toolbox.lorem'),     desc: t('toolbox.loremDesc') },
])

const activeTool = ref(null)
const activeToolMeta = computed(() => tools.value.find(t => t.id === activeTool.value) || {})

async function copyResult(text) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast.success(t('toast.linkCopied'))
  } catch { toast.error(t('toast.copyFailed')) }
}

// === JSON Formatter ===
const jsonInput = ref('')
const jsonOutput = ref('')
const jsonError = ref('')
function formatJson() {
  jsonError.value = ''
  try { jsonOutput.value = JSON.stringify(JSON.parse(jsonInput.value), null, 2) }
  catch (e) { jsonError.value = e.message }
}
function minifyJson() {
  jsonError.value = ''
  try { jsonOutput.value = JSON.stringify(JSON.parse(jsonInput.value)) }
  catch (e) { jsonError.value = e.message }
}

// === Base64 ===
const base64Input = ref('')
const base64Output = ref('')
const base64Error = ref('')
function base64Encode() {
  base64Error.value = ''
  try { base64Output.value = btoa(unescape(encodeURIComponent(base64Input.value))) }
  catch (e) { base64Error.value = e.message }
}
function base64Decode() {
  base64Error.value = ''
  try { base64Output.value = decodeURIComponent(escape(atob(base64Input.value))) }
  catch (e) { base64Error.value = e.message }
}

// === URL Encode/Decode ===
const urlInput = ref('')
const urlOutput = ref('')
const urlError = ref('')
function urlDecode() {
  urlError.value = ''
  try { urlOutput.value = decodeURIComponent(urlInput.value) }
  catch (e) { urlError.value = e.message }
}

// === Timestamp ===
const nowTimestamp = ref(Math.floor(Date.now() / 1000))
const tsInput = ref('')
const tsResult = ref('')
const dateInput = ref('')
const dateResult = ref(null)
let tsTimer = null
onMounted(() => { tsTimer = setInterval(() => { nowTimestamp.value = Math.floor(Date.now() / 1000) }, 1000) })
onUnmounted(() => { clearInterval(tsTimer) })
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

// === UUID ===
const uuidCount = ref(5)
const uuidOutput = ref('')
function generateUuids() {
  const uuids = []
  for (let i = 0; i < uuidCount.value; i++) {
    uuids.push(crypto.randomUUID())
  }
  uuidOutput.value = uuids.join('\n')
}

// === Color Converter ===
const colorHex = ref('#3B82F6')
const colorRgb = ref('rgb(59, 130, 246)')
const colorHsl = ref('hsl(217, 91%, 60%)')
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}
function colorFromHex() {
  const hex = colorHex.value
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return
  const { r, g, b } = hexToRgb(hex)
  colorRgb.value = `rgb(${r}, ${g}, ${b})`
  const { h, s, l } = rgbToHsl(r, g, b)
  colorHsl.value = `hsl(${h}, ${s}%, ${l}%)`
}
watch(colorHex, colorFromHex)

// === Word Counter ===
const wcInput = ref('')
const wcChars = computed(() => wcInput.value.length)
const wcCharsNoSpace = computed(() => wcInput.value.replace(/\s/g, '').length)
const wcWords = computed(() => wcInput.value.trim() ? wcInput.value.trim().split(/\s+/).length : 0)
const wcLines = computed(() => wcInput.value ? wcInput.value.split('\n').length : 0)

// === Hash Generator ===
const hashInput = ref('')
const hashResults = ref([])
async function generateHashes() {
  const text = hashInput.value
  if (!text) return
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const algos = [
    { name: 'SHA-1', algo: 'SHA-1' },
    { name: 'SHA-256', algo: 'SHA-256' },
    { name: 'SHA-384', algo: 'SHA-384' },
    { name: 'SHA-512', algo: 'SHA-512' },
  ]
  const results = []
  for (const a of algos) {
    const buf = await crypto.subtle.digest(a.algo, data)
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    results.push({ algo: a.name, value: hex })
  }
  hashResults.value = results
}

// === Regex Tester ===
const regexPattern = ref('')
const regexFlags = ref('g')
const regexTestStr = ref('')
const regexError = ref('')
const regexMatches = computed(() => {
  regexError.value = ''
  if (!regexPattern.value || !regexTestStr.value) return []
  try {
    const re = new RegExp(regexPattern.value, regexFlags.value)
    const matches = []
    let m
    if (regexFlags.value.includes('g')) {
      while ((m = re.exec(regexTestStr.value)) !== null) {
        matches.push(m[0])
        if (!m[0]) break
      }
    } else {
      m = re.exec(regexTestStr.value)
      if (m) matches.push(m[0])
    }
    return matches
  } catch (e) {
    regexError.value = e.message
    return []
  }
})

// === Diff ===
const diffLeft = ref('')
const diffRight = ref('')
const diffResult = ref([])
function computeDiff() {
  const linesA = diffLeft.value.split('\n')
  const linesB = diffRight.value.split('\n')
  const result = []
  let ai = 0, bi = 0
  while (ai < linesA.length || bi < linesB.length) {
    if (ai >= linesA.length) {
      result.push({ type: 'add', prefix: '+ ', text: linesB[bi] })
      bi++
    } else if (bi >= linesB.length) {
      result.push({ type: 'remove', prefix: '- ', text: linesA[ai] })
      ai++
    } else if (linesA[ai] === linesB[bi]) {
      result.push({ type: 'same', prefix: '  ', text: linesA[ai] })
      ai++; bi++
    } else {
      result.push({ type: 'remove', prefix: '- ', text: linesA[ai] })
      result.push({ type: 'add', prefix: '+ ', text: linesB[bi] })
      ai++; bi++
    }
  }
  diffResult.value = result
}

// === Date Calculator ===
const today = new Date().toISOString().slice(0, 10)
const dateDiffStart = ref(today)
const dateDiffEnd = ref(today)
const dateDiffResult = computed(() => {
  if (!dateDiffStart.value || !dateDiffEnd.value) return null
  const start = new Date(dateDiffStart.value)
  const end = new Date(dateDiffEnd.value)
  const diffMs = Math.abs(end - start)
  const totalDays = Math.round(diffMs / 86400000)
  const weeks = Math.floor(totalDays / 7)
  const remainDays = totalDays % 7
  // calc months & years
  let years = 0, months = 0
  const [earlier, later] = start <= end ? [start, end] : [end, start]
  years = later.getFullYear() - earlier.getFullYear()
  months = later.getMonth() - earlier.getMonth()
  if (later.getDate() < earlier.getDate()) months--
  if (months < 0) { years--; months += 12 }
  const totalMonths = years * 12 + months
  return [
    { value: totalDays, label: t('toolbox.days') },
    { value: `${weeks}w ${remainDays}d`, label: t('toolbox.weeks') },
    { value: totalMonths, label: t('toolbox.months') },
    { value: years, label: t('toolbox.years') },
  ]
})

const offsetBase = ref(today)
const offsetDirection = ref('add')
const offsetValue = ref(7)
const offsetUnit = ref('days')
const offsetResult = ref('')
const offsetResultWeekday = ref('')
const WEEKDAYS_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
function calcOffset() {
  if (!offsetBase.value) return
  const d = new Date(offsetBase.value)
  const val = offsetDirection.value === 'sub' ? -offsetValue.value : offsetValue.value
  if (offsetUnit.value === 'days') d.setDate(d.getDate() + val)
  else if (offsetUnit.value === 'weeks') d.setDate(d.getDate() + val * 7)
  else if (offsetUnit.value === 'months') d.setMonth(d.getMonth() + val)
  else if (offsetUnit.value === 'years') d.setFullYear(d.getFullYear() + val)
  offsetResult.value = d.toISOString().slice(0, 10)
  const weekdays = document.documentElement.lang === 'en' ? WEEKDAYS_EN : WEEKDAYS_ZH
  offsetResultWeekday.value = weekdays[d.getDay()]
}

// === SQL Formatter ===
const sqlInput = ref('')
const sqlOutput = ref('')

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'ON', 'AS',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
  'UNION', 'ALL', 'DISTINCT', 'EXISTS', 'BETWEEN', 'LIKE',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IS', 'NULL',
  'ASC', 'DESC', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'WITH', 'RECURSIVE', 'OVER', 'PARTITION', 'ROW_NUMBER', 'RANK',
]

// Major keywords that start a new line at indent level 0
const MAJOR_CLAUSES = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO', 'UPDATE', 'DELETE FROM', 'SET', 'VALUES', 'WITH']
// Keywords that start a new line with one indent
const SUB_CLAUSES = ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN', 'AND', 'OR', 'ON']

function formatSql() {
  const raw = sqlInput.value.trim()
  if (!raw) return

  // Normalize whitespace, preserve string literals
  const strings = []
  let normalized = raw.replace(/'[^']*'/g, (m) => { strings.push(m); return `__STR${strings.length - 1}__` })
  normalized = normalized.replace(/\s+/g, ' ').trim()

  // Uppercase keywords
  SQL_KEYWORDS.forEach(kw => {
    normalized = normalized.replace(new RegExp(`\\b${kw}\\b`, 'gi'), kw)
  })

  // Insert newlines before major clauses
  MAJOR_CLAUSES.forEach(clause => {
    const re = new RegExp(`\\s+${clause.replace(' ', '\\s+')}\\b`, 'gi')
    normalized = normalized.replace(re, `\n${clause}`)
  })

  // Insert newlines before sub-clauses with indent
  SUB_CLAUSES.forEach(clause => {
    const re = new RegExp(`\\s+${clause.replace(' ', '\\s+')}\\b`, 'gi')
    normalized = normalized.replace(re, `\n  ${clause}`)
  })

  // Indent SELECT columns: add newline+indent after commas that follow SELECT
  const lines = normalized.split('\n')
  const result = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^SELECT\b/i.test(trimmed)) {
      // Split SELECT fields by comma, indent continuation
      const afterSelect = trimmed.slice(6).trim()
      const fields = splitTopLevel(afterSelect, ',')
      if (fields.length > 1) {
        result.push('SELECT')
        fields.forEach((f, i) => {
          result.push('  ' + f.trim() + (i < fields.length - 1 ? ',' : ''))
        })
      } else {
        result.push(trimmed)
      }
    } else {
      result.push(trimmed)
    }
  }

  let output = result.join('\n')
  // Restore string literals
  strings.forEach((s, i) => { output = output.replace(`__STR${i}__`, s) })
  sqlOutput.value = output
}

// Split by delimiter only at top level (not inside parentheses)
function splitTopLevel(str, delimiter) {
  const parts = []
  let depth = 0, current = ''
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === delimiter && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current)
  return parts
}

function minifySql() {
  const raw = sqlInput.value.trim()
  if (!raw) return
  // Preserve string literals
  const strings = []
  let result = raw.replace(/'[^']*'/g, (m) => { strings.push(m); return `__STR${strings.length - 1}__` })
  result = result.replace(/\s+/g, ' ').trim()
  strings.forEach((s, i) => { result = result.replace(`__STR${i}__`, s) })
  sqlOutput.value = result
}

// === Lorem Ipsum ===
const loremCount = ref(3)
const loremOutput = ref('')
const LOREM_PARAGRAPHS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
  'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.',
  'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
]
function generateLorem() {
  const paragraphs = []
  for (let i = 0; i < loremCount.value; i++) {
    paragraphs.push(LOREM_PARAGRAPHS[i % LOREM_PARAGRAPHS.length])
  }
  loremOutput.value = paragraphs.join('\n\n')
}
</script>

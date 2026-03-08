<template>
  <div class="space-y-4">
    <!-- Expression input + copy -->
    <div>
      <div class="flex items-center gap-2">
        <input v-model="expr" type="text" class="input font-mono text-sm flex-1" placeholder="* * * * *" />
        <button @click="copyResult(expr.trim())" class="btn btn-outline text-sm flex-shrink-0" :disabled="!expr.trim()">{{ t('toolbox.copy') }}</button>
      </div>
      <div class="flex flex-wrap gap-1.5 mt-2">
        <button v-for="p in presets" :key="p.value" @click="expr = p.value"
          class="btn btn-outline text-xs px-2 py-1">{{ p.label }}</button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="text-xs text-red-500">{{ error }}</div>

    <!-- Visual field editor -->
    <div v-if="!error" class="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('toolbox.cronFieldEditor') }}</label>
      <div v-for="(field, idx) in fieldDefs" :key="idx" class="space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-300 w-16 flex-shrink-0">{{ field.label }}</span>
          <select v-model="fieldModes[idx]" @change="onModeChange(idx)"
            class="input text-xs py-1 px-2 w-auto min-w-[120px]">
            <option value="every">{{ t('toolbox.cronModeEvery') }}</option>
            <option value="interval">{{ t('toolbox.cronModeInterval') }}</option>
            <option value="specific">{{ t('toolbox.cronModeSpecific') }}</option>
          </select>
          <select v-if="fieldModes[idx] === 'interval'" v-model="fieldIntervals[idx]" @change="syncFromEditor"
            class="input text-xs py-1 px-2 w-auto">
            <option v-for="n in intervalOptions(field)" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <!-- Specific value grid -->
        <div v-if="fieldModes[idx] === 'specific'" class="flex flex-wrap gap-1 ml-18 pl-0.5">
          <button v-for="v in field.values" :key="v.val"
            @click="toggleSpecific(idx, v.val)"
            class="text-xs px-2 py-1 rounded-md border transition-colors"
            :class="fieldSpecific[idx].has(v.val)
              ? 'bg-blue-500 text-white border-blue-500 dark:bg-blue-600 dark:border-blue-600'
              : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-500'">
            {{ v.display }}
          </button>
        </div>
      </div>
    </div>

    <!-- Description & next runs -->
    <div v-if="description" class="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.cronDescription') }}</label>
        <div class="input bg-gray-50 dark:bg-gray-900 text-sm">{{ description }}</div>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.cronNext5') }}</label>
        <div class="space-y-1">
          <div v-for="(run, i) in nextRuns" :key="i"
            class="input bg-gray-50 dark:bg-gray-900 font-mono text-sm py-1.5 flex items-center justify-between">
            <span>{{ run.time }}</span>
            <span class="text-xs text-gray-400 dark:text-gray-500 font-sans">{{ run.relative }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const expr = ref('')
const error = ref('')
const description = ref('')
const nextRuns = ref([])

// Editor state
const fieldModes = reactive(['every', 'every', 'every', 'every', 'every'])
const fieldIntervals = reactive([2, 2, 2, 2, 2])
const fieldSpecific = reactive([new Set(), new Set(), new Set(), new Set(), new Set()])

// Suppress sync loops
let syncFromEditorLock = false
let syncFromInputLock = false

const monthNames = () => [
  t('toolbox.cronJan'), t('toolbox.cronFeb'), t('toolbox.cronMar'),
  t('toolbox.cronApr'), t('toolbox.cronMay'), t('toolbox.cronJun'),
  t('toolbox.cronJul'), t('toolbox.cronAug'), t('toolbox.cronSep'),
  t('toolbox.cronOct'), t('toolbox.cronNov'), t('toolbox.cronDec')
]
const weekdayNames = () => [
  t('toolbox.cronSun'), t('toolbox.cronMon'), t('toolbox.cronTue'),
  t('toolbox.cronWed'), t('toolbox.cronThu'), t('toolbox.cronFri'), t('toolbox.cronSat')
]

const fieldDefs = computed(() => [
  { label: t('toolbox.cronMinute'), min: 0, max: 59, values: genValues(0, 59, null) },
  { label: t('toolbox.cronHour'), min: 0, max: 23, values: genValues(0, 23, null) },
  { label: t('toolbox.cronDay'), min: 1, max: 31, values: genValues(1, 31, null) },
  { label: t('toolbox.cronMonth'), min: 1, max: 12, values: genValues(1, 12, monthNames()) },
  { label: t('toolbox.cronWeekday'), min: 0, max: 6, values: genValues(0, 6, weekdayNames()) },
])

function genValues(min, max, names) {
  const arr = []
  for (let i = min; i <= max; i++) {
    arr.push({ val: i, display: names ? names[i - min] : String(i) })
  }
  return arr
}

function intervalOptions(field) {
  const opts = []
  for (let i = 2; i <= Math.min(field.max - field.min + 1, 30); i++) opts.push(i)
  return opts
}

// Presets
const presets = computed(() => [
  { label: t('toolbox.cronEveryMin'), value: '* * * * *' },
  { label: t('toolbox.cronEvery5Min'), value: '*/5 * * * *' },
  { label: t('toolbox.cronEvery30Min'), value: '*/30 * * * *' },
  { label: t('toolbox.cronEveryHour'), value: '0 * * * *' },
  { label: t('toolbox.cronEveryDay2am'), value: '0 2 * * *' },
  { label: t('toolbox.cronWeekday9am'), value: '0 9 * * 1-5' },
  { label: t('toolbox.cronEveryWeek'), value: '0 0 * * 0' },
  { label: t('toolbox.cronEveryMonth'), value: '0 0 1 * *' },
  { label: t('toolbox.cron1st15th'), value: '0 0 1,15 * *' },
  { label: t('toolbox.cronMonFri'), value: '0 0 * * 1,5' },
])

// Parse cron field into values
function parseField(field, min, max) {
  const values = new Set()
  for (const part of field.split(',')) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/)
    let range = stepMatch ? stepMatch[1] : part
    const step = stepMatch ? parseInt(stepMatch[2]) : 1
    if (range === '*') {
      for (let i = min; i <= max; i += step) values.add(i)
    } else if (range.includes('-')) {
      const [a, b] = range.split('-').map(Number)
      for (let i = a; i <= b; i += step) values.add(i)
    } else {
      values.add(parseInt(range))
    }
  }
  return [...values].sort((a, b) => a - b)
}

// Build natural language description
function buildDescription(parts) {
  const [min, hour, day, month, weekday] = parts
  const wdNames = weekdayNames()
  const mNames = monthNames()

  // Every minute
  if (min === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
    return t('toolbox.cronDescEveryMin')
  }

  // */N patterns
  const minStep = getStepValue(min)
  const hourStep = getStepValue(hour)

  // Every N minutes
  if (minStep && hour === '*' && day === '*' && month === '*' && weekday === '*') {
    return t('toolbox.cronDescEveryNMin', { n: minStep })
  }

  // Every N hours
  if (min === '0' && hourStep && day === '*' && month === '*' && weekday === '*') {
    return t('toolbox.cronDescEveryNHour', { n: hourStep })
  }

  // Build composite description
  let timePart = ''
  if (min !== '*' && hour !== '*') {
    const hours = parseField(hour, 0, 23)
    const mins = parseField(min, 0, 59)
    if (hours.length <= 3 && mins.length === 1) {
      timePart = hours.map(h => `${String(h).padStart(2, '0')}:${String(mins[0]).padStart(2, '0')}`).join(', ')
    } else {
      timePart = t('toolbox.cronHour') + ' ' + hours.join(',') + ' ' + t('toolbox.cronMinute') + ' ' + mins.join(',')
    }
  } else if (hour !== '*') {
    const hours = parseField(hour, 0, 23)
    timePart = hours.map(h => `${String(h).padStart(2, '0')}:00`).join(', ')
  } else if (min !== '*' && !minStep) {
    const mins = parseField(min, 0, 59)
    timePart = t('toolbox.cronMinute') + ' ' + mins.join(', ')
  } else if (minStep) {
    timePart = t('toolbox.cronDescEveryNMin', { n: minStep })
  }

  let datePart = ''
  // Weekday
  if (weekday !== '*' && day === '*') {
    const wds = parseField(weekday, 0, 6)
    if (isConsecutiveRange(weekday, 0, 6) && weekday === '1-5') {
      datePart = t('toolbox.cronDescWeekdays')
    } else {
      datePart = t('toolbox.cronDescOnWeekday', { days: wds.map(w => wdNames[w]).join(', ') })
    }
  }
  // Day of month
  if (day !== '*') {
    const days = parseField(day, 1, 31)
    datePart = t('toolbox.cronDescOnDay', { days: days.join(', ') })
  }
  // Month
  let monthPart = ''
  if (month !== '*') {
    const months = parseField(month, 1, 12)
    monthPart = months.map(m => mNames[m - 1]).join(', ')
  }

  const segments = [monthPart, datePart, timePart].filter(Boolean)
  return segments.join(' ') || t('toolbox.cronDescCustom')
}

function getStepValue(field) {
  const m = field.match(/^\*\/(\d+)$/)
  return m ? parseInt(m[1]) : null
}

function isConsecutiveRange(field) {
  return /^\d+-\d+$/.test(field)
}

// Get next execution times
function getNextRuns(parts, count = 5) {
  const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]]
  const sets = parts.map((f, i) => f === '*' ? null : new Set(parseField(f, ranges[i][0], ranges[i][1])))
  const results = []
  const d = new Date()
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() + 1)
  const now = Date.now()
  for (let i = 0; i < 525600 && results.length < count; i++) {
    if ((!sets[0] || sets[0].has(d.getMinutes())) &&
        (!sets[1] || sets[1].has(d.getHours())) &&
        (!sets[2] || sets[2].has(d.getDate())) &&
        (!sets[3] || sets[3].has(d.getMonth() + 1)) &&
        (!sets[4] || sets[4].has(d.getDay()))) {
      results.push({ time: d.toLocaleString(), relative: formatRelative(d.getTime() - now) })
    }
    d.setMinutes(d.getMinutes() + 1)
  }
  return results
}

function formatRelative(ms) {
  if (ms < 0) return ''
  const minutes = Math.round(ms / 60000)
  if (minutes < 1) return t('toolbox.cronRelativeNow')
  if (minutes < 60) return t('toolbox.cronRelativeMin', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const remainMin = minutes % 60
    return remainMin > 0
      ? t('toolbox.cronRelativeHourMin', { h: hours, m: remainMin })
      : t('toolbox.cronRelativeHour', { n: hours })
  }
  const days = Math.floor(hours / 24)
  const remainHours = hours % 24
  return remainHours > 0
    ? t('toolbox.cronRelativeDayHour', { d: days, h: remainHours })
    : t('toolbox.cronRelativeDay', { n: days })
}

// Sync: editor → expression
function syncFromEditor() {
  if (syncFromInputLock) return
  syncFromEditorLock = true
  const defs = fieldDefs.value
  const parts = defs.map((def, idx) => {
    const mode = fieldModes[idx]
    if (mode === 'every') return '*'
    if (mode === 'interval') return `*/${fieldIntervals[idx]}`
    if (mode === 'specific') {
      const vals = [...fieldSpecific[idx]].sort((a, b) => a - b)
      return vals.length > 0 ? vals.join(',') : '*'
    }
    return '*'
  })
  expr.value = parts.join(' ')
  syncFromEditorLock = false
}

// Sync: expression → editor
function syncFromInput(parts) {
  if (syncFromEditorLock) return
  syncFromInputLock = true
  const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]]
  parts.forEach((field, idx) => {
    if (field === '*') {
      fieldModes[idx] = 'every'
    } else if (/^\*\/\d+$/.test(field)) {
      fieldModes[idx] = 'interval'
      fieldIntervals[idx] = parseInt(field.replace('*/', ''))
    } else {
      fieldModes[idx] = 'specific'
      const vals = parseField(field, ranges[idx][0], ranges[idx][1])
      fieldSpecific[idx] = new Set(vals)
    }
  })
  syncFromInputLock = false
}

function onModeChange(idx) {
  if (fieldModes[idx] === 'specific' && fieldSpecific[idx].size === 0) {
    fieldSpecific[idx] = new Set([fieldDefs.value[idx].min])
  }
  syncFromEditor()
}

function toggleSpecific(idx, val) {
  const s = fieldSpecific[idx]
  if (s.has(val)) s.delete(val)
  else s.add(val)
  fieldSpecific[idx] = new Set(s) // trigger reactivity
  syncFromEditor()
}

// Watch expression changes
watch(expr, (val) => {
  error.value = ''
  description.value = ''
  nextRuns.value = []
  const trimmed = val.trim()
  if (!trimmed) return
  const parts = trimmed.split(/\s+/)
  if (parts.length !== 5) { error.value = t('toolbox.cronInvalid'); return }
  try {
    syncFromInput(parts)
    description.value = buildDescription(parts)
    nextRuns.value = getNextRuns(parts)
  } catch (e) { error.value = e.message }
})
</script>

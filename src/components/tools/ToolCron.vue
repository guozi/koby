<template>
  <div class="space-y-3">
    <div>
      <input v-model="expr" type="text" class="input font-mono text-sm" placeholder="* * * * *" />
      <div class="flex flex-wrap gap-1.5 mt-2">
        <button v-for="p in presets" :key="p.value" @click="expr = p.value"
          class="btn btn-outline text-xs px-2 py-1">{{ p.label }}</button>
      </div>
    </div>
    <div v-if="error" class="text-xs text-red-500">{{ error }}</div>
    <div v-if="description" class="space-y-3">
      <div class="input bg-gray-50 dark:bg-gray-900 text-sm">{{ description }}</div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.cronNext5') }}</label>
        <div class="space-y-1">
          <div v-for="(time, i) in nextRuns" :key="i" class="input bg-gray-50 dark:bg-gray-900 font-mono text-sm py-1.5">{{ time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t } = useToolHelper()

const expr = ref('')
const error = ref('')
const description = ref('')
const nextRuns = ref([])

const presets = computed(() => [
  { label: t('toolbox.cronEveryMin'), value: '* * * * *' },
  { label: t('toolbox.cronEveryHour'), value: '0 * * * *' },
  { label: t('toolbox.cronEveryDay'), value: '0 0 * * *' },
  { label: t('toolbox.cronEveryWeek'), value: '0 0 * * 0' },
  { label: t('toolbox.cronEveryMonth'), value: '0 0 1 * *' },
])

const fieldNames = () => [t('toolbox.cronMinute'), t('toolbox.cronHour'), t('toolbox.cronDay'), t('toolbox.cronMonth'), t('toolbox.cronWeekday')]
const weekdays = () => [t('toolbox.cronSun'), t('toolbox.cronMon'), t('toolbox.cronTue'), t('toolbox.cronWed'), t('toolbox.cronThu'), t('toolbox.cronFri'), t('toolbox.cronSat')]

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

function describeField(field, name, mapFn) {
  if (field === '*') return ''
  const vals = parseField(field, 0, 59)
  const display = mapFn ? vals.map(mapFn) : vals
  return `${name}: ${display.join(', ')}`
}

function buildDescription(parts) {
  const [min, hour, day, month, weekday] = parts
  const lines = []
  if (min === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') return t('toolbox.cronEveryMin')
  if (min !== '*') lines.push(describeField(min, fieldNames()[0]))
  if (hour !== '*') lines.push(describeField(hour, fieldNames()[1]))
  if (day !== '*') lines.push(describeField(day, fieldNames()[2]))
  if (month !== '*') lines.push(describeField(month, fieldNames()[3]))
  if (weekday !== '*') lines.push(describeField(weekday, fieldNames()[4], v => weekdays()[v] || v))
  return lines.filter(Boolean).join('; ')
}

function getNextRuns(parts, count = 5) {
  const [minF, hourF, dayF, monthF, wdayF] = parts.map((f, i) => {
    const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]]
    return f === '*' ? null : new Set(parseField(f, ranges[i][0], ranges[i][1]))
  })
  const results = []
  const d = new Date()
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() + 1)
  const limit = 525600
  for (let i = 0; i < limit && results.length < count; i++) {
    const matches =
      (!minF || minF.has(d.getMinutes())) &&
      (!hourF || hourF.has(d.getHours())) &&
      (!dayF || dayF.has(d.getDate())) &&
      (!monthF || monthF.has(d.getMonth() + 1)) &&
      (!wdayF || wdayF.has(d.getDay()))
    if (matches) results.push(d.toLocaleString())
    d.setMinutes(d.getMinutes() + 1)
  }
  return results
}

watch(expr, (val) => {
  error.value = ''
  description.value = ''
  nextRuns.value = []
  const trimmed = val.trim()
  if (!trimmed) return
  const parts = trimmed.split(/\s+/)
  if (parts.length !== 5) { error.value = t('toolbox.cronInvalid'); return }
  try {
    description.value = buildDescription(parts)
    nextRuns.value = getNextRuns(parts)
  } catch (e) { error.value = e.message }
})
</script>

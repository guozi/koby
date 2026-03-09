<template>
  <div class="space-y-5">
    <!-- Date Difference -->
    <div>
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{{ t('toolbox.dateDiff') }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.startDate') }}</label>
          <input v-model="diffStart" type="date" class="input text-sm" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.endDate') }}</label>
          <input v-model="diffEnd" type="date" class="input text-sm" />
        </div>
      </div>
      <div v-if="diffResult" class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="stat in diffResult" :key="stat.label" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
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
          <input v-model="offsetBase" type="datetime-local" step="1" class="input text-sm" />
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

    <div class="border-t border-gray-100 dark:border-gray-700"></div>

    <!-- UTC Timezone Converter -->
    <div>
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{{ t('toolbox.utcConvert') }}</h3>

      <!-- Local time display -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.utcLocal') }} (UTC{{ localOffsetStr }})</label>
          <input v-model="localInput" type="datetime-local" step="1" class="input text-sm" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.utcTime') }}</label>
          <div class="input text-sm font-mono bg-gray-50 dark:bg-gray-900">{{ utcStr }}</div>
        </div>
      </div>

      <!-- Target timezone -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.utcTarget') }}</label>
          <select v-model="targetTz" class="input text-sm">
            <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.utcTargetTime') }}</label>
          <div class="input text-sm font-mono bg-gray-50 dark:bg-gray-900">{{ targetTimeStr }}</div>
        </div>
      </div>

      <!-- Quick timezone cards -->
      <div class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div v-for="tz in quickZones" :key="tz.zone"
          class="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          @click="targetTz = tz.zone">
          <div class="text-xs font-medium text-gray-600 dark:text-gray-300">{{ tz.label }}</div>
          <div class="text-sm font-mono font-bold text-primary tabular-nums mt-0.5">{{ formatInTz(tz.zone) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const now = new Date()
const nowLocalIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19)

// ─── Date Difference ───
const today = nowLocalIso.slice(0, 10)
const diffStart = ref(today)
const diffEnd = ref(today)

const diffResult = computed(() => {
  if (!diffStart.value || !diffEnd.value) return null
  const start = new Date(diffStart.value)
  const end = new Date(diffEnd.value)
  const diffMs = Math.abs(end - start)
  const totalDays = Math.round(diffMs / 86400000)
  const weeks = Math.floor(totalDays / 7)
  const remainDays = totalDays % 7
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

// ─── Date Offset ───
const offsetBase = ref(nowLocalIso)
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
  offsetResult.value = d.toISOString().slice(0, 19).replace('T', ' ')
  const weekdays = document.documentElement.lang === 'en' ? WEEKDAYS_EN : WEEKDAYS_ZH
  offsetResultWeekday.value = weekdays[d.getDay()]
}

// ─── UTC Timezone Converter ───
const localInput = ref(nowLocalIso)
const targetTz = ref('America/New_York')

const localOffsetMin = now.getTimezoneOffset()
const localOffsetStr = computed(() => {
  const sign = localOffsetMin <= 0 ? '+' : '-'
  const abs = Math.abs(localOffsetMin)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

const localDate = computed(() => {
  if (!localInput.value) return null
  return new Date(localInput.value)
})

const utcStr = computed(() => {
  if (!localDate.value) return ''
  const d = localDate.value
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
})

const timezones = [
  { value: 'Pacific/Honolulu', label: 'HST (UTC-10) Honolulu' },
  { value: 'America/Anchorage', label: 'AKST (UTC-9) Anchorage' },
  { value: 'America/Los_Angeles', label: 'PST (UTC-8) Los Angeles' },
  { value: 'America/Denver', label: 'MST (UTC-7) Denver' },
  { value: 'America/Chicago', label: 'CST (UTC-6) Chicago' },
  { value: 'America/New_York', label: 'EST (UTC-5) New York' },
  { value: 'America/Sao_Paulo', label: 'BRT (UTC-3) São Paulo' },
  { value: 'Atlantic/Reykjavik', label: 'UTC+0 Reykjavik' },
  { value: 'Europe/London', label: 'GMT (UTC+0) London' },
  { value: 'Europe/Paris', label: 'CET (UTC+1) Paris' },
  { value: 'Europe/Berlin', label: 'CET (UTC+1) Berlin' },
  { value: 'Europe/Moscow', label: 'MSK (UTC+3) Moscow' },
  { value: 'Asia/Dubai', label: 'GST (UTC+4) Dubai' },
  { value: 'Asia/Kolkata', label: 'IST (UTC+5:30) Mumbai' },
  { value: 'Asia/Bangkok', label: 'ICT (UTC+7) Bangkok' },
  { value: 'Asia/Shanghai', label: 'CST (UTC+8) Shanghai' },
  { value: 'Asia/Hong_Kong', label: 'HKT (UTC+8) Hong Kong' },
  { value: 'Asia/Singapore', label: 'SGT (UTC+8) Singapore' },
  { value: 'Asia/Tokyo', label: 'JST (UTC+9) Tokyo' },
  { value: 'Asia/Seoul', label: 'KST (UTC+9) Seoul' },
  { value: 'Australia/Sydney', label: 'AEST (UTC+10) Sydney' },
  { value: 'Pacific/Auckland', label: 'NZST (UTC+12) Auckland' },
]

const quickZones = [
  { zone: 'America/New_York', label: 'New York' },
  { zone: 'Europe/London', label: 'London' },
  { zone: 'Asia/Shanghai', label: 'Shanghai' },
  { zone: 'Asia/Tokyo', label: 'Tokyo' },
]

function formatInTz(tz) {
  if (!localDate.value) return '--:--'
  try {
    return localDate.value.toLocaleString('en-GB', {
      timeZone: tz,
      hour: '2-digit', minute: '2-digit', hour12: false,
      month: 'short', day: 'numeric',
    })
  } catch { return '--:--' }
}

const targetTimeStr = computed(() => {
  if (!localDate.value) return ''
  try {
    return localDate.value.toLocaleString('en-GB', {
      timeZone: targetTz.value,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    })
  } catch { return '' }
})
</script>

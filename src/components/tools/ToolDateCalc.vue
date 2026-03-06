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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const today = new Date().toISOString().slice(0, 10)
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
</script>

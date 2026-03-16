<template>
  <div class="space-y-4">
    <!-- Category tabs -->
    <div class="flex flex-wrap gap-1.5">
      <button v-for="cat in categories" :key="cat.key" @click="activeCat = cat.key"
        :class="activeCat === cat.key ? 'btn btn-primary text-xs' : 'btn btn-outline text-xs'">
        {{ cat.name }}
      </button>
    </div>

    <!-- Converter -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.input') }}</label>
        <input v-model.number="inputVal" type="number" step="any" class="input font-mono text-sm" placeholder="1" />
        <select v-model="fromUnit" class="input text-sm mt-2">
          <option v-for="u in currentUnits" :key="u.key" :value="u.key">{{ u.label }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.output') }}</label>
        <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900">{{ result }}</div>
        <select v-model="toUnit" class="input text-sm mt-2">
          <option v-for="u in currentUnits" :key="u.key" :value="u.key">{{ u.label }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t } = useToolHelper()

const unitData = {
  length: {
    units: [
      { key: 'mm', label: 'mm', factor: 0.001 },
      { key: 'cm', label: 'cm', factor: 0.01 },
      { key: 'm', label: 'm', factor: 1 },
      { key: 'km', label: 'km', factor: 1000 },
      { key: 'in', label: 'inch', factor: 0.0254 },
      { key: 'ft', label: 'feet', factor: 0.3048 },
      { key: 'yd', label: 'yard', factor: 0.9144 },
      { key: 'mi', label: 'mile', factor: 1609.344 },
    ]
  },
  weight: {
    units: [
      { key: 'mg', label: 'mg', factor: 0.000001 },
      { key: 'g', label: 'g', factor: 0.001 },
      { key: 'kg', label: 'kg', factor: 1 },
      { key: 't', label: 'tonne', factor: 1000 },
      { key: 'oz', label: 'oz', factor: 0.0283495 },
      { key: 'lb', label: 'lb', factor: 0.453592 },
    ]
  },
  temperature: {
    units: [
      { key: 'c', label: '°C', factor: null },
      { key: 'f', label: '°F', factor: null },
      { key: 'k', label: 'K', factor: null },
    ]
  },
  area: {
    units: [
      { key: 'mm2', label: 'mm²', factor: 0.000001 },
      { key: 'cm2', label: 'cm²', factor: 0.0001 },
      { key: 'm2', label: 'm²', factor: 1 },
      { key: 'km2', label: 'km²', factor: 1000000 },
      { key: 'ha', label: 'hectare', factor: 10000 },
      { key: 'ac', label: 'acre', factor: 4046.86 },
      { key: 'ft2', label: 'ft²', factor: 0.092903 },
    ]
  },
  volume: {
    units: [
      { key: 'ml', label: 'mL', factor: 0.001 },
      { key: 'l', label: 'L', factor: 1 },
      { key: 'm3', label: 'm³', factor: 1000 },
      { key: 'gal', label: 'gallon (US)', factor: 3.78541 },
      { key: 'qt', label: 'quart', factor: 0.946353 },
      { key: 'cup', label: 'cup', factor: 0.236588 },
      { key: 'floz', label: 'fl oz', factor: 0.0295735 },
    ]
  },
  speed: {
    units: [
      { key: 'ms', label: 'm/s', factor: 1 },
      { key: 'kmh', label: 'km/h', factor: 0.277778 },
      { key: 'mph', label: 'mph', factor: 0.44704 },
      { key: 'kn', label: 'knot', factor: 0.514444 },
    ]
  },
  data: {
    units: [
      { key: 'b', label: 'B', factor: 1 },
      { key: 'kb', label: 'KB', factor: 1024 },
      { key: 'mb', label: 'MB', factor: 1048576 },
      { key: 'gb', label: 'GB', factor: 1073741824 },
      { key: 'tb', label: 'TB', factor: 1099511627776 },
    ]
  },
  time: {
    units: [
      { key: 'ms', label: 'ms', factor: 0.001 },
      { key: 's', label: 's', factor: 1 },
      { key: 'min', label: 'min', factor: 60 },
      { key: 'h', label: 'h', factor: 3600 },
      { key: 'd', label: 'day', factor: 86400 },
      { key: 'wk', label: 'week', factor: 604800 },
      { key: 'mo', label: 'month (30d)', factor: 2592000 },
      { key: 'yr', label: 'year (365d)', factor: 31536000 },
    ]
  },
}

const categories = computed(() => [
  { key: 'length', name: t('toolbox.unitLength') },
  { key: 'weight', name: t('toolbox.unitWeight') },
  { key: 'temperature', name: t('toolbox.unitTemperature') },
  { key: 'area', name: t('toolbox.unitArea') },
  { key: 'volume', name: t('toolbox.unitVolume') },
  { key: 'speed', name: t('toolbox.unitSpeed') },
  { key: 'data', name: t('toolbox.unitData') },
  { key: 'time', name: t('toolbox.unitTime') },
])

const activeCat = ref('length')
const inputVal = ref(1)
const fromUnit = ref('m')
const toUnit = ref('cm')

watch(activeCat, () => {
  const units = unitData[activeCat.value].units
  fromUnit.value = units[0].key
  toUnit.value = units.length > 1 ? units[1].key : units[0].key
})

const currentUnits = computed(() => unitData[activeCat.value].units)

function convertTemperature(val, from, to) {
  if (from === to) return val
  let celsius
  if (from === 'c') celsius = val
  else if (from === 'f') celsius = (val - 32) * 5 / 9
  else celsius = val - 273.15
  if (to === 'c') return celsius
  if (to === 'f') return celsius * 9 / 5 + 32
  return celsius + 273.15
}

const result = computed(() => {
  const v = inputVal.value
  if (v === null || v === '' || isNaN(v)) return ''
  if (activeCat.value === 'temperature') {
    return convertTemperature(v, fromUnit.value, toUnit.value).toFixed(4).replace(/\.?0+$/, '')
  }
  const units = unitData[activeCat.value].units
  const from = units.find(u => u.key === fromUnit.value)
  const to = units.find(u => u.key === toUnit.value)
  if (!from || !to) return ''
  return (v * from.factor / to.factor).toFixed(6).replace(/\.?0+$/, '')
})
</script>

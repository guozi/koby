<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="base in bases" :key="base.name">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ base.name }} ({{ base.radix }})</label>
        <input :value="values[base.key]" @input="e => onInput(base, e.target.value)" type="text" class="input font-mono text-sm" :placeholder="base.placeholder" />
      </div>
    </div>
    <div v-if="error" class="text-xs text-red-500">{{ error }}</div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const bases = [
  { name: 'BIN', key: 'bin', radix: 2, placeholder: '1010', pattern: /^[01]*$/ },
  { name: 'OCT', key: 'oct', radix: 8, placeholder: '12', pattern: /^[0-7]*$/ },
  { name: 'DEC', key: 'dec', radix: 10, placeholder: '10', pattern: /^[0-9]*$/ },
  { name: 'HEX', key: 'hex', radix: 16, placeholder: 'A', pattern: /^[0-9a-fA-F]*$/ },
]

const values = reactive({ bin: '', oct: '', dec: '', hex: '' })
const error = ref('')

function onInput(source, raw) {
  error.value = ''
  const val = raw.trim()
  if (!val) {
    for (const b of bases) values[b.key] = ''
    return
  }
  if (!source.pattern.test(val)) {
    error.value = `Invalid ${source.name} value`
    return
  }
  values[source.key] = val
  try {
    const prefixMap = { 2: '0b', 8: '0o', 10: '', 16: '0x' }
    const n = BigInt(prefixMap[source.radix] + val)
    for (const b of bases) {
      if (b.key !== source.key) {
        const s = n.toString(b.radix)
        values[b.key] = b.radix === 16 ? s.toUpperCase() : s
      }
    }
  } catch (e) {
    error.value = e.message
  }
}
</script>

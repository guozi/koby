<template>
  <div class="space-y-4">
    <!-- Standard bases -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="base in bases" :key="base.name">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ base.name }} ({{ base.radix }})</label>
        <input :value="values[base.key]" @input="e => onInput(base, e.target.value)" type="text" class="input font-mono text-sm" :placeholder="base.placeholder" />
      </div>
    </div>

    <!-- Custom base -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.radixCustom') }}</label>
      <div class="flex gap-2">
        <input v-model.number="customRadix" type="number" min="2" max="36" class="input font-mono text-sm w-20 text-center" placeholder="7" />
        <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900 flex-1">{{ customValue }}</div>
      </div>
    </div>

    <!-- Bit operations -->
    <div v-if="currentDec">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.radixBitOps') }}</label>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button v-for="op in bitOps" :key="op.name" @click="applyBitOp(op.fn)"
          class="btn btn-outline text-xs font-mono">{{ op.name }}</button>
      </div>
    </div>

    <!-- Complement display -->
    <div v-if="currentDec">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.radixComplement') }}</label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] text-gray-400 mb-1">{{ t('toolbox.radixOnesComplement') }}</label>
          <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900">{{ onesComplement }}</div>
        </div>
        <div>
          <label class="block text-[11px] text-gray-400 mb-1">{{ t('toolbox.radixTwosComplement') }}</label>
          <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900">{{ twosComplement }}</div>
        </div>
      </div>
    </div>

    <div v-if="error" class="text-xs text-red-500">{{ error }}</div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t } = useToolHelper()

const bases = [
  { name: 'BIN', key: 'bin', radix: 2, placeholder: '1010', pattern: /^[01]*$/ },
  { name: 'OCT', key: 'oct', radix: 8, placeholder: '12', pattern: /^[0-7]*$/ },
  { name: 'DEC', key: 'dec', radix: 10, placeholder: '10', pattern: /^[0-9]*$/ },
  { name: 'HEX', key: 'hex', radix: 16, placeholder: 'A', pattern: /^[0-9a-fA-F]*$/ },
]

const values = reactive({ bin: '', oct: '', dec: '', hex: '' })
const error = ref('')
const customRadix = ref(7)

const currentDec = computed(() => {
  const v = values.dec
  if (!v) return null
  try { return BigInt(v) } catch { return null }
})

const customValue = computed(() => {
  if (!currentDec.value) return ''
  const r = customRadix.value
  if (!r || r < 2 || r > 36) return ''
  try {
    const n = currentDec.value
    if (n < 0n) return '-' + (-n).toString(r).toUpperCase()
    return n.toString(r).toUpperCase()
  } catch { return '' }
})

const bitOps = [
  { name: 'NOT (~)', fn: n => ~n },
  { name: '<< 1', fn: n => n << 1n },
  { name: '>> 1', fn: n => n >> 1n },
  { name: 'AND 0xFF', fn: n => n & 0xFFn },
  { name: 'OR 0xFF', fn: n => n | 0xFFn },
  { name: 'XOR 0xFF', fn: n => n ^ 0xFFn },
]

function applyBitOp(fn) {
  if (!currentDec.value && currentDec.value !== 0n) return
  try {
    const result = fn(currentDec.value)
    onInput(bases[2], result.toString())
  } catch (e) { error.value = e.message }
}

const onesComplement = computed(() => {
  if (!currentDec.value && currentDec.value !== 0n) return ''
  const n = Number(currentDec.value) & 0xFF
  return (~n & 0xFF).toString(2).padStart(8, '0')
})

const twosComplement = computed(() => {
  if (!currentDec.value && currentDec.value !== 0n) return ''
  const n = Number(currentDec.value)
  return ((n < 0 ? 256 + n : n) & 0xFF).toString(2).padStart(8, '0')
})

function onInput(source, raw) {
  error.value = ''
  const val = raw.trim()
  if (!val) {
    for (const b of bases) values[b.key] = ''
    return
  }
  if (source.pattern && !source.pattern.test(val)) {
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

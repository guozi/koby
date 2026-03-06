<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <input v-model="hex" type="color" class="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
      <input v-model="hex" type="text" class="input font-mono text-sm flex-1" placeholder="#3B82F6" @input="fromHex" />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div v-for="item in [{ label: 'HEX', value: hex }, { label: 'RGB', value: rgb }, { label: 'HSL', value: hsl }]" :key="item.label">
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
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { copyResult } = useToolHelper()

const hex = ref('#3B82F6')
const rgb = ref('rgb(59, 130, 246)')
const hsl = ref('hsl(217, 91%, 60%)')

function hexToRgb(h) {
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16)
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
function fromHex() {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex.value)) return
  const { r, g, b } = hexToRgb(hex.value)
  rgb.value = `rgb(${r}, ${g}, ${b})`
  const { h, s, l } = rgbToHsl(r, g, b)
  hsl.value = `hsl(${h}, ${s}%, ${l}%)`
}
watch(hex, fromHex)
</script>

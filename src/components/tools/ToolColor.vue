<template>
  <div class="space-y-4">
    <!-- Color picker + HEX input -->
    <div class="flex items-center gap-3">
      <input v-model="hex" type="color" class="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
      <input v-model="hex" type="text" class="input font-mono text-sm flex-1" placeholder="#3B82F6" />
    </div>

    <!-- Large color preview -->
    <div class="h-16 rounded-xl border border-gray-200 dark:border-gray-700" :style="{ backgroundColor: hex }"></div>

    <!-- Color values grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div v-for="item in colorValues" :key="item.label">
        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">{{ item.label }}</label>
        <div class="flex gap-1">
          <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900 flex-1 truncate">{{ item.value }}</div>
          <button @click="copyResult(item.value)" class="btn btn-outline text-sm px-2">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- WCAG Contrast -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.colorContrast') }}</label>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 rounded-lg bg-white border border-gray-200 dark:border-gray-700 text-center">
          <div class="text-lg font-bold tabular-nums" :style="{ color: hex }">{{ contrastWhite.toFixed(2) }}:1</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ t('toolbox.colorContrastWhite') }}
            <span :class="contrastWhite >= 4.5 ? 'text-green-600' : 'text-red-500'" class="font-semibold ml-1">{{ contrastWhite >= 4.5 ? 'AA ✓' : 'AA ✗' }}</span>
          </div>
        </div>
        <div class="p-3 rounded-lg bg-gray-900 border border-gray-700 text-center">
          <div class="text-lg font-bold tabular-nums" :style="{ color: hex }">{{ contrastBlack.toFixed(2) }}:1</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ t('toolbox.colorContrastBlack') }}
            <span :class="contrastBlack >= 4.5 ? 'text-green-400' : 'text-red-400'" class="font-semibold ml-1">{{ contrastBlack >= 4.5 ? 'AA ✓' : 'AA ✗' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Complementary & Analogous -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.colorComplementary') }} / {{ t('toolbox.colorAnalogous') }}</label>
      <div class="flex gap-2">
        <div v-for="(c, i) in relatedColors" :key="i" class="flex-1 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer relative group"
          :style="{ backgroundColor: c }" @click="hex = c">
          <div class="absolute inset-x-0 -bottom-5 text-center text-[10px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{{ c }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'
import { hexToRgb, rgbToHsl, rgbToCmyk, rgbToOklch, luminance, contrastRatio, hslToHex } from '../../utils/color'

const { t, copyResult } = useToolHelper()

const hex = ref('#3B82F6')

const parsed = computed(() => {
  const { r, g, b } = hexToRgb(hex.value)
  const hslVal = rgbToHsl(r, g, b)
  return { r, g, b, ...hslVal }
})

const rgbStr = computed(() => `rgb(${parsed.value.r}, ${parsed.value.g}, ${parsed.value.b})`)
const hslStr = computed(() => `hsl(${parsed.value.h}, ${parsed.value.s}%, ${parsed.value.l}%)`)
const cmykStr = computed(() => {
  const cm = rgbToCmyk(parsed.value.r, parsed.value.g, parsed.value.b)
  return `cmyk(${cm.c}%, ${cm.m}%, ${cm.y}%, ${cm.k}%)`
})
const oklchStr = computed(() => {
  const ok = rgbToOklch(parsed.value.r, parsed.value.g, parsed.value.b)
  return `oklch(${ok.L}% ${ok.C} ${ok.H})`
})

const colorValues = computed(() => [
  { label: 'HEX', value: hex.value },
  { label: 'RGB', value: rgbStr.value },
  { label: 'HSL', value: hslStr.value },
  { label: 'OKLCH', value: oklchStr.value },
  { label: 'CMYK', value: cmykStr.value },
])

const lum = computed(() => luminance(parsed.value.r, parsed.value.g, parsed.value.b))
const contrastWhite = computed(() => contrastRatio(lum.value, 1))
const contrastBlack = computed(() => contrastRatio(lum.value, 0))

const relatedColors = computed(() => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex.value)) return []
  const { h, s, l } = parsed.value
  return [
    hslToHex((h + 180) % 360, s, l),
    hslToHex((h + 330) % 360, s, l),
    hslToHex((h + 30) % 360, s, l),
    hslToHex((h + 120) % 360, s, l),
    hslToHex((h + 240) % 360, s, l),
  ]
})
</script>

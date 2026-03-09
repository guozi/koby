<template>
  <div class="space-y-4">
    <!-- Color inputs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.contrastFg') }}</label>
        <div class="flex gap-2">
          <input v-model="fg" type="color" class="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
          <input v-model="fg" type="text" class="input font-mono text-sm flex-1" placeholder="#000000" />
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.contrastBg') }}</label>
        <div class="flex gap-2">
          <input v-model="bg" type="color" class="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
          <input v-model="bg" type="text" class="input font-mono text-sm flex-1" placeholder="#FFFFFF" />
        </div>
      </div>
    </div>

    <!-- Swap button -->
    <div class="flex justify-center">
      <button @click="[fg, bg] = [bg, fg]" class="btn btn-outline text-xs px-3">
        ⇄ {{ t('toolbox.contrastSwap') }}
      </button>
    </div>

    <!-- Ratio display -->
    <div class="text-center p-4 rounded-xl border border-gray-200 dark:border-gray-700">
      <div class="text-3xl font-bold tabular-nums" :class="ratio >= 4.5 ? 'text-green-600 dark:text-green-400' : ratio >= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'">
        {{ ratio.toFixed(2) }}:1
      </div>
      <div class="text-xs text-gray-400 mt-1">{{ t('toolbox.contrastRatio') }}</div>
    </div>

    <!-- WCAG levels -->
    <div class="grid grid-cols-2 gap-3">
      <div v-for="level in wcagLevels" :key="level.label"
        class="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ level.label }}</div>
        <div class="flex justify-between">
          <div>
            <span class="text-xs font-medium">AA</span>
            <span class="ml-1.5 text-xs font-bold" :class="ratio >= level.aa ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
              {{ ratio >= level.aa ? t('toolbox.contrastPass') + ' ✓' : t('toolbox.contrastFail') + ' ✗' }}
            </span>
          </div>
          <div>
            <span class="text-xs font-medium">AAA</span>
            <span class="ml-1.5 text-xs font-bold" :class="ratio >= level.aaa ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
              {{ ratio >= level.aaa ? t('toolbox.contrastPass') + ' ✓' : t('toolbox.contrastFail') + ' ✗' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Live preview -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.contrastPreview') }}</label>
      <div class="rounded-xl p-6 text-center space-y-2" :style="{ backgroundColor: bg, color: fg }">
        <div class="text-2xl font-bold">The quick brown fox</div>
        <div class="text-base">jumps over the lazy dog</div>
        <div class="text-sm">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'
import { hexToRgb, luminance, contrastRatio } from '../../utils/color'

const { t } = useToolHelper()

const fg = ref('#1D4ED8')
const bg = ref('#FFFFFF')

const ratio = computed(() => {
  const fgRgb = hexToRgb(fg.value)
  const bgRgb = hexToRgb(bg.value)
  const l1 = luminance(fgRgb.r, fgRgb.g, fgRgb.b)
  const l2 = luminance(bgRgb.r, bgRgb.g, bgRgb.b)
  return contrastRatio(l1, l2)
})

const wcagLevels = computed(() => [
  { label: t('toolbox.contrastNormal'), aa: 4.5, aaa: 7 },
  { label: t('toolbox.contrastLarge'), aa: 3, aaa: 4.5 },
])
</script>

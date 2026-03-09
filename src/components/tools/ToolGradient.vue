<template>
  <div class="space-y-4">
    <!-- Type toggle -->
    <div class="flex gap-2">
      <button @click="type = 'linear'" :class="type === 'linear' ? 'btn btn-primary text-sm' : 'btn btn-outline text-sm'">
        {{ t('toolbox.gradientLinear') }}
      </button>
      <button @click="type = 'radial'" :class="type === 'radial' ? 'btn btn-primary text-sm' : 'btn btn-outline text-sm'">
        {{ t('toolbox.gradientRadial') }}
      </button>
    </div>

    <!-- Angle (linear only) -->
    <div v-if="type === 'linear'">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.gradientAngle') }}: {{ angle }}°</label>
      <input v-model.number="angle" type="range" min="0" max="360" class="w-full accent-primary" />
    </div>

    <!-- Color stops -->
    <div class="space-y-2">
      <div v-for="(stop, i) in stops" :key="i" class="flex items-center gap-2">
        <input v-model="stop.color" type="color" class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" />
        <input v-model="stop.color" type="text" class="input font-mono text-xs w-24" />
        <input v-model.number="stop.pos" type="number" min="0" max="100" class="input font-mono text-xs w-16 text-center" />
        <span class="text-xs text-gray-400">%</span>
        <button v-if="stops.length > 2" @click="stops.splice(i, 1)"
          class="text-gray-400 hover:text-red-500 transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <button v-if="stops.length < 5" @click="addStop" class="btn btn-outline text-xs">
        + {{ t('toolbox.gradientAddStop') }}
      </button>
    </div>

    <!-- Preview -->
    <div class="h-32 rounded-xl border border-gray-200 dark:border-gray-700" :style="{ background: cssGradient }"></div>

    <!-- CSS output -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.gradientCss') }}</label>
      <div class="flex gap-1">
        <div class="input font-mono text-sm bg-gray-50 dark:bg-gray-900 flex-1 break-all">{{ cssCode }}</div>
        <button @click="copyResult(cssCode)" class="btn btn-outline text-sm px-2 self-start">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const type = ref('linear')
const angle = ref(135)
const stops = reactive([
  { color: '#6366F1', pos: 0 },
  { color: '#EC4899', pos: 100 },
])

function addStop() {
  if (stops.length >= 5) return
  const lastPos = stops[stops.length - 1].pos
  const newPos = Math.min(100, Math.round((lastPos + stops[stops.length - 2]?.pos || 0) / 2 + 25))
  stops.push({ color: '#10B981', pos: Math.min(100, newPos) })
  stops.sort((a, b) => a.pos - b.pos)
}

const stopsStr = computed(() =>
  stops.map(s => `${s.color} ${s.pos}%`).join(', ')
)

const cssGradient = computed(() =>
  type.value === 'linear'
    ? `linear-gradient(${angle.value}deg, ${stopsStr.value})`
    : `radial-gradient(circle, ${stopsStr.value})`
)

const cssCode = computed(() => `background: ${cssGradient.value};`)
</script>

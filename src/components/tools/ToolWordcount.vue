<template>
  <div class="space-y-3">
    <textarea v-model="input" class="input text-sm resize-none" rows="6" :placeholder="t('toolbox.wcHint')"></textarea>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="stat in stats" :key="stat.label" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
        <div class="text-2xl font-bold text-primary tabular-nums">{{ stat.value }}</div>
        <div class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t } = useToolHelper()

const input = ref('')

const chars = computed(() => input.value.length)
const charsNoSpace = computed(() => input.value.replace(/\s/g, '').length)
const words = computed(() => input.value.trim() ? input.value.trim().split(/\s+/).length : 0)
const lines = computed(() => input.value ? input.value.split('\n').length : 0)

const chineseChars = computed(() => {
  const m = input.value.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g)
  return m ? m.length : 0
})

const paragraphs = computed(() => {
  if (!input.value.trim()) return 0
  return input.value.split(/\n\s*\n/).filter(p => p.trim()).length
})

const sentences = computed(() => {
  if (!input.value.trim()) return 0
  const cn = input.value.match(/[^。！？.!?]*[。！？.!?]+/g)
  return cn ? cn.length : 0
})

const readTime = computed(() => {
  const cjk = chineseChars.value
  const eng = words.value
  const cjkMin = cjk / 400
  const engMin = eng / 200
  const total = Math.max(1, Math.ceil(cjkMin + engMin))
  return input.value.trim() ? total : 0
})

const stats = computed(() => [
  { value: chars.value, label: t('toolbox.chars') },
  { value: charsNoSpace.value, label: t('toolbox.charsNoSpace') },
  { value: words.value, label: t('toolbox.words') },
  { value: lines.value, label: t('toolbox.lines') },
  { value: chineseChars.value, label: t('toolbox.chinesChars') },
  { value: paragraphs.value, label: t('toolbox.paragraphCount') },
  { value: sentences.value, label: t('toolbox.sentenceCount') },
  { value: readTime.value ? `${readTime.value} ${t('toolbox.minutes')}` : '—', label: t('toolbox.readTime') },
])
</script>

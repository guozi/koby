<template>
  <div class="space-y-3">
    <textarea v-model="input" class="input text-sm resize-none" rows="6" :placeholder="t('toolbox.wcHint')"></textarea>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="stat in [
        { value: chars, label: t('toolbox.chars') },
        { value: charsNoSpace, label: t('toolbox.charsNoSpace') },
        { value: words, label: t('toolbox.words') },
        { value: lines, label: t('toolbox.lines') }
      ]" :key="stat.label" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
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
</script>

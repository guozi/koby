<template>
  <button
    @click="localeStore.toggle()"
    class="px-2 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors border border-gray-200 dark:border-gray-600"
    :title="localeStore.locale === 'zh' ? 'Switch to English' : '切换到中文'"
  >
    {{ localeStore.locale === 'zh' ? 'EN' : '中' }}
  </button>
</template>

<script setup>
import { useLocaleStore } from '../stores/locale'
const localeStore = useLocaleStore()
</script>

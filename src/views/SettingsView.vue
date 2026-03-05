<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ t('settings.title') }}</h1>

    <!-- Account -->
    <section class="mb-8">
      <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{{ t('settings.account') }}</h2>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        <div class="flex items-center justify-between px-5 py-4">
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('settings.name') }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ authStore.user?.name }}</span>
        </div>
        <div class="flex items-center justify-between px-5 py-4">
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('settings.email') }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ authStore.user?.email }}</span>
        </div>
      </div>
    </section>

    <!-- Import/Export -->
    <section class="mb-8">
      <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{{ t('settings.data') }}</h2>
      <ImportExportPanel />
    </section>

    <!-- About -->
    <section>
      <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{{ t('settings.about') }}</h2>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <img src="/logo.svg" alt="Koby" class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Koby</h3>
            <p class="text-xs text-gray-400">v0.1.0</p>
          </div>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {{ t('settings.aboutDesc') }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../i18n'
import ImportExportPanel from '../components/ImportExportPanel.vue'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

const authStore = useAuthStore()
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ t('settings.title') }}</h1>

    <!-- Account -->
    <section class="mb-6">
      <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{{ t('settings.account') }}</h2>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            :style="{ backgroundColor: avatarColor }">
            {{ avatarInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-base font-semibold text-gray-900 dark:text-white">{{ authStore.user?.name }}</div>
            <div class="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{{ authStore.user?.email }}</div>
          </div>
          <button @click="authStore.logout()" class="btn btn-outline text-sm flex-shrink-0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {{ t('settings.logout') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="mb-6">
      <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{{ t('settings.overview') }}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3.5 text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ stats.bookmarks }}</div>
          <div class="text-2xs text-gray-400 dark:text-gray-500 mt-1">{{ t('settings.totalBookmarks') }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3.5 text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ stats.collections }}</div>
          <div class="text-2xs text-gray-400 dark:text-gray-500 mt-1">{{ t('settings.totalCollections') }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3.5 text-center">
          <div class="text-2xl font-bold text-amber-500 tabular-nums">{{ stats.pinned }}</div>
          <div class="text-2xs text-gray-400 dark:text-gray-500 mt-1">{{ t('settings.totalPinned') }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3.5 text-center">
          <div class="text-2xl font-bold text-primary tabular-nums">{{ stats.tags }}</div>
          <div class="text-2xs text-gray-400 dark:text-gray-500 mt-1">{{ t('settings.totalTags') }}</div>
        </div>
      </div>
    </section>

    <!-- Shortcuts + About: side by side -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
      <!-- Shortcuts -->
      <section>
        <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{{ t('settings.shortcuts') }}</h2>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 h-[calc(100%-1.75rem)]">
          <div class="flex items-center justify-between px-4 py-3.5">
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ t('settings.shortcutSearch') }}</span>
            <div class="flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 text-2xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">{{ isMac ? '⌘' : 'Ctrl' }}</kbd>
              <span class="text-2xs text-gray-400">+</span>
              <kbd class="px-1.5 py-0.5 text-2xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">K</kbd>
            </div>
          </div>
          <div class="flex items-center justify-between px-4 py-3.5">
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ t('modal.cancel') }}</span>
            <kbd class="px-1.5 py-0.5 text-2xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">Esc</kbd>
          </div>
        </div>
      </section>

      <!-- About -->
      <section>
        <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{{ t('settings.about') }}</h2>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-[calc(100%-1.75rem)]">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <img src="/logo.svg" alt="Koby" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">Koby</h3>
              <p class="text-2xs text-gray-400">{{ t('settings.version') }} 0.1.0</p>
            </div>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {{ t('settings.aboutDesc') }}
          </p>
        </div>
      </section>
    </div>

    <!-- Import/Export -->
    <section class="mb-6">
      <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{{ t('settings.data') }}</h2>
      <ImportExportPanel />
    </section>

    <!-- Browser Extension -->
    <section class="mb-6">
      <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{{ t('ext.title') }}</h2>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('ext.subtitle') }}</p>
            <div class="flex flex-wrap items-center gap-2 mt-3">
              <span v-for="(feature, i) in [t('ext.feature1'), t('ext.feature2'), t('ext.feature3'), t('ext.feature4')]" :key="i"
                class="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full bg-primary/5 dark:bg-primary/10 text-primary">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                {{ feature }}
              </span>
            </div>
            <div class="mt-4">
              <a href="https://github.com/user/koby/releases" target="_blank" rel="noopener noreferrer"
                class="btn btn-primary text-sm">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {{ t('ext.download') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Danger zone -->
    <section>
      <h2 class="text-xs font-semibold text-red-400 dark:text-red-500 uppercase tracking-wider mb-3">{{ t('settings.danger') }}</h2>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/50">
        <div class="flex items-center justify-between p-5">
          <div>
            <div class="text-sm font-medium text-red-600 dark:text-red-400">{{ t('settings.deleteAccount') }}</div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ t('settings.deleteAccountDesc') }}</p>
          </div>
          <button @click="showDeleteAccountModal = true" class="btn text-sm bg-red-500 text-white hover:bg-red-600 flex-shrink-0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            {{ t('settings.deleteAccount') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Delete account confirm modal -->
    <div v-if="showDeleteAccountModal" class="modal-overlay">
      <div class="modal-content max-w-md p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('settings.deleteAccountConfirm') }}</h3>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">{{ t('settings.deleteAccountWarning') }}</p>
        <div class="mb-5">
          <input
            v-model="deletePassword"
            type="password"
            :placeholder="t('settings.deleteAccountPassword')"
            class="input"
            :class="{ 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500': deleteError }"
            @keyup.enter="confirmDeleteAccount"
            @input="deleteError = ''"
          />
          <p v-if="deleteError" class="text-xs text-red-500 mt-1.5">{{ deleteError }}</p>
        </div>
        <div class="flex justify-end gap-3">
          <button @click="closeDeleteModal" :disabled="deletingAccount" class="btn btn-outline">{{ t('modal.cancel') }}</button>
          <button @click="confirmDeleteAccount" :disabled="deletingAccount || !deletePassword" class="btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
            {{ deletingAccount ? t('settings.deleting') : t('settings.deleteAccountBtn') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useBookmarkStore } from '../stores/bookmarks'
import { useI18n } from '../i18n'
import { authAPI } from '../services/api'
import ImportExportPanel from '../components/ImportExportPanel.vue'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

const authStore = useAuthStore()
const bookmarkStore = useBookmarkStore()

const isMac = computed(() => navigator.platform.toUpperCase().includes('MAC'))

const avatarInitial = computed(() => {
  const name = authStore.user?.name || ''
  return name.charAt(0).toUpperCase() || '?'
})

const avatarColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']
const avatarColor = computed(() => {
  const name = authStore.user?.name || ''
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
})

const showDeleteAccountModal = ref(false)
const deletePassword = ref('')
const deleteError = ref('')
const deletingAccount = ref(false)

function closeDeleteModal() {
  showDeleteAccountModal.value = false
  deletePassword.value = ''
  deleteError.value = ''
}

async function confirmDeleteAccount() {
  if (!deletePassword.value) {
    deleteError.value = t('settings.passwordRequired')
    return
  }
  deletingAccount.value = true
  deleteError.value = ''
  try {
    await authAPI.deleteAccount(deletePassword.value)
    authStore.logout()
  } catch (err) {
    const status = err.response?.status
    if (status === 401) {
      deleteError.value = t('settings.passwordWrong')
    } else {
      deleteError.value = t('settings.deleteAccountFailed')
    }
  } finally {
    deletingAccount.value = false
  }
}

function onEscape(e) {
  if (e.key === 'Escape' && showDeleteAccountModal.value) closeDeleteModal()
}
onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => document.removeEventListener('keydown', onEscape))

const stats = computed(() => {
  const bookmarks = bookmarkStore.bookmarks
  const tagSet = new Set()
  bookmarks.forEach(b => {
    if (b.tags) b.tags.forEach(tag => tagSet.add(tag))
  })
  return {
    bookmarks: bookmarks.length,
    collections: bookmarkStore.getAllCollections.length,
    pinned: bookmarks.filter(b => b.is_pinned).length,
    tags: tagSet.size
  }
})
</script>

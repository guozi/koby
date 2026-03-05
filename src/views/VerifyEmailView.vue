<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 text-center">
        <div v-if="loading" class="py-8">
          <svg class="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">Verifying email...</p>
        </div>

        <div v-else-if="error" class="py-6">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Verification Failed</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ error }}</p>
          <router-link to="/login" class="btn btn-primary">Back to Sign In</router-link>
        </div>

        <div v-else class="py-6">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Email Verified</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useBookmarkStore } from '../stores/bookmarks'
import { authAPI } from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const bookmarkStore = useBookmarkStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    error.value = 'Missing verification token'
    loading.value = false
    return
  }
  try {
    const data = await authAPI.verifyEmail(token)
    authStore.setAuth(data.token, data.user)
    bookmarkStore.resetState()
    await bookmarkStore.initialize()
    loading.value = false
    setTimeout(() => router.push('/'), 1500)
  } catch (err) {
    error.value = err.response?.data?.message || 'Verification failed'
    loading.value = false
  }
})
</script>

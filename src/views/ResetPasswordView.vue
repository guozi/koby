<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 text-center">
        <div v-if="loading" class="py-8">
          <svg class="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">Processing...</p>
        </div>

        <div v-else-if="success" class="py-6">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Password Reset</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">You can now sign in with your new password.</p>
          <router-link to="/login" class="btn btn-primary">Sign In</router-link>
        </div>

        <div v-else-if="tokenMissing" class="py-6">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Invalid Link</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Missing reset token. Please request a new reset link.</p>
          <router-link to="/forgot-password" class="btn btn-primary">Request New Link</router-link>
        </div>

        <form v-else @submit.prevent="handleReset" class="py-2 space-y-4 text-left">
          <div class="text-center mb-2">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-3">
              <img src="/logo.svg" alt="Koby" class="h-7 w-7" />
            </div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Set New Password</h2>
          </div>
          <div v-if="errorMsg" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {{ errorMsg }}
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
            <input v-model="newPassword" type="password" required minlength="6" class="input" placeholder="Min 6 characters" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Confirm Password</label>
            <input v-model="confirmPassword" type="password" required minlength="6" class="input" />
          </div>
          <button type="submit" :disabled="loading" class="btn btn-primary w-full py-2.5 disabled:opacity-50">
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authAPI } from '../services/api'
import { useI18n, resolveErrorMessage } from '../i18n'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

const route = useRoute()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const success = ref(false)
const tokenMissing = ref(false)

let token = ''

onMounted(() => {
  token = route.query.token
  if (!token) tokenMissing.value = true
})

async function handleReset() {
  errorMsg.value = ''
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match'
    return
  }
  loading.value = true
  try {
    await authAPI.resetPassword(token, newPassword.value)
    success.value = true
  } catch (err) {
    errorMsg.value = resolveErrorMessage(err, t) || t('error.AUTH_RESET_FAILED')
  } finally {
    loading.value = false
  }
}
</script>

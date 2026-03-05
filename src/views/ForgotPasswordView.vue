<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <img src="/logo.svg" alt="Koby" class="h-8 w-8" />
        </div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
        <div v-if="submitted" class="py-6 text-center">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">If that email is registered, a reset link has been sent.</p>
          <router-link to="/login" class="btn btn-primary">Back to Sign In</router-link>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="errorMsg" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {{ errorMsg }}
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Enter your email and we'll send a reset link.</p>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
            <input v-model="email" type="email" required class="input" placeholder="you@example.com" />
          </div>
          <button type="submit" :disabled="loading" class="btn btn-primary w-full py-2.5 disabled:opacity-50">
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </button>
          <div class="text-center">
            <router-link to="/login" class="text-xs text-primary hover:text-primary-600 font-medium">Back to Sign In</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authAPI } from '../services/api'

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const submitted = ref(false)

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  try {
    await authAPI.forgotPassword(email.value)
    submitted.value = true
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Request failed, please try again'
  } finally {
    loading.value = false
  }
}
</script>

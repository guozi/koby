<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex items-center justify-center mb-6">
        <img src="/logo.svg" alt="Koby" class="h-10 w-10 mr-2" />
        <h1 class="text-2xl font-bold text-primary">找回密码</h1>
      </div>

      <div v-if="submitted" class="py-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-600 dark:text-gray-400 mb-4">如果该邮箱已注册，重置邮件已发送。请查收您的邮箱。</p>
        <router-link to="/login" class="btn btn-primary inline-block">返回登录</router-link>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="errorMsg" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
          {{ errorMsg }}
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">输入您的注册邮箱，我们将发送密码重置链接。</p>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">邮箱</label>
          <input v-model="email" type="email" required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <button type="submit" :disabled="loading" class="w-full btn btn-primary py-2">
          {{ loading ? '发送中...' : '发送重置链接' }}
        </button>
        <div class="text-center">
          <router-link to="/login" class="text-sm text-primary hover:underline">返回登录</router-link>
        </div>
      </form>
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
    errorMsg.value = err.response?.data?.message || '请求失败，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>

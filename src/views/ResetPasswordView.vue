<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-center">
      <div v-if="loading" class="py-8">
        <svg class="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="text-gray-600 dark:text-gray-400">正在处理...</p>
      </div>

      <div v-else-if="success" class="py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium mb-2 dark:text-white">密码重置成功</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">请使用新密码登录。</p>
        <router-link to="/login" class="btn btn-primary inline-block">前往登录</router-link>
      </div>

      <div v-else-if="tokenMissing" class="py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium mb-2 dark:text-white">链接无效</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">缺少重置 token，请重新申请密码重置。</p>
        <router-link to="/forgot-password" class="btn btn-primary inline-block">重新申请</router-link>
      </div>

      <form v-else @submit.prevent="handleReset" class="py-4 space-y-4 text-left">
        <div class="text-center mb-2">
          <img src="/logo.svg" alt="Koby" class="h-10 w-10 mx-auto mb-2" />
          <h2 class="text-xl font-bold text-primary">设置新密码</h2>
        </div>
        <div v-if="errorMsg" class="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
          {{ errorMsg }}
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">新密码</label>
          <input v-model="newPassword" type="password" required minlength="6"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          <p class="text-xs text-gray-500 mt-1">至少 6 位</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">确认密码</label>
          <input v-model="confirmPassword" type="password" required minlength="6"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <button type="submit" :disabled="loading" class="w-full btn btn-primary py-2">
          {{ loading ? '重置中...' : '重置密码' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authAPI } from '../services/api'

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
  if (!token) {
    tokenMissing.value = true
  }
})

async function handleReset() {
  errorMsg.value = ''

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  try {
    await authAPI.resetPassword(token, newPassword.value)
    success.value = true
  } catch (err) {
    errorMsg.value = err.response?.data?.message || '重置失败，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>

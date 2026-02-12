<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-center">
      <div v-if="loading" class="py-8">
        <svg class="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="text-gray-600 dark:text-gray-400">正在验证邮箱...</p>
      </div>

      <div v-else-if="error" class="py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium mb-2 dark:text-white">验证失败</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
        <router-link to="/login" class="btn btn-primary inline-block">返回登录</router-link>
      </div>

      <div v-else class="py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium mb-2 dark:text-white">邮箱验证成功</h3>
        <p class="text-gray-600 dark:text-gray-400">正在跳转...</p>
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
    error.value = '缺少验证 token'
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
    error.value = err.response?.data?.message || '验证失败'
    loading.value = false
  }
})
</script>

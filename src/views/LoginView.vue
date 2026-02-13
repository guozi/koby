<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex items-center justify-center mb-6">
        <img src="/logo.svg" alt="Koby" class="h-10 w-10 mr-2" />
        <h1 class="text-2xl font-bold text-primary">Koby</h1>
      </div>

      <!-- Tab 切换 -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          @click="activeTab = 'login'"
          class="flex-1 py-2 text-center transition-colors"
          :class="activeTab === 'login' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        >登录</button>
        <button
          @click="activeTab = 'register'"
          class="flex-1 py-2 text-center transition-colors"
          :class="activeTab === 'register' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        >注册</button>
      </div>

      <!-- 错误/成功提示 -->
      <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
        {{ errorMsg }}
        <button v-if="showResend" @click="resendVerification" class="underline ml-1">重新发送验证邮件</button>
      </div>
      <div v-if="successMsg" class="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md text-sm">
        {{ successMsg }}
      </div>

      <!-- 登录表单 -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">邮箱</label>
          <input v-model="loginForm.email" type="email" required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">密码</label>
          <input v-model="loginForm.password" type="password" required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          <div class="text-right mt-1">
            <router-link to="/forgot-password" class="text-xs text-primary hover:underline">忘记密码？</router-link>
          </div>
        </div>
        <button type="submit" :disabled="loading" class="w-full btn btn-primary py-2">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- 注册表单 -->
      <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">昵称</label>
          <input v-model="registerForm.name" type="text" required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">邮箱</label>
          <input v-model="registerForm.email" type="email" required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">密码</label>
          <input v-model="registerForm.password" type="password" required minlength="6"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          <p class="text-xs text-gray-500 mt-1">至少 6 位</p>
        </div>
        <button type="submit" :disabled="loading" class="w-full btn btn-primary py-2">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useBookmarkStore } from '../stores/bookmarks'
import { authAPI } from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
const bookmarkStore = useBookmarkStore()

const activeTab = ref('login')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showResend = ref(false)
const resendEmail = ref('')

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '' })

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  showResend.value = false
  try {
    const data = await authAPI.login(loginForm.value)
    authStore.setAuth(data.token, data.user)
    bookmarkStore.resetState()
    await bookmarkStore.initialize()
    router.push('/')
  } catch (err) {
    const resp = err.response?.data
    errorMsg.value = resp?.message || '登录失败'
    if (resp?.needVerification) {
      showResend.value = true
      resendEmail.value = loginForm.value.email
    }
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const data = await authAPI.register(registerForm.value)
    successMsg.value = data.message || '注册成功，请查收验证邮件'
    activeTab.value = 'login'
  } catch (err) {
    errorMsg.value = err.response?.data?.message || '注册失败'
  } finally {
    loading.value = false
  }
}

async function resendVerification() {
  try {
    const data = await authAPI.resendVerification(resendEmail.value)
    successMsg.value = data.message
    errorMsg.value = ''
    showResend.value = false
  } catch (err) {
    errorMsg.value = err.response?.data?.message || '发送失败'
  }
}
</script>

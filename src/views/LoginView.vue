<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <img src="/logo.svg" alt="Koby" class="h-8 w-8" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Koby</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ t('login.subtitle') }}</p>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
        <!-- Tabs -->
        <div class="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6">
          <button
            @click="activeTab = 'login'"
            class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200"
            :class="activeTab === 'login' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
          >{{ t('login.signIn') }}</button>
          <button
            @click="activeTab = 'register'"
            class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200"
            :class="activeTab === 'register' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
          >{{ t('login.signUp') }}</button>
        </div>

        <!-- Messages -->
        <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {{ errorMsg }}
          <button v-if="showResend" @click="resendVerification" class="underline ml-1 font-medium">{{ t('login.resend') }}</button>
        </div>
        <div v-if="successMsg" class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-lg text-sm">
          {{ successMsg }}
        </div>

        <!-- Login form -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('login.email') }}</label>
            <input v-model="loginForm.email" type="email" required class="input" placeholder="you@example.com" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('login.password') }}</label>
            <input v-model="loginForm.password" type="password" required class="input" placeholder="••••••••" />
            <div class="text-right mt-1.5">
              <router-link to="/forgot-password" class="text-xs text-primary hover:text-primary-600 font-medium">{{ t('login.forgotPassword') }}</router-link>
            </div>
          </div>
          <button type="submit" :disabled="loading" class="btn btn-primary w-full py-2.5 disabled:opacity-50">
            {{ loading ? t('login.signingIn') : t('login.signIn') }}
          </button>
        </form>

        <!-- Register form -->
        <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('login.name') }}</label>
            <input v-model="registerForm.name" type="text" required class="input" placeholder="Your name" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('login.email') }}</label>
            <input v-model="registerForm.email" type="email" required class="input" placeholder="you@example.com" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('login.password') }}</label>
            <input v-model="registerForm.password" type="password" required minlength="6" class="input" :placeholder="t('login.minChars')" />
          </div>
          <button type="submit" :disabled="loading" class="btn btn-primary w-full py-2.5 disabled:opacity-50">
            {{ loading ? t('login.creatingAccount') : t('login.signUp') }}
          </button>
        </form>
      </div>

      <!-- Theme toggle -->
      <div class="mt-6 flex justify-center gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useBookmarkStore } from '../stores/bookmarks'
import { authAPI } from '../services/api'
import { useI18n } from '../i18n'
import ThemeToggle from '../components/ThemeToggle.vue'
import LangToggle from '../components/LangToggle.vue'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

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
    bookmarkStore.initialize()
    router.push('/')
  } catch (err) {
    const resp = err.response?.data
    errorMsg.value = resp?.message || 'Login failed'
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
    successMsg.value = data.message || 'Account created. Please check your email to verify.'
    activeTab.value = 'login'
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Registration failed'
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
    errorMsg.value = err.response?.data?.message || 'Failed to send'
  }
}
</script>

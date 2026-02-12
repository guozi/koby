import { defineStore } from 'pinia'
import { authAPI } from '../services/api'
import router from '../router'
import { useBookmarkStore } from './bookmarks'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('koby_token') || null,
    user: JSON.parse(localStorage.getItem('koby_user') || 'null'),
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    setAuth(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('koby_token', token)
      localStorage.setItem('koby_user', JSON.stringify(user))
    },
    logout() {
      const bookmarkStore = useBookmarkStore()
      bookmarkStore.resetState()
      this.token = null
      this.user = null
      localStorage.removeItem('koby_token')
      localStorage.removeItem('koby_user')
      router.push('/login')
    },
    async checkAuth() {
      if (!this.token) return false
      try {
        const user = await authAPI.me()
        this.user = user
        localStorage.setItem('koby_user', JSON.stringify(user))
        return true
      } catch {
        this.logout()
        return false
      }
    },
  },
})

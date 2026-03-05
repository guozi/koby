import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref(localStorage.getItem('koby_locale') || 'zh')

  function setLocale(lang) {
    locale.value = lang
    localStorage.setItem('koby_locale', lang)
  }

  function toggle() {
    setLocale(locale.value === 'zh' ? 'en' : 'zh')
  }

  return { locale, setLocale, toggle }
})

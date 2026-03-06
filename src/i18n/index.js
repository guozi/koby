import { computed } from 'vue'
import { useLocaleStore } from '../stores/locale'
import { zh } from './zh'
import { en } from './en'

const messages = { zh, en }

export function useI18n() {
  const localeStore = useLocaleStore()

  const t = computed(() => {
    const lang = localeStore.locale
    const dict = messages[lang] || messages.zh
    return (key, params) => {
      let str = dict[key] || key
      if (params) {
        Object.keys(params).forEach(k => {
          str = str.replace(`{${k}}`, params[k])
        })
      }
      return str
    }
  })

  return { t }
}

export function resolveErrorMessage(error, t) {
  const data = error.response?.data
  const code = data?.code
  if (code) {
    const key = `error.${code}`
    const translated = t(key)
    if (translated !== key) return translated
  }
  return data?.message || null
}

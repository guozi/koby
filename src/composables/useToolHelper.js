import { useI18n } from '../i18n'
import { useToastStore } from '../stores/toast'

export function useToolHelper() {
  const { t: _t } = useI18n()
  const t = (key, params) => _t.value(key, params)
  const toast = useToastStore()

  async function copyResult(text) {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('toast.linkCopied'))
    } catch { toast.error(t('toast.copyFailed')) }
  }

  return { t, toast, copyResult }
}

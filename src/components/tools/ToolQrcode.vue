<template>
  <div class="space-y-3">
    <textarea v-model="input" class="input font-mono text-sm resize-none" rows="3" :placeholder="t('toolbox.qrInputHint')"></textarea>
    <div v-if="error" class="text-xs text-red-500">{{ error }}</div>
    <div v-if="dataUrl" class="flex flex-col items-center gap-3">
      <img :src="dataUrl" alt="QR Code" class="rounded-lg border border-gray-200 dark:border-gray-700" style="width:256px;height:256px" />
      <button @click="download" class="btn btn-primary text-sm">{{ t('toolbox.qrDownload') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import QRCode from 'qrcode'
import { useToolHelper } from '../../composables/useToolHelper'

const { t } = useToolHelper()

const input = ref('')
const dataUrl = ref('')
const error = ref('')

let debounce = null
watch(input, (val) => {
  clearTimeout(debounce)
  if (!val.trim()) { dataUrl.value = ''; error.value = ''; return }
  debounce = setTimeout(async () => {
    try {
      error.value = ''
      dataUrl.value = await QRCode.toDataURL(val, { width: 512, margin: 2 })
    } catch (e) { error.value = e.message; dataUrl.value = '' }
  }, 300)
})

function download() {
  if (!dataUrl.value) return
  const a = document.createElement('a')
  a.href = dataUrl.value
  a.download = 'qrcode.png'
  a.click()
}
</script>

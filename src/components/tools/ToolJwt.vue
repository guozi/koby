<template>
  <div class="space-y-3">
    <textarea v-model="input" class="input font-mono text-sm resize-none" rows="4" :placeholder="t('toolbox.jwtInputHint')"></textarea>
    <div class="flex gap-2">
      <button @click="decode" class="btn btn-primary text-sm">{{ t('toolbox.decode') }}</button>
      <button v-if="header" @click="copyResult(JSON.stringify(header, null, 2))" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
    </div>
    <div v-if="error" class="text-xs text-red-500">{{ error }}</div>
    <div v-if="header" class="space-y-3">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Header</label>
        <pre class="input font-mono text-sm bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap overflow-auto" style="max-height:12rem">{{ JSON.stringify(header, null, 2) }}</pre>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Payload</label>
        <pre class="input font-mono text-sm bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap overflow-auto" style="max-height:20rem">{{ JSON.stringify(payload, null, 2) }}</pre>
      </div>
      <div v-if="expInfo" class="flex items-center gap-2 text-sm">
        <span class="inline-block w-2 h-2 rounded-full" :class="expInfo.expired ? 'bg-red-500' : 'bg-green-500'"></span>
        <span :class="expInfo.expired ? 'text-red-500' : 'text-green-600 dark:text-green-400'">{{ expInfo.label }}</span>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.jwtSignature') }}</label>
        <div class="input font-mono text-xs bg-gray-50 dark:bg-gray-900 break-all">{{ signature }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const input = ref('')
const header = ref(null)
const payload = ref(null)
const signature = ref('')
const error = ref('')

function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return decodeURIComponent(escape(atob(str)))
}

function decode() {
  error.value = ''
  header.value = null
  payload.value = null
  signature.value = ''
  try {
    const parts = input.value.trim().split('.')
    if (parts.length !== 3) throw new Error(t('toolbox.jwtInvalid'))
    header.value = JSON.parse(b64urlDecode(parts[0]))
    payload.value = JSON.parse(b64urlDecode(parts[1]))
    signature.value = parts[2]
  } catch (e) {
    error.value = e.message
  }
}

const expInfo = computed(() => {
  if (!payload.value) return null
  const timestamps = []
  if (payload.value.exp) timestamps.push({ key: 'exp', ts: payload.value.exp })
  if (payload.value.iat) timestamps.push({ key: 'iat', ts: payload.value.iat })
  if (!payload.value.exp) return null
  const expDate = new Date(payload.value.exp * 1000)
  const expired = expDate < new Date()
  const label = expired
    ? `${t('toolbox.jwtExpired')} (${expDate.toLocaleString()})`
    : `${t('toolbox.jwtValid')} (${expDate.toLocaleString()})`
  return { expired, label }
})
</script>

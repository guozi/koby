<template>
  <div class="space-y-3">
    <input v-model="search" type="text" class="input text-sm" :placeholder="t('toolbox.httpSearch')" />
    <div v-for="group in filteredGroups" :key="group.label" class="space-y-1">
      <button @click="group.open = !group.open" class="flex items-center gap-2 w-full text-left text-sm font-semibold py-1.5"
        :style="{ color: group.color }">
        <svg class="w-3.5 h-3.5 transition-transform" :class="group.open ? 'rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
        {{ group.label }}
        <span class="text-xs text-gray-400 font-normal">({{ group.items.length }})</span>
      </button>
      <div v-if="group.open" class="space-y-0.5 ml-5">
        <div v-for="item in group.items" :key="item.code"
          class="flex gap-2 text-sm py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
          <span class="font-mono font-bold w-10 flex-shrink-0" :style="{ color: group.color }">{{ item.code }}</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ item.name }}</span>
          <span class="text-gray-400 dark:text-gray-500">— {{ item.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t } = useToolHelper()
const search = ref('')

const codes = [
  { code: 100, name: 'Continue', desc: 'The server has received the request headers' },
  { code: 101, name: 'Switching Protocols', desc: 'The server is switching protocols' },
  { code: 200, name: 'OK', desc: 'The request has succeeded' },
  { code: 201, name: 'Created', desc: 'The request has been fulfilled and a new resource created' },
  { code: 202, name: 'Accepted', desc: 'The request has been accepted for processing' },
  { code: 204, name: 'No Content', desc: 'The server has fulfilled the request with no content to return' },
  { code: 206, name: 'Partial Content', desc: 'The server is delivering only part of the resource' },
  { code: 301, name: 'Moved Permanently', desc: 'The resource has been permanently moved to a new URL' },
  { code: 302, name: 'Found', desc: 'The resource resides temporarily at a different URL' },
  { code: 304, name: 'Not Modified', desc: 'The resource has not been modified since the last request' },
  { code: 307, name: 'Temporary Redirect', desc: 'The resource resides temporarily at a different URL, method preserved' },
  { code: 308, name: 'Permanent Redirect', desc: 'The resource has been permanently moved, method preserved' },
  { code: 400, name: 'Bad Request', desc: 'The server cannot process the request due to client error' },
  { code: 401, name: 'Unauthorized', desc: 'Authentication is required and has failed or not been provided' },
  { code: 403, name: 'Forbidden', desc: 'The server understood the request but refuses to authorize it' },
  { code: 404, name: 'Not Found', desc: 'The requested resource could not be found' },
  { code: 405, name: 'Method Not Allowed', desc: 'The request method is not supported for the resource' },
  { code: 406, name: 'Not Acceptable', desc: 'The resource cannot generate content acceptable to the client' },
  { code: 408, name: 'Request Timeout', desc: 'The server timed out waiting for the request' },
  { code: 409, name: 'Conflict', desc: 'The request conflicts with the current state of the resource' },
  { code: 410, name: 'Gone', desc: 'The resource is no longer available and no forwarding address is known' },
  { code: 413, name: 'Payload Too Large', desc: 'The request payload exceeds the server limit' },
  { code: 414, name: 'URI Too Long', desc: 'The URI provided was too long for the server to process' },
  { code: 415, name: 'Unsupported Media Type', desc: 'The media format of the request is not supported' },
  { code: 422, name: 'Unprocessable Entity', desc: 'The request was well-formed but semantically erroneous' },
  { code: 429, name: 'Too Many Requests', desc: 'The user has sent too many requests in a given amount of time' },
  { code: 500, name: 'Internal Server Error', desc: 'The server encountered an unexpected condition' },
  { code: 501, name: 'Not Implemented', desc: 'The server does not support the functionality required' },
  { code: 502, name: 'Bad Gateway', desc: 'The server received an invalid response from the upstream server' },
  { code: 503, name: 'Service Unavailable', desc: 'The server is currently unable to handle the request' },
  { code: 504, name: 'Gateway Timeout', desc: 'The upstream server failed to send a request in time' },
]

const groupDefs = [
  { range: 1, label: '1xx — Informational', color: '#6B7280' },
  { range: 2, label: '2xx — Success', color: '#10B981' },
  { range: 3, label: '3xx — Redirection', color: '#F59E0B' },
  { range: 4, label: '4xx — Client Error', color: '#EF4444' },
  { range: 5, label: '5xx — Server Error', color: '#8B5CF6' },
]

const groups = reactive(groupDefs.map(g => ({
  ...g,
  open: true,
  allItems: codes.filter(c => Math.floor(c.code / 100) === g.range),
})))

const filteredGroups = computed(() => {
  const q = search.value.toLowerCase()
  return groups
    .map(g => ({
      ...g,
      items: q ? g.allItems.filter(c =>
        String(c.code).includes(q) || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
      ) : g.allItems,
    }))
    .filter(g => g.items.length > 0)
})
</script>

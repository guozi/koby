<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50" @click.self="close">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>
      <div class="relative max-w-lg w-full mx-auto mt-[15vh] animate-scale-in">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <!-- Search input -->
          <div class="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700">
            <svg v-if="!searching" class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <svg v-else class="animate-spin w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <input ref="inputRef" v-model="query" type="text" :placeholder="t('search.placeholder')"
              class="flex-1 py-3.5 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none" />
            <kbd class="hidden sm:inline-flex px-1.5 py-0.5 text-2xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="max-h-80 overflow-y-auto">
            <div v-if="query.trim() && !searching && results.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">
              {{ t('search.noResults') }}
            </div>
            <div v-else-if="!query.trim()" class="px-4 py-8 text-center text-sm text-gray-400">
              {{ t('search.hint') }}
            </div>
            <a v-for="(bookmark, idx) in results" :key="bookmark.id"
              :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              :class="{ 'bg-gray-50 dark:bg-gray-700/50': idx === activeIndex }"
              @click="close">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                :style="{ backgroundColor: (getCollection(bookmark.collection_id)?.color || '#6B7280') + '15' }">
                <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="" class="w-5 h-5 rounded" loading="lazy" />
                <svg v-else class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ bookmark.title }}</div>
                <div class="text-xs text-gray-400 truncate">{{ bookmark.url }}</div>
              </div>
              <span v-if="getCollection(bookmark.collection_id)" class="text-2xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                :style="{ backgroundColor: getCollection(bookmark.collection_id).color + '15', color: getCollection(bookmark.collection_id).color }">
                {{ getCollection(bookmark.collection_id).name }}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useBookmarkStore } from '../stores/bookmarks'
import { bookmarksAPI } from '../services/api'
import { useI18n } from '../i18n'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

const bookmarkStore = useBookmarkStore()

const visible = ref(false)
const query = ref('')
const inputRef = ref(null)
const activeIndex = ref(0)
const results = ref([])
const searching = ref(false)
let searchTimer = null

function getCollection(collectionId) {
  return bookmarkStore.getAllCollections.find(c => c.id === collectionId) || null
}

function safeUrl(url) {
  try { const p = new URL(url); return ['http:', 'https:'].includes(p.protocol) ? url : '#' } catch { return '#' }
}

function clientSearch(q) {
  return bookmarkStore.bookmarks
    .filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q) ||
      (b.description && b.description.toLowerCase().includes(q))
    )
    .slice(0, 20)
}

async function performSearch(q) {
  if (!q) { results.value = []; return }
  searching.value = true
  try {
    results.value = await bookmarksAPI.search(q)
  } catch {
    results.value = clientSearch(q)
  } finally {
    searching.value = false
  }
}

watch(query, (val) => {
  activeIndex.value = 0
  clearTimeout(searchTimer)
  const q = val.trim().toLowerCase()
  if (!q) { results.value = []; searching.value = false; return }
  // Instant client-side results
  results.value = clientSearch(q)
  // Debounced backend search for potentially better results
  searchTimer = setTimeout(() => performSearch(q), 300)
})

function open() {
  visible.value = true
  query.value = ''
  results.value = []
  activeIndex.value = 0
  nextTick(() => inputRef.value?.focus())
}

function close() {
  visible.value = false
  clearTimeout(searchTimer)
}

function onKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    visible.value ? close() : open()
  }
  if (visible.value && e.key === 'Escape') {
    close()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => { document.removeEventListener('keydown', onKeydown); clearTimeout(searchTimer) })

defineExpose({ open })
</script>

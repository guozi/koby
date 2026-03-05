<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{{ t('all.title') }}</h1>
        <p class="mt-1.5 text-gray-500 dark:text-gray-400 text-sm">{{ t('all.subtitle') }}</p>
      </div>
      <button @click="showAddBookmarkModal = true" class="btn btn-primary">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
        {{ t('home.addBookmark') }}
      </button>
    </div>

    <!-- Toolbar -->
    <div class="mb-5 space-y-3">
      <div class="flex flex-col md:flex-row md:items-center gap-3">
        <div class="relative flex-grow">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input v-model="searchQuery" type="text" :placeholder="t('col.searchPlaceholder')" class="input pl-9" @input="handleSearch" />
        </div>
        <div class="flex items-center gap-2">
          <select v-model="filterCollectionId" @change="currentPage = 1" class="select w-auto pr-9 text-xs">
            <option :value="null">{{ t('nav.collections') }}</option>
            <option v-for="c in collections" :key="c.id" :value="c.id">{{ c.icon }} {{ c.name }}</option>
          </select>
          <select v-model="currentSort" class="select w-auto pr-9 text-xs">
            <option value="created_desc">{{ t('sort.newest') }}</option>
            <option value="created_asc">{{ t('sort.oldest') }}</option>
            <option value="title_asc">{{ t('sort.titleAZ') }}</option>
            <option value="title_desc">{{ t('sort.titleZA') }}</option>
          </select>
          <button @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'" class="btn btn-outline px-2.5">
            <svg v-if="viewMode === 'grid'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
        </div>
      </div>

      <!-- Tag filters -->
      <div v-if="availableTags.length > 0" class="flex flex-wrap items-center gap-2">
        <span class="text-xs text-gray-400">{{ t('col.tags') }}:</span>
        <button v-for="tag in availableTags" :key="tag" @click="toggleTag(tag)"
          class="tag text-2xs cursor-pointer transition-colors"
          :class="selectedTags.includes(tag) ? 'bg-primary text-white border-primary' : 'hover:bg-gray-200 dark:hover:bg-gray-600'">
          {{ tag }}
        </button>
        <button v-if="searchQuery || selectedTags.length > 0 || filterCollectionId || currentSort !== 'created_desc'"
          @click="clearFilters" class="text-2xs text-gray-400 hover:text-primary underline ml-1">
          {{ t('col.clear') }}
        </button>
      </div>
    </div>

    <!-- Grid view -->
    <div v-if="processedBookmarks.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
      <div v-for="bookmark in visibleBookmarks" :key="bookmark.id"
        class="group flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: (getCollection(bookmark.collection_id)?.color || '#6B7280') + '15' }">
          <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="" class="w-6 h-6 rounded" />
          <svg v-else class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <h4 class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ bookmark.title }}</h4>
            <div v-if="bookmark.is_pinned" class="badge badge-featured text-2xs flex-shrink-0">{{ t('pinned') }}</div>
          </div>
          <a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer" class="text-xs text-primary hover:underline truncate block mt-0.5">{{ bookmark.url }}</a>
          <p v-if="bookmark.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{{ bookmark.description }}</p>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-2xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                  :style="getCollection(bookmark.collection_id) ? { backgroundColor: getCollection(bookmark.collection_id).color + '15', color: getCollection(bookmark.collection_id).color } : {}">
                  {{ getCollection(bookmark.collection_id)?.name || t('home.uncategorized') }}
                </span>
              <div v-if="bookmark.tags && bookmark.tags.length > 0" class="flex gap-1.5 overflow-hidden">
                <span v-for="tag in bookmark.tags.slice(0, 2)" :key="tag" class="text-2xs text-primary-500 dark:text-primary-400">#{{ tag }}</span>
              </div>
            </div>
            <div class="flex items-center gap-0.5 flex-shrink-0">
              <button @click="editBookmark(bookmark)" class="p-1 text-gray-400 hover:text-primary rounded transition-colors opacity-0 group-hover:opacity-100">
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </button>
              <button @click="confirmDeleteBookmark(bookmark)" class="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100">
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List view -->
    <div v-if="processedBookmarks.length > 0 && viewMode === 'list'" class="space-y-2 mb-6">
      <div v-for="bookmark in visibleBookmarks" :key="bookmark.id"
        class="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all duration-200">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: (getCollection(bookmark.collection_id)?.color || '#6B7280') + '15' }">
          <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="" class="w-6 h-6 rounded" />
          <svg v-else class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ bookmark.title }}</h4>
            <div v-if="bookmark.is_pinned" class="badge badge-featured text-2xs">{{ t('pinned') }}</div>
          </div>
          <a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer" class="text-xs text-primary hover:underline truncate block">{{ bookmark.url }}</a>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-2xs px-1.5 py-0.5 rounded font-medium"
              :style="getCollection(bookmark.collection_id) ? { backgroundColor: getCollection(bookmark.collection_id).color + '15', color: getCollection(bookmark.collection_id).color } : {}">
              {{ getCollection(bookmark.collection_id)?.name || t('home.uncategorized') }}
            </span>
            <div v-if="bookmark.tags && bookmark.tags.length > 0" class="flex flex-wrap gap-1.5">
              <span v-for="tag in bookmark.tags" :key="tag" class="text-2xs text-primary-500 dark:text-primary-400">#{{ tag }}</span>
            </div>
          </div>
        </div>
        <span class="text-2xs text-gray-400 flex-shrink-0 hidden sm:block">{{ formatDate(bookmark.created_at) }}</span>
        <div class="flex items-center gap-0.5 flex-shrink-0">
          <button @click="editBookmark(bookmark)" class="p-1 text-gray-400 hover:text-primary rounded transition-colors opacity-0 group-hover:opacity-100">
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
          </button>
          <button @click="confirmDeleteBookmark(bookmark)" class="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100">
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="processedBookmarks.length === 0" class="text-center py-16">
      <div class="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>
      <h3 class="text-base font-medium text-gray-500 dark:text-gray-400">{{ t('home.noBookmarks') }}</h3>
      <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">{{ t('home.noBookmarksDesc') }}</p>
      <button @click="showAddBookmarkModal = true" class="mt-4 btn btn-primary">{{ t('home.addBookmark') }}</button>
    </div>

    <!-- Load more sentinel -->
    <div v-if="hasMore" ref="sentinelRef" class="flex justify-center py-6">
      <button @click="loadMore" class="btn btn-outline text-sm">{{ t('bf.loadMore') }}</button>
    </div>

    <!-- Modals -->
    <div v-if="showAddBookmarkModal" class="modal-overlay">
      <BookmarkForm :bookmark="newBookmark" :collections="flatCollections" :isEditing="false" :submitting="submitting" @submit="addNewBookmark" @close="showAddBookmarkModal = false" />
    </div>
    <div v-if="showEditBookmarkModal" class="modal-overlay">
      <BookmarkForm :bookmark="editingBookmark" :collections="flatCollections" :isEditing="true" :submitting="submitting" @submit="updateBookmarkData" @close="showEditBookmarkModal = false" />
    </div>
    <div v-if="showDeleteConfirmModal" class="modal-overlay">
      <div class="modal-content max-w-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ t('modal.confirmDelete') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">{{ t('modal.deleteBookmark', { name: bookmarkToDelete?.title }) }}</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirmModal = false" :disabled="submitting" class="btn btn-outline">{{ t('modal.cancel') }}</button>
          <button @click="deleteBookmark()" :disabled="submitting" class="btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
            {{ submitting ? t('modal.deleting') : t('modal.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useBookmarkStore } from '../stores/bookmarks'
import { useToastStore } from '../stores/toast'
import { useI18n } from '../i18n'
import BookmarkForm from '../components/BookmarkForm.vue'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

const bookmarkStore = useBookmarkStore()
const toast = useToastStore()

const collections = computed(() => bookmarkStore.getAllCollections)
const flatCollections = computed(() => bookmarkStore.flatCollectionsWithDepth)
const allBookmarks = computed(() => bookmarkStore.bookmarks)

const searchQuery = ref('')
const searchTimeout = ref(null)
const currentSort = ref('created_desc')
const filterCollectionId = ref(null)
const selectedTags = ref([])
const viewMode = ref('grid')
const displayCount = ref(24)
const sentinelRef = ref(null)

const availableTags = computed(() => {
  const tagSet = new Set()
  allBookmarks.value.forEach(b => {
    if (b.tags && Array.isArray(b.tags)) b.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet)
})

const processedBookmarks = computed(() => {
  let result = [...allBookmarks.value]

  if (filterCollectionId.value) {
    result = result.filter(b => b.collection_id === filterCollectionId.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(b =>
      b.title.toLowerCase().includes(query) ||
      b.url.toLowerCase().includes(query) ||
      (b.description && b.description.toLowerCase().includes(query))
    )
  }

  if (selectedTags.value.length > 0) {
    result = result.filter(b => {
      if (!b.tags || !Array.isArray(b.tags)) return false
      return selectedTags.value.every(tag => b.tags.includes(tag))
    })
  }

  result.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1
    switch (currentSort.value) {
      case 'created_desc': return new Date(b.created_at) - new Date(a.created_at)
      case 'created_asc': return new Date(a.created_at) - new Date(b.created_at)
      case 'title_asc': return a.title.localeCompare(b.title)
      case 'title_desc': return b.title.localeCompare(a.title)
      default: return 0
    }
  })
  return result
})

const visibleBookmarks = computed(() => processedBookmarks.value.slice(0, displayCount.value))
const hasMore = computed(() => displayCount.value < processedBookmarks.value.length)

function loadMore() { displayCount.value += 24 }

function handleSearch() {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => { displayCount.value = 24 }, 300)
}

function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
  displayCount.value = 24
}

function clearFilters() { searchQuery.value = ''; selectedTags.value = []; currentSort.value = 'created_desc'; filterCollectionId.value = null; displayCount.value = 24 }

function getCollection(collectionId) {
  return collections.value.find(c => c.id === collectionId) || null
}

function formatDate(dateString) { return new Date(dateString).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) }
function safeUrl(url) { try { const p = new URL(url); return ['http:', 'https:'].includes(p.protocol) ? url : '#' } catch { return '#' } }

// Bookmark CRUD
const showAddBookmarkModal = ref(false)
const newBookmark = ref({ url: '', title: '', description: '', collection_id: null, favicon: '', tags: [], is_pinned: false })
const showEditBookmarkModal = ref(false)
const editingBookmark = ref(null)
const showDeleteConfirmModal = ref(false)
const bookmarkToDelete = ref(null)
const submitting = ref(false)

async function addNewBookmark(bookmark) {
  if (submitting.value) return
  submitting.value = true
  try {
    await bookmarkStore.addBookmark(bookmark)
    newBookmark.value = { url: '', title: '', description: '', collection_id: null, favicon: '', tags: [], is_pinned: false }
    showAddBookmarkModal.value = false
    toast.success(t('toast.bookmarkAdded'))
  } catch { toast.error(t('toast.addFailed')) } finally { submitting.value = false }
}

function editBookmark(bookmark) { editingBookmark.value = { ...bookmark }; showEditBookmarkModal.value = true }

async function updateBookmarkData(updated) {
  if (!updated || submitting.value) return
  submitting.value = true
  try { await bookmarkStore.updateBookmark(updated.id, updated); showEditBookmarkModal.value = false; toast.success(t('toast.bookmarkUpdated')) }
  catch { toast.error(t('toast.updateFailed')) } finally { submitting.value = false }
}

function confirmDeleteBookmark(bookmark) { bookmarkToDelete.value = bookmark; showDeleteConfirmModal.value = true }

let observer = null
watch(sentinelRef, (el) => {
  if (observer) observer.disconnect()
  if (!el) return
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && hasMore.value) loadMore()
  }, { rootMargin: '200px' })
  observer.observe(el)
})
onUnmounted(() => { if (observer) observer.disconnect() })

async function deleteBookmark() {
  if (!bookmarkToDelete.value || submitting.value) return
  submitting.value = true
  try { await bookmarkStore.removeBookmark(bookmarkToDelete.value.id); showDeleteConfirmModal.value = false; bookmarkToDelete.value = null; toast.success(t('toast.bookmarkDeleted')) }
  catch { toast.error(t('toast.deleteFailed')) } finally { submitting.value = false }
}
</script>

<template>
  <div>
    <!-- Hero section -->
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{{ t('home.title') }}</h1>
        <p class="mt-1.5 text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-xl">
          {{ t('home.subtitle') }}
        </p>
        <div class="mt-4 flex items-center gap-3">
          <button @click="showAddBookmarkModal = true" class="btn btn-primary">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
            {{ t('home.addBookmark') }}
          </button>
          <router-link to="/bookmarks" class="btn btn-outline">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            {{ t('home.browseAll') }}
          </router-link>
        </div>
      </div>
      <!-- Stats -->
      <div class="flex items-center gap-6 px-5 py-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ bookmarks.length }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ t('home.bookmarks') }}</div>
        </div>
        <div class="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ collections.length }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ t('home.collections') }}</div>
        </div>
      </div>
    </div>

    <!-- Collections quick access -->
    <section v-if="collections.length > 0" class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('home.collections') }}</h2>
        <router-link to="/collections" class="text-sm text-primary hover:text-primary-600 font-medium">{{ t('home.viewAll') }}</router-link>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <router-link
          v-for="collection in collections.slice(0, 10)"
          :key="collection.id"
          :to="`/collections?id=${collection.id}`"
          class="group flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200"
        >
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
               :style="{ backgroundColor: collection.color + '15' }">
            {{ collection.icon }}
          </div>
          <div class="min-w-0">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{{ collection.name }}</h3>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ getBookmarkCount(collection.id) }} {{ t('cf.links') }}</p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Recent bookmarks -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('home.recent') }}</h2>
      </div>

      <div v-if="recentBookmarks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div v-for="bookmark in recentBookmarks" :key="bookmark.id"
          class="group flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            :style="{ backgroundColor: (getCollection(bookmark.collection_id)?.color || '#6B7280') + '15' }">
            <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="" class="w-6 h-6 rounded" />
            <svg v-else class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer" class="font-medium text-sm text-gray-900 dark:text-white truncate hover:text-primary transition-colors">{{ bookmark.title }}</a>
              <div v-if="bookmark.is_pinned" class="badge badge-featured text-2xs flex-shrink-0">{{ t('pinned') }}</div>
            </div>
            <p v-if="bookmark.description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{{ bookmark.description }}</p>
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
                <a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer" class="p-1 text-gray-400 hover:text-primary rounded transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16">
        <div class="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h3 class="text-base font-medium text-gray-500 dark:text-gray-400">{{ t('home.noBookmarks') }}</h3>
        <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">{{ t('home.noBookmarksDesc') }}</p>
        <button @click="showAddBookmarkModal = true" class="mt-4 btn btn-primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          {{ t('home.addBookmark') }}
        </button>
      </div>
    </section>

    <!-- Add bookmark modal -->
    <div v-if="showAddBookmarkModal" class="modal-overlay">
      <BookmarkForm
        :bookmark="newBookmark"
        :collections="flatCollections"
        :isEditing="false"
        :submitting="submitting"
        @submit="addNewBookmark"
        @close="showAddBookmarkModal = false"
      />
    </div>

    <!-- Edit bookmark modal -->
    <div v-if="showEditBookmarkModal" class="modal-overlay">
      <BookmarkForm
        :bookmark="editingBookmark"
        :collections="flatCollections"
        :isEditing="true"
        :submitting="submitting"
        @submit="updateBookmarkData"
        @close="showEditBookmarkModal = false"
      />
    </div>

    <!-- Delete confirm modal -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
const bookmarks = computed(() => bookmarkStore.bookmarks)

const recentBookmarks = computed(() => {
  return [...bookmarks.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)
})

const showAddBookmarkModal = ref(false)
const defaultCollectionId = computed(() => collections.value.length > 0 ? collections.value[0].id : null)
const newBookmark = ref({ url: '', title: '', description: '', collection_id: null, favicon: '', tags: [] })

const showEditBookmarkModal = ref(false)
const editingBookmark = ref(null)

const showDeleteConfirmModal = ref(false)
const bookmarkToDelete = ref(null)
const submitting = ref(false)

function getBookmarkCount(collection_id) {
  return bookmarks.value.filter(b => b.collection_id === collection_id).length
}

function getCollection(collection_id) {
  return collections.value.find(c => c.id === collection_id) || null
}

function safeUrl(url) {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol) ? url : '#'
  } catch { return '#' }
}

async function addNewBookmark(bookmark) {
  if (submitting.value) return
  submitting.value = true
  try {
    bookmark.collection_id = bookmark.collection_id || defaultCollectionId.value
    await bookmarkStore.addBookmark(bookmark)
    newBookmark.value = { url: '', title: '', description: '', collection_id: defaultCollectionId.value, favicon: '', tags: [], is_pinned: false }
    showAddBookmarkModal.value = false
    toast.success(t('toast.bookmarkAdded'))
  } catch {
    toast.error(t('toast.addFailed'))
  } finally {
    submitting.value = false
  }
}

function editBookmark(bookmark) {
  editingBookmark.value = { ...bookmark }
  showEditBookmarkModal.value = true
}

async function updateBookmarkData(updatedBookmark) {
  if (!updatedBookmark || submitting.value) return
  submitting.value = true
  try {
    await bookmarkStore.updateBookmark(updatedBookmark.id, updatedBookmark)
    showEditBookmarkModal.value = false
    toast.success(t('toast.bookmarkUpdated'))
  } catch {
    toast.error(t('toast.updateFailed'))
  } finally {
    submitting.value = false
  }
}

function confirmDeleteBookmark(bookmark) {
  bookmarkToDelete.value = bookmark
  showDeleteConfirmModal.value = true
}

async function deleteBookmark() {
  if (!bookmarkToDelete.value || submitting.value) return
  submitting.value = true
  try {
    await bookmarkStore.removeBookmark(bookmarkToDelete.value.id)
    showDeleteConfirmModal.value = false
    bookmarkToDelete.value = null
    toast.success(t('toast.bookmarkDeleted'))
  } catch {
    toast.error(t('toast.deleteFailed'))
  } finally {
    submitting.value = false
  }
}

function onEscape(e) {
  if (e.key === 'Escape') {
    if (showDeleteConfirmModal.value) showDeleteConfirmModal.value = false
  }
}
onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => document.removeEventListener('keydown', onEscape))
</script>

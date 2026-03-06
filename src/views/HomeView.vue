<template>
  <div>
    <!-- Header: greeting + action -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ authStore.user?.name ? t('home.welcome', { name: authStore.user.name }) : t('home.welcomeDefault') }}
        </h1>
        <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">
          {{ t('home.statsLine', { bookmarks: bookmarks.length, collections: collections.length }) }}
        </p>
      </div>
      <button @click="showAddBookmarkModal = true"
        class="btn btn-primary self-start sm:self-auto flex-shrink-0">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
        {{ t('home.addBookmark') }}
      </button>
    </div>

    <!-- Pinned bookmarks -->
    <section v-if="pinnedBookmarks.length > 0" class="mb-10">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/></svg>
        <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('home.pinned') }}</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        <a v-for="bookmark in pinnedBookmarks" :key="bookmark.id"
          :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer"
          class="group flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all duration-200 relative">
          <!-- Left amber accent -->
          <div class="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-amber-400 dark:bg-amber-500"></div>
          <!-- Favicon -->
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            :style="{ backgroundColor: (getCollection(bookmark.collection_id)?.color || '#6B7280') + '12' }">
            <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="" class="w-5 h-5 rounded" loading="lazy" />
            <svg v-else class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{{ bookmark.title }}</div>
            <div class="text-2xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{{ getDomain(bookmark.url) }}</div>
          </div>
          <!-- Actions (stop propagation to prevent link navigation) -->
          <div class="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click.prevent="copyBookmarkLink(bookmark, toast, t)" class="p-1 text-gray-400 hover:text-primary rounded transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
            <button @click.prevent="togglePin(bookmark)" class="p-1 text-amber-500 hover:text-amber-600 rounded transition-colors">
              <PinIcon :isPinned="true" class="w-3.5 h-3.5" />
            </button>
          </div>
        </a>
      </div>
    </section>

    <!-- Recent bookmarks -->
    <section v-if="bookmarks.length > 0">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('home.recent') }}</h2>
        </div>
        <router-link to="/bookmarks" class="text-xs text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary font-medium transition-colors">
          {{ t('home.browseAll') }} &rarr;
        </router-link>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div v-for="bookmark in recentBookmarks" :key="bookmark.id"
          class="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 overflow-hidden">
          <!-- Card body -->
          <div class="p-3.5">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                :style="{ backgroundColor: (getCollection(bookmark.collection_id)?.color || '#6B7280') + '12' }">
                <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="" class="w-5 h-5 rounded" loading="lazy" />
                <svg v-else class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer"
                  class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                  {{ bookmark.title }}
                </a>
                <div class="text-2xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{{ getDomain(bookmark.url) }}</div>
                <p v-if="bookmark.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{{ bookmark.description }}</p>
              </div>
            </div>
          </div>
          <!-- Card footer -->
          <div class="px-3.5 py-2 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-2xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 truncate max-w-[120px]"
                :style="getCollection(bookmark.collection_id) ? { backgroundColor: getCollection(bookmark.collection_id).color + '15', color: getCollection(bookmark.collection_id).color } : {}">
                {{ getCollection(bookmark.collection_id)?.name || t('home.uncategorized') }}
              </span>
              <span class="text-2xs text-gray-400 dark:text-gray-500 flex-shrink-0">{{ relativeTime(bookmark.created_at) }}</span>
            </div>
            <div class="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="copyBookmarkLink(bookmark, toast, t)" class="p-1 text-gray-400 hover:text-primary rounded transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
              <button @click="editBookmark(bookmark)" class="p-1 text-gray-400 hover:text-primary rounded transition-colors">
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Empty state -->
    <section v-if="bookmarks.length === 0" class="flex flex-col items-center justify-center py-20">
      <div class="relative mb-6">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center">
          <svg class="w-12 h-12 text-primary-400 dark:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center">
          <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
        </div>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('home.noBookmarks') }}</h3>
      <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">{{ t('home.noBookmarksDesc') }}</p>
      <button @click="showAddBookmarkModal = true" class="mt-6 btn btn-primary">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
        {{ t('home.addBookmark') }}
      </button>
      <p class="mt-3 text-2xs text-gray-400 dark:text-gray-500">{{ t('home.noBookmarksHint') }}</p>
    </section>

    <!-- Browser Extension Guide -->
    <section v-if="!extensionDismissed" class="mt-10">
      <div class="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
        <!-- Dismiss button -->
        <button @click="dismissExtension"
          class="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors z-10">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div class="p-6 sm:p-8">
          <!-- Header -->
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('ext.title') }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ t('ext.subtitle') }}</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-6">
            <!-- Steps -->
            <div class="space-y-4">
              <div v-for="(step, i) in [
                { title: t('ext.step1Title'), desc: t('ext.step1Desc'), icon: '1' },
                { title: t('ext.step2Title'), desc: t('ext.step2Desc'), icon: '2' },
                { title: t('ext.step3Title'), desc: t('ext.step3Desc'), icon: '3' },
              ]" :key="i" class="flex gap-3">
                <div class="w-7 h-7 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {{ step.icon }}
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ step.title }}</div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{{ step.desc }}</p>
                </div>
              </div>
            </div>

            <!-- Features -->
            <div class="bg-white/60 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
              <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{{ t('ext.features') }}</div>
              <div class="grid grid-cols-2 gap-2.5">
                <div v-for="(feature, i) in [
                  { text: t('ext.feature1'), icon: 'bookmark' },
                  { text: t('ext.feature2'), icon: 'menu' },
                  { text: t('ext.feature3'), icon: 'duplicate' },
                  { text: t('ext.feature4'), icon: 'tag' },
                ]" :key="i" class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-xs text-gray-700 dark:text-gray-300 leading-snug">{{ feature.text }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 mt-6">
            <a href="https://github.com/user/koby/releases" target="_blank" rel="noopener noreferrer"
              class="btn btn-primary text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {{ t('ext.download') }}
            </a>
            <button @click="dismissExtension" class="btn btn-outline text-sm">{{ t('ext.dismiss') }}</button>
          </div>
        </div>
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
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { useI18n } from '../i18n'
import BookmarkForm from '../components/BookmarkForm.vue'
import PinIcon from '../components/PinIcon.vue'
import { copyBookmarkLink } from '../utils/share'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

const bookmarkStore = useBookmarkStore()
const authStore = useAuthStore()
const toast = useToastStore()

const collections = computed(() => bookmarkStore.getAllCollections)
const flatCollections = computed(() => bookmarkStore.flatCollectionsWithDepth)
const bookmarks = computed(() => bookmarkStore.bookmarks)

const pinnedBookmarks = computed(() => bookmarks.value.filter(b => b.is_pinned))

const recentBookmarks = computed(() => {
  return [...bookmarks.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 12)
})

async function togglePin(bookmark) {
  await bookmarkStore.toggleBookmarkPin(bookmark.id)
}

const showAddBookmarkModal = ref(false)
const defaultCollectionId = computed(() => collections.value.length > 0 ? collections.value[0].id : null)
const newBookmark = ref({ url: '', title: '', description: '', collection_id: null, favicon: '', tags: [] })

const showEditBookmarkModal = ref(false)
const editingBookmark = ref(null)

const showDeleteConfirmModal = ref(false)
const bookmarkToDelete = ref(null)
const submitting = ref(false)

const extensionDismissed = ref(localStorage.getItem('ext-guide-dismissed') === '1')
function dismissExtension() {
  extensionDismissed.value = true
  localStorage.setItem('ext-guide-dismissed', '1')
}

function getCollection(collection_id) {
  return collections.value.find(c => c.id === collection_id) || null
}

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return '' }
}

function safeUrl(url) {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol) ? url : '#'
  } catch { return '#' }
}

function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return t('home.justNow')
  if (minutes < 60) return t('home.minutesAgo', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('home.hoursAgo', { n: hours })
  const days = Math.floor(hours / 24)
  return t('home.daysAgo', { n: days })
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

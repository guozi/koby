<template>
  <div>
    <!-- Mode 1: Collection Management (no id in query) -->
    <template v-if="!hasCollectionId">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{{ t('col.manageTitle') }}</h1>
          <p class="mt-1.5 text-gray-500 dark:text-gray-400 text-sm">{{ t('col.manageSubtitle') }}</p>
        </div>
        <button @click="showAddCollectionModal = true" class="btn btn-primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          {{ t('col.createCollection') }}
        </button>
      </div>

      <!-- Collections grid -->
      <div v-if="collections.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="collection in collections" :key="collection.id"
          class="bookmark-card group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 overflow-hidden">
          <router-link :to="`/collections?id=${collection.id}`" class="block p-5">
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   :style="{ backgroundColor: collection.color + '15' }">
                {{ collection.icon }}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{{ collection.name }}</h3>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">{{ getBookmarkCount(collection.id) }} {{ t('cf.links') }}</p>
              </div>
            </div>
          </router-link>
          <!-- Actions -->
          <div class="px-5 pb-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="editCollection(collection)" class="text-xs text-gray-400 hover:text-primary transition-colors">
              <svg class="w-4 h-4 inline mr-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              {{ t('col.editCollection') }}
            </button>
            <button v-if="collections.length > 1" @click="confirmDeleteCollection(collection)" class="text-xs text-gray-400 hover:text-red-500 transition-colors">
              <svg class="w-4 h-4 inline mr-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              {{ t('col.deleteCollection') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16">
        <div class="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <h3 class="text-base font-medium text-gray-500">{{ t('col.noCollections') }}</h3>
        <button @click="showAddCollectionModal = true" class="mt-4 btn btn-primary">{{ t('col.createCollection') }}</button>
      </div>
    </template>

    <!-- Mode 2: Collection Detail (has id in query) -->
    <template v-else>
      <div v-if="currentCollection">
        <!-- Collection header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :style="{ backgroundColor: currentCollection.color + '15' }">
              {{ currentCollection.icon }}
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentCollection.name }}</h1>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{{ t('col.bookmarkCount', { n: processedBookmarks.length }) }}</p>
            </div>
          </div>
          <button @click="showAddBookmarkModal = true" class="btn btn-primary">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
            {{ t('col.addBookmark') }}
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
              <select v-model="currentSort" @change="changeSort(currentSort)" class="select w-auto pr-9 text-xs">
                <option value="created_desc">{{ t('sort.newest') }}</option>
                <option value="created_asc">{{ t('sort.oldest') }}</option>
                <option value="title_asc">{{ t('sort.titleAZ') }}</option>
                <option value="title_desc">{{ t('sort.titleZA') }}</option>
                <option value="url_asc">{{ t('sort.urlAZ') }}</option>
                <option value="url_desc">{{ t('sort.urlZA') }}</option>
              </select>
              <button @click="toggleViewMode" class="btn btn-outline px-2.5">
                <svg v-if="viewMode === 'grid'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
            </div>
          </div>
          <div v-if="availableTags.length > 0" class="flex flex-wrap items-center gap-2">
            <span class="text-xs text-gray-400">{{ t('col.tags') }}:</span>
            <button v-for="tag in availableTags" :key="tag" @click="toggleTag(tag)"
              class="tag text-2xs cursor-pointer transition-colors"
              :class="selectedTags.includes(tag) ? 'bg-primary text-white border-primary' : 'hover:bg-gray-200 dark:hover:bg-gray-600'">
              {{ tag }}
            </button>
            <button v-if="searchQuery || selectedTags.length > 0 || currentSort !== 'created_desc'"
              @click="clearFilters" class="text-2xs text-gray-400 hover:text-primary underline ml-1">
              {{ t('col.clear') }}
            </button>
          </div>
        </div>

        <!-- Grid view -->
        <div v-if="processedBookmarks.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <div v-for="bookmark in visibleBookmarks" :key="bookmark.id"
            class="bookmark-card group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div class="p-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  :style="{ backgroundColor: (currentCollection?.color || '#6B7280') + '15' }">
                  <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="" class="w-6 h-6 rounded" loading="lazy" />
                  <svg v-else class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer" class="font-medium text-sm text-gray-900 dark:text-white truncate hover:text-primary transition-colors">{{ bookmark.title }}</a>
                    <div v-if="bookmark.is_pinned" class="badge badge-featured text-2xs flex-shrink-0">{{ t('pinned') }}</div>
                  </div>
                  <span class="text-xs text-gray-400 dark:text-gray-500 truncate block mt-1">{{ bookmark.url }}</span>
                </div>
              </div>
              <p v-if="bookmark.description" class="text-xs text-gray-500 dark:text-gray-400 mt-2.5 line-clamp-2 leading-relaxed">{{ bookmark.description }}</p>
            </div>
            <div class="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-2xs text-gray-400 flex-shrink-0">{{ formatDate(bookmark.created_at) }}</span>
                <div v-if="bookmark.tags && bookmark.tags.length > 0" class="flex gap-1.5 overflow-hidden">
                  <span v-for="tag in bookmark.tags.slice(0, 2)" :key="tag" class="text-2xs text-primary-500 dark:text-primary-400">#{{ tag }}</span>
                </div>
              </div>
              <div class="flex items-center gap-0.5 flex-shrink-0">
                <button @click="copyBookmarkLink(bookmark, toast, t)" class="p-1 text-gray-400 hover:text-primary rounded transition-colors opacity-0 group-hover:opacity-100">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                </button>
                <button @click="togglePin(bookmark)" class="p-1 rounded transition-colors" :class="bookmark.is_pinned ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500 opacity-0 group-hover:opacity-100'">
                  <PinIcon :isPinned="!!bookmark.is_pinned" class="w-3.5 h-3.5" />
                </button>
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

        <!-- List view -->
        <div v-if="processedBookmarks.length > 0 && viewMode === 'list'" class="space-y-3 mb-6">
          <div v-for="bookmark in visibleBookmarks" :key="bookmark.id"
            class="bookmark-card group flex items-center gap-4 px-5 py-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all duration-200">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: (currentCollection?.color || '#6B7280') + '15' }">
              <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="" class="w-6 h-6 rounded" loading="lazy" />
              <svg v-else class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-primary transition-colors">{{ bookmark.title }}</a>
                <div v-if="bookmark.is_pinned" class="badge badge-featured text-2xs">{{ t('pinned') }}</div>
              </div>
              <span class="text-xs text-gray-400 dark:text-gray-500 truncate block mt-1">{{ bookmark.url }}</span>
              <div v-if="bookmark.tags && bookmark.tags.length > 0" class="mt-2 flex flex-wrap gap-1.5">
                <span v-for="tag in bookmark.tags" :key="tag" class="text-2xs text-primary-500 dark:text-primary-400">#{{ tag }}</span>
              </div>
            </div>
            <span class="text-2xs text-gray-400 flex-shrink-0 hidden sm:block">{{ formatDate(bookmark.created_at) }}</span>
            <div class="flex items-center gap-1 flex-shrink-0">
              <button @click="copyBookmarkLink(bookmark, toast, t)" class="p-1.5 text-gray-400 hover:text-primary rounded transition-colors opacity-0 group-hover:opacity-100">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
              <button @click="togglePin(bookmark)" class="p-1.5 rounded transition-colors" :class="bookmark.is_pinned ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500 opacity-0 group-hover:opacity-100'">
                <PinIcon :isPinned="!!bookmark.is_pinned" class="w-4 h-4" />
              </button>
              <button @click="editBookmark(bookmark)" class="p-1.5 text-gray-400 hover:text-primary rounded transition-colors opacity-0 group-hover:opacity-100">
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </button>
              <button @click="confirmDeleteBookmark(bookmark)" class="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100">
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="processedBookmarks.length === 0" class="text-center py-16">
          <div class="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 class="text-base font-medium text-gray-500 dark:text-gray-400">{{ t('col.noBookmarks') }}</h3>
          <p class="mt-1 text-sm text-gray-400">{{ t('col.noBookmarksDesc') }}</p>
          <button @click="showAddBookmarkModal = true" class="mt-4 btn btn-primary">{{ t('col.addBookmark') }}</button>
        </div>

        <!-- Load more sentinel -->
        <div v-if="hasMore" ref="sentinelRef" class="flex justify-center py-6">
          <button @click="loadMore" class="btn btn-outline text-sm">{{ t('bf.loadMore') }}</button>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <div v-if="showAddBookmarkModal" class="modal-overlay">
      <BookmarkForm :bookmark="newBookmark" :collections="flatCollections" :isEditing="false" :submitting="submitting" @submit="addNewBookmark" @close="showAddBookmarkModal = false" />
    </div>
    <div v-if="showEditBookmarkModal" class="modal-overlay">
      <BookmarkForm :bookmark="editingBookmark" :collections="flatCollections" :isEditing="true" :submitting="submitting" @submit="updateBookmarkData" @close="showEditBookmarkModal = false" />
    </div>
    <div v-if="showAddCollectionModal" class="modal-overlay">
      <CollectionForm :collection="newCollection" :collections="flatCollections" :isEditing="false" :submitting="submitting" @submit="addNewCollection" @close="showAddCollectionModal = false" />
    </div>
    <div v-if="showEditCollectionModal" class="modal-overlay">
      <CollectionForm :collection="editingCollection" :collections="editableCollections" :isEditing="true" :submitting="submitting" @submit="updateCollectionData" @close="showEditCollectionModal = false" />
    </div>

    <!-- Delete bookmark confirm -->
    <div v-if="showDeleteBookmarkModal" class="modal-overlay">
      <div class="modal-content max-w-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ t('modal.confirmDelete') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">{{ t('modal.deleteBookmark', { name: bookmarkToDelete?.title }) }}</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteBookmarkModal = false" :disabled="submitting" class="btn btn-outline">{{ t('modal.cancel') }}</button>
          <button @click="deleteBookmark()" :disabled="submitting" class="btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">{{ submitting ? t('modal.deleting') : t('modal.delete') }}</button>
        </div>
      </div>
    </div>

    <!-- Delete collection confirm -->
    <div v-if="showDeleteCollectionModal" class="modal-overlay">
      <div class="modal-content max-w-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ t('modal.confirmDelete') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">{{ t('modal.deleteCollection', { name: collectionToDelete?.name }) }}</p>
        <p class="text-xs text-gray-400 mb-5">{{ t('modal.deleteCollectionHint') }}</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteCollectionModal = false" :disabled="submitting" class="btn btn-outline">{{ t('modal.cancel') }}</button>
          <button @click="deleteCollection()" :disabled="submitting" class="btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">{{ submitting ? t('modal.deleting') : t('modal.delete') }}</button>
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
import { useRoute, useRouter } from 'vue-router'
import { copyBookmarkLink } from '../utils/share'
import PinIcon from '../components/PinIcon.vue'
import BookmarkForm from '../components/BookmarkForm.vue'
import CollectionForm from '../components/CollectionForm.vue'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

const route = useRoute()
const router = useRouter()
const bookmarkStore = useBookmarkStore()
const toast = useToastStore()

const collections = computed(() => bookmarkStore.getAllCollections)
const bookmarks = computed(() => bookmarkStore.bookmarks)
const flatCollections = computed(() => bookmarkStore.flatCollectionsWithDepth)

const hasCollectionId = computed(() => !!route.query.id)

const collection_id = computed(() => {
  const id = route.query.id
  if (id && collections.value.some(c => c.id === id)) return id
  return null
})

const currentCollection = computed(() => {
  if (!collection_id.value) return null
  return collections.value.find(c => c.id === collection_id.value) || null
})

function getBookmarkCount(collectionId) {
  return bookmarks.value.filter(b => b.collection_id === collectionId).length
}

const displayCount = ref(24)
const sentinelRef = ref(null)

const currentSort = ref(route.query.sort || 'created_desc')
const viewMode = ref(route.query.view || 'grid')
const searchQuery = ref(route.query.q || '')
const searchTimeout = ref(null)
const selectedTags = ref([])

const availableTags = computed(() => {
  if (!currentCollection.value) return []
  const collectionBookmarks = bookmarks.value.filter(b => b.collection_id === currentCollection.value.id)
  const tagSet = new Set()
  collectionBookmarks.forEach(bookmark => {
    if (bookmark.tags && Array.isArray(bookmark.tags)) {
      bookmark.tags.forEach(tag => tagSet.add(tag))
    }
  })
  return Array.from(tagSet)
})

const processedBookmarks = computed(() => {
  if (!currentCollection.value) return []
  let result = bookmarks.value.filter(b => b.collection_id === currentCollection.value.id)

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

  result = [...result]
  result.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1
    switch (currentSort.value) {
      case 'created_desc': return new Date(b.created_at) - new Date(a.created_at)
      case 'created_asc': return new Date(a.created_at) - new Date(b.created_at)
      case 'title_asc': return a.title.localeCompare(b.title)
      case 'title_desc': return b.title.localeCompare(a.title)
      case 'url_asc': return a.url.localeCompare(b.url)
      case 'url_desc': return b.url.localeCompare(a.url)
      default: return 0
    }
  })
  return result
})

const visibleBookmarks = computed(() => processedBookmarks.value.slice(0, displayCount.value))
const hasMore = computed(() => displayCount.value < processedBookmarks.value.length)

function loadMore() { displayCount.value += 24 }

watch(() => route.query, (q) => {
  if (q.sort) currentSort.value = q.sort
  if (q.view) viewMode.value = q.view
  if (q.q !== undefined) searchQuery.value = q.q || ''
  displayCount.value = 24
}, { immediate: true })

function updateUrlParams() {
  router.replace({
    query: { ...route.query, sort: currentSort.value, view: viewMode.value, q: searchQuery.value || undefined }
  })
}

function changeSort(sort) { currentSort.value = sort; updateUrlParams() }
function toggleViewMode() { viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'; updateUrlParams() }

function handleSearch() {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => { displayCount.value = 24; updateUrlParams() }, 300)
}

function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
  displayCount.value = 24
}

function clearFilters() { searchQuery.value = ''; selectedTags.value = []; currentSort.value = 'created_desc'; displayCount.value = 24; updateUrlParams() }

function formatDate(dateString) { return new Date(dateString).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) }
function safeUrl(url) { try { const p = new URL(url); return ['http:', 'https:'].includes(p.protocol) ? url : '#' } catch { return '#' } }

// Bookmark CRUD
const showAddBookmarkModal = ref(false)
const newBookmark = computed(() => ({ url: '', title: '', description: '', collection_id: collection_id.value, favicon: '', tags: [], is_pinned: false }))
const showEditBookmarkModal = ref(false)
const editingBookmark = ref(null)
const showDeleteBookmarkModal = ref(false)
const bookmarkToDelete = ref(null)

async function addNewBookmark(bookmark) {
  if (submitting.value) return
  submitting.value = true
  try {
    bookmark.collection_id = collection_id.value
    await bookmarkStore.addBookmark(bookmark)
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

function confirmDeleteBookmark(bookmark) { bookmarkToDelete.value = bookmark; showDeleteBookmarkModal.value = true }

async function deleteBookmark() {
  if (!bookmarkToDelete.value || submitting.value) return
  submitting.value = true
  try { await bookmarkStore.removeBookmark(bookmarkToDelete.value.id); showDeleteBookmarkModal.value = false; bookmarkToDelete.value = null; toast.success(t('toast.bookmarkDeleted')) }
  catch { toast.error(t('toast.deleteFailed')) } finally { submitting.value = false }
}

async function togglePin(bookmark) { await bookmarkStore.toggleBookmarkPin(bookmark.id) }

// Collection CRUD
const showAddCollectionModal = ref(false)
const newCollection = ref({ name: '', icon: '📁', color: '#3B82F6', parent_id: null })
const showEditCollectionModal = ref(false)
const editingCollection = ref(null)
const showDeleteCollectionModal = ref(false)
const collectionToDelete = ref(null)
const submitting = ref(false)

const editableCollections = computed(() => {
  if (!editingCollection.value) return flatCollections.value
  const excludeIds = new Set()
  function collectDescendants(id) { excludeIds.add(id); collections.value.filter(c => c.parent_id === id).forEach(c => collectDescendants(c.id)) }
  collectDescendants(editingCollection.value.id)
  return flatCollections.value.filter(c => !excludeIds.has(c.id))
})

async function addNewCollection(collection) {
  if (submitting.value) return
  submitting.value = true
  try { await bookmarkStore.addCollection(collection); newCollection.value = { name: '', icon: '📁', color: '#3B82F6', parent_id: null }; showAddCollectionModal.value = false; toast.success(t('toast.collectionCreated')) }
  catch { toast.error(t('toast.createFailed')) } finally { submitting.value = false }
}

function editCollection(collection) { editingCollection.value = { ...collection }; showEditCollectionModal.value = true }

async function updateCollectionData(collection) {
  if (!collection || submitting.value) return
  submitting.value = true
  try { await bookmarkStore.updateCollection(collection.id, collection); showEditCollectionModal.value = false; toast.success(t('toast.collectionUpdated')) }
  catch { toast.error(t('toast.updateFailed')) } finally { submitting.value = false }
}

function confirmDeleteCollection(collection) { collectionToDelete.value = collection; showDeleteCollectionModal.value = true }

async function deleteCollection() {
  if (!collectionToDelete.value || submitting.value) return
  submitting.value = true
  try {
    await bookmarkStore.removeCollection(collectionToDelete.value.id)
    showDeleteCollectionModal.value = false; collectionToDelete.value = null; toast.success(t('toast.collectionDeleted'))
  } catch { toast.error(t('toast.deleteFailed')) } finally { submitting.value = false }
}

let observer = null
watch(sentinelRef, (el) => {
  if (observer) observer.disconnect()
  if (!el) return
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && hasMore.value) loadMore()
  }, { rootMargin: '200px' })
  observer.observe(el)
})

function onEscape(e) {
  if (e.key === 'Escape') {
    if (showDeleteBookmarkModal.value) showDeleteBookmarkModal.value = false
    if (showDeleteCollectionModal.value) showDeleteCollectionModal.value = false
  }
}
onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => { document.removeEventListener('keydown', onEscape); if (observer) observer.disconnect() })
</script>

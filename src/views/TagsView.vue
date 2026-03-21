<template>
  <div>
    <!-- Mode 1: Tag Management (no id in query) -->
    <template v-if="!hasTagId">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{{ t('tag.manageTitle') }}</h1>
          <p class="mt-1.5 text-gray-500 dark:text-gray-400 text-sm">{{ t('tag.manageSubtitle') }}</p>
        </div>
        <button @click="showAddTagModal = true" class="btn btn-primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          {{ t('tag.createTag') }}
        </button>
      </div>

      <!-- Tags grid -->
      <div v-if="tags.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="tag in tags" :key="tag.id"
          class="bookmark-card group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden">
          <router-link :to="`/tags?id=${tag.id}`" class="block p-5">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                :style="{ backgroundColor: tag.color + '15' }">
                <svg class="w-5 h-5" :style="{ color: tag.color }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{{ tag.name }}</h3>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">{{ tag.bookmark_count }} {{ t('cf.links') }}</p>
              </div>
            </div>
          </router-link>
          <div class="px-5 pb-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="editTag(tag)" class="text-xs text-gray-400 hover:text-primary transition-colors">
              <svg class="w-4 h-4 inline mr-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              {{ t('tag.editTag') }}
            </button>
            <button @click="startMerge(tag)" class="text-xs text-gray-400 hover:text-primary transition-colors">
              <svg class="w-4 h-4 inline mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              {{ t('tag.mergeTag') }}
            </button>
            <button @click="confirmDeleteTag(tag)" class="text-xs text-gray-400 hover:text-red-500 transition-colors">
              <svg class="w-4 h-4 inline mr-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              {{ t('tag.deleteTag') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16">
        <div class="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
        </div>
        <h3 class="text-base font-medium text-gray-500">{{ t('tag.noTags') }}</h3>
        <p class="mt-1 text-sm text-gray-400">{{ t('tag.noTagsDesc') }}</p>
        <button @click="showAddTagModal = true" class="mt-4 btn btn-primary">{{ t('tag.createTag') }}</button>
      </div>
    </template>

    <!-- Mode 2: Tag Detail (has id in query) -->
    <template v-else>
      <div v-if="currentTag">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" :style="{ backgroundColor: currentTag.color + '15' }">
              <svg class="w-6 h-6" :style="{ color: currentTag.color }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentTag.name }}</h1>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{{ t('col.bookmarkCount', { n: tagBookmarks.length }) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="editTag(currentTag)" class="btn btn-outline px-2.5" :title="t('tag.editTag')">
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            </button>
          </div>
        </div>

        <!-- Bookmark list -->
        <div v-if="tagBookmarks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <div v-for="bookmark in tagBookmarks" :key="bookmark.id"
            class="bookmark-card group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden">
            <div class="p-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  :style="{ backgroundColor: (getCollection(bookmark.collection_id)?.color || '#6B7280') + '15' }">
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
                <span class="text-2xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                  :style="getCollection(bookmark.collection_id) ? { backgroundColor: getCollection(bookmark.collection_id).color + '15', color: getCollection(bookmark.collection_id).color } : {}">
                  {{ getCollection(bookmark.collection_id)?.name || t('home.uncategorized') }}
                </span>
                <div v-if="bookmark.tags && bookmark.tags.length > 0" class="flex gap-1.5 overflow-hidden">
                  <span v-for="tag in bookmark.tags.slice(0, 2)" :key="tag.id" class="text-2xs text-primary-500 dark:text-primary-400">#{{ tag.name }}</span>
                </div>
              </div>
              <span class="text-2xs text-gray-400 flex-shrink-0">{{ formatDate(bookmark.created_at) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-16">
          <h3 class="text-base font-medium text-gray-500 dark:text-gray-400">{{ t('col.noBookmarks') }}</h3>
        </div>
      </div>
    </template>

    <!-- Add/Edit Tag Modal -->
    <div v-if="showAddTagModal || showEditTagModal" class="modal-overlay">
      <div class="modal-content max-w-md p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ showEditTagModal ? t('tag.editTag') : t('tag.createTag') }}</h3>
          <button @click="closeTagModal" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form @submit.prevent="submitTag" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('tag.name') }}</label>
            <input v-model="tagForm.name" type="text" required class="input" :placeholder="t('tag.namePlaceholder')" maxlength="50" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('tag.color') }}</label>
            <div class="flex items-center gap-2">
              <input v-model="tagForm.color" type="color" class="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
              <input v-model="tagForm.color" type="text" class="input flex-1" placeholder="#6B7280" />
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="closeTagModal" class="btn btn-outline">{{ t('bf.cancel') }}</button>
            <button type="submit" :disabled="submitting" class="btn btn-primary disabled:opacity-50">
              {{ submitting ? t('bf.saving') : (showEditTagModal ? t('bf.update') : t('bf.add')) }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Merge Tag Modal -->
    <div v-if="showMergeModal" class="modal-overlay">
      <div class="modal-content max-w-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ t('tag.mergeTag') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ t('tag.mergeHint', { name: mergeSource?.name }) }}</p>
        <select v-model="mergeTargetId" class="select mb-5">
          <option :value="null" disabled>{{ t('tag.mergeTarget') }}</option>
          <option v-for="tag in mergeTargets" :key="tag.id" :value="tag.id">{{ tag.name }} ({{ tag.bookmark_count }})</option>
        </select>
        <div class="flex justify-end gap-3">
          <button @click="showMergeModal = false" :disabled="submitting" class="btn btn-outline">{{ t('bf.cancel') }}</button>
          <button @click="doMerge" :disabled="submitting || !mergeTargetId" class="btn btn-primary disabled:opacity-50">
            {{ submitting ? t('bf.saving') : t('tag.mergeTag') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Tag Confirm -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content max-w-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ t('modal.confirmDelete') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">{{ t('tag.deleteConfirm', { name: tagToDelete?.name }) }}</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" :disabled="submitting" class="btn btn-outline">{{ t('modal.cancel') }}</button>
          <button @click="deleteTag" :disabled="submitting" class="btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
            {{ submitting ? t('modal.deleting') : t('modal.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBookmarkStore } from '../stores/bookmarks'
import { useToastStore } from '../stores/toast'
import { useI18n } from '../i18n'
import { tagsAPI } from '../services/api'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

const route = useRoute()
const bookmarkStore = useBookmarkStore()
const toast = useToastStore()

const tags = computed(() => bookmarkStore.sortedTags)
const hasTagId = computed(() => !!route.query.id)
const currentTag = computed(() => tags.value.find(t => t.id === route.query.id) || null)

const tagBookmarks = ref([])
const loadingBookmarks = ref(false)

watch(() => route.query.id, async (id) => {
  if (!id) { tagBookmarks.value = []; return }
  loadingBookmarks.value = true
  try {
    tagBookmarks.value = await tagsAPI.getBookmarks(id)
  } catch { tagBookmarks.value = [] }
  finally { loadingBookmarks.value = false }
}, { immediate: true })

function getCollection(collectionId) {
  return bookmarkStore.getAllCollections.find(c => c.id === collectionId) || null
}
function formatDate(dateString) { return new Date(dateString).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) }
function safeUrl(url) { try { const p = new URL(url); return ['http:', 'https:'].includes(p.protocol) ? url : '#' } catch { return '#' } }

// Tag CRUD
const showAddTagModal = ref(false)
const showEditTagModal = ref(false)
const tagForm = ref({ name: '', color: '#6B7280' })
const editingTagId = ref(null)
const submitting = ref(false)

function editTag(tag) {
  tagForm.value = { name: tag.name, color: tag.color }
  editingTagId.value = tag.id
  showEditTagModal.value = true
}

function closeTagModal() {
  showAddTagModal.value = false
  showEditTagModal.value = false
  tagForm.value = { name: '', color: '#6B7280' }
  editingTagId.value = null
}

async function submitTag() {
  if (submitting.value) return
  submitting.value = true
  try {
    if (showEditTagModal.value) {
      await bookmarkStore.updateTag(editingTagId.value, tagForm.value)
      toast.success(t('toast.tagUpdated'))
    } else {
      await bookmarkStore.addTag(tagForm.value)
      toast.success(t('toast.tagCreated'))
    }
    closeTagModal()
  } catch {
    toast.error(showEditTagModal.value ? t('toast.updateFailed') : t('toast.createFailed'))
  } finally { submitting.value = false }
}

// Delete
const showDeleteModal = ref(false)
const tagToDelete = ref(null)

function confirmDeleteTag(tag) { tagToDelete.value = tag; showDeleteModal.value = true }

async function deleteTag() {
  if (!tagToDelete.value || submitting.value) return
  submitting.value = true
  try {
    await bookmarkStore.removeTag(tagToDelete.value.id)
    showDeleteModal.value = false
    tagToDelete.value = null
    toast.success(t('toast.tagDeleted'))
  } catch { toast.error(t('toast.deleteFailed')) }
  finally { submitting.value = false }
}

// Merge
const showMergeModal = ref(false)
const mergeSource = ref(null)
const mergeTargetId = ref(null)

const mergeTargets = computed(() => tags.value.filter(t => t.id !== mergeSource.value?.id))

function startMerge(tag) {
  mergeSource.value = tag
  mergeTargetId.value = null
  showMergeModal.value = true
}

async function doMerge() {
  if (!mergeSource.value || !mergeTargetId.value || submitting.value) return
  submitting.value = true
  try {
    await bookmarkStore.mergeTags(mergeSource.value.id, mergeTargetId.value)
    showMergeModal.value = false
    toast.success(t('toast.tagMerged'))
  } catch { toast.error(t('toast.updateFailed')) }
  finally { submitting.value = false }
}

function onEscape(e) {
  if (e.key === 'Escape') {
    closeTagModal()
    showDeleteModal.value = false
    showMergeModal.value = false
  }
}
onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => document.removeEventListener('keydown', onEscape))
</script>

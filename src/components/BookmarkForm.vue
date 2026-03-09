<template>
  <div class="modal-content max-w-md p-6">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ isEditing ? t('bf.editBookmark') : t('bf.newBookmark') }}</h3>
      <button @click="$emit('close')" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- URL -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('bf.url') }}</label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          <input v-model="formData.url" type="url" required class="input pl-9" placeholder="https://example.com" @blur="fetchUrlMeta" />
          <div v-if="fetchingMeta" class="absolute right-3 top-1/2 -translate-y-1/2">
            <svg class="animate-spin w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
        </div>
        <div v-if="duplicateBookmark" class="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <span>{{ t('bf.duplicateWarning') }}<template v-if="duplicateCollectionName"> · {{ t('bf.duplicateIn', { name: duplicateCollectionName }) }}</template></span>
        </div>
      </div>

      <!-- Title -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('bf.title') }}</label>
        <input v-model="formData.title" type="text" required class="input" :placeholder="t('bf.titlePlaceholder')" />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          {{ t('bf.description') }} <span class="text-gray-400">({{ t('bf.optional') }})</span>
        </label>
        <textarea v-model="formData.description" class="input resize-none" :placeholder="t('bf.descPlaceholder')" rows="2"></textarea>
      </div>

      <!-- Favicon (edit only) -->
      <div v-if="isEditing">
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('bf.favicon') }}</label>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <img v-if="formData.favicon" :src="formData.favicon" alt="" class="w-6 h-6 rounded" />
            <svg v-else class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </div>
          <input v-model="formData.favicon" type="url" class="input" placeholder="https://example.com/favicon.ico" />
        </div>
      </div>

      <!-- Collection -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('bf.collection') }}</label>
        <select v-model="formData.collection_id" class="select">
          <option v-for="collection in collections" :key="collection.id" :value="collection.id">
            {{ '\u00A0\u00A0'.repeat(collection.depth || 0) }}{{ collection.icon }} {{ collection.name }}
          </option>
        </select>
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          {{ t('bf.tags') }}
        </label>
        <div class="relative" ref="tagDropdownRef">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          <input v-model="tagSearchInput" type="text" class="input pl-9" :placeholder="t('bf.tagsPlaceholder')"
            @focus="showTagDropdown = true" @keydown.enter.prevent="handleTagEnter" />
          <!-- Autocomplete dropdown -->
          <div v-if="showTagDropdown && filteredStoreTags.length > 0" class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            <button v-for="tag in filteredStoreTags" :key="tag.id" type="button"
              @mousedown.prevent="selectStoreTag(tag)"
              class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: tag.color }"></span>
              <span>{{ tag.name }}</span>
              <span class="text-2xs text-gray-400 ml-auto">{{ tag.bookmark_count }}</span>
            </button>
          </div>
        </div>
        <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-1.5 mt-2">
          <span v-for="tag in selectedTags" :key="tag"
            class="group inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
            {{ tag }}
            <button type="button" @click="removeTag(tag)" class="text-primary-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        </div>
        <div v-if="unusedSuggestedTags.length > 0" class="flex flex-wrap items-center gap-1.5 mt-2">
          <span class="text-xs text-gray-400">{{ t('bf.suggested') }}</span>
          <button v-for="tag in unusedSuggestedTags" :key="tag" type="button" @click="addSuggestedTag(tag)"
            class="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 border border-dashed border-gray-300 dark:border-gray-600 transition-colors">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" @click="$emit('close')" class="btn btn-outline">{{ t('bf.cancel') }}</button>
        <button type="submit" :disabled="submitting" class="btn btn-primary disabled:opacity-50">
          <svg v-if="submitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {{ submitting ? t('bf.saving') : (isEditing ? t('bf.update') : t('bf.add')) }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../i18n';
import { useBookmarkStore } from '../stores/bookmarks';
import { bookmarksAPI } from '../services/api';

const { t: _t } = useI18n();
const t = (key, params) => _t.value(key, params);
const bookmarkStore = useBookmarkStore();

const props = defineProps({
  bookmark: { type: Object, default: () => ({ url: '', title: '', description: '', collection_id: 1, favicon: '', tags: [], is_pinned: false }) },
  collections: { type: Array, required: true },
  isEditing: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'close']);

function onEscape(e) { if (e.key === 'Escape') emit('close') }
onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => document.removeEventListener('keydown', onEscape))

const formData = ref({ ...props.bookmark });
const suggestedTags = ref([]);

// Tag autocomplete state
const tagSearchInput = ref('');
const showTagDropdown = ref(false);
const tagDropdownRef = ref(null);

// Extract tag names from bookmark.tags (which may be objects or strings)
function extractTagNames(tags) {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.map(t => typeof t === 'object' ? t.name : t).filter(Boolean);
}

const selectedTags = ref(extractTagNames(props.bookmark.tags));

const filteredStoreTags = computed(() => {
  const q = tagSearchInput.value.toLowerCase().trim();
  const current = selectedTags.value.map(t => t.toLowerCase());
  return bookmarkStore.getAllTags
    .filter(t => !current.includes(t.name.toLowerCase()))
    .filter(t => !q || t.name.toLowerCase().includes(q))
    .slice(0, 10);
});

function selectStoreTag(tag) {
  if (!selectedTags.value.some(t => t.toLowerCase() === tag.name.toLowerCase())) {
    selectedTags.value.push(tag.name);
  }
  tagSearchInput.value = '';
  showTagDropdown.value = false;
}

function handleTagEnter() {
  const name = tagSearchInput.value.trim();
  if (!name) return;
  if (!selectedTags.value.some(t => t.toLowerCase() === name.toLowerCase())) {
    selectedTags.value.push(name);
  }
  tagSearchInput.value = '';
}

const unusedSuggestedTags = computed(() => {
  const current = selectedTags.value.map(t => t.toLowerCase());
  return suggestedTags.value.filter(t => !current.includes(t.toLowerCase()));
});

function addSuggestedTag(tag) {
  if (!selectedTags.value.some(t => t.toLowerCase() === tag.toLowerCase())) {
    selectedTags.value.push(tag);
  }
}

function removeTag(tagToRemove) {
  selectedTags.value = selectedTags.value.filter(tag => tag !== tagToRemove);
}

// Close dropdown on outside click
function handleClickOutside(e) {
  if (tagDropdownRef.value && !tagDropdownRef.value.contains(e.target)) {
    showTagDropdown.value = false;
  }
}
onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));

watch(() => props.bookmark, (newVal) => {
  formData.value = { ...newVal };
  selectedTags.value = extractTagNames(newVal.tags);
}, { deep: true });

const duplicateBookmark = computed(() => {
  const url = formData.value.url?.trim()
  if (!url || props.isEditing) return null
  return bookmarkStore.bookmarks.find(b => b.url === url) || null
})

const duplicateCollectionName = computed(() => {
  if (!duplicateBookmark.value) return ''
  const col = bookmarkStore.getAllCollections.find(c => c.id === duplicateBookmark.value.collection_id)
  return col?.name || ''
})

const fetchingMeta = ref(false)
let lastFetchedUrl = ''

async function fetchUrlMeta() {
  const url = formData.value.url
  if (!url || !isSafeUrl(url) || url === lastFetchedUrl || props.isEditing) return
  if (formData.value.title) return

  fetchingMeta.value = true
  lastFetchedUrl = url
  try {
    const meta = await bookmarksAPI.fetchMeta(url)
    if (formData.value.url === url) {
      if (!formData.value.title && meta.title) formData.value.title = meta.title
      if (!formData.value.description && meta.description) formData.value.description = meta.description
      if (!formData.value.favicon && meta.favicon) formData.value.favicon = meta.favicon
      if (meta.suggestedTags?.length) suggestedTags.value = meta.suggestedTags
    }
  } catch { /* ignore fetch errors */ }
  finally { fetchingMeta.value = false }
}

function isSafeUrl(url) {
  try { const parsed = new URL(url); return ['http:', 'https:'].includes(parsed.protocol) } catch { return false }
}

function submitForm() {
  if (!isSafeUrl(formData.value.url)) { alert('URL must start with http:// or https://'); return }
  emit('submit', { ...formData.value, tags: selectedTags.value });
}
</script>

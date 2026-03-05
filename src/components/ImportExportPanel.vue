<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <!-- Export -->
    <div class="mb-6">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">{{ t('ie.export') }}</h3>
      <p class="text-xs text-gray-400 mb-3">{{ t('ie.exportDesc') }}</p>
      <button @click="exportBookmarks" class="btn btn-outline text-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        {{ t('ie.exportJSON') }}
      </button>
    </div>

    <div class="border-t border-gray-100 dark:border-gray-700 pt-6">
      <!-- Import tabs -->
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">{{ t('ie.import') }}</h3>
      <div class="flex gap-1 p-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 w-fit">
        <button @click="importTab = 'json'" class="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
          :class="importTab === 'json' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'">
          JSON
        </button>
        <button @click="importTab = 'html'" class="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
          :class="importTab === 'html' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'">
          Browser HTML
        </button>
      </div>

      <!-- JSON import -->
      <div v-if="importTab === 'json'">
        <input type="file" ref="jsonFileInput" id="getElementById" accept=".json" class="hidden" @change="handleJsonFileUpload">
        <button @click="$refs.jsonFileInput.click()" class="btn btn-outline text-sm mb-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          {{ t('ie.chooseJSON') }}
        </button>
        <p v-if="jsonFileName" class="text-xs text-gray-500 mb-2">{{ t('ie.selected') }}: {{ jsonFileName }}</p>
        <button v-if="jsonFileName" @click="importJsonBookmarks" class="btn btn-primary text-sm" :disabled="importing">
          {{ importing ? t('ie.importing') : t('ie.importBtn') }}
        </button>
      </div>

      <!-- HTML import -->
      <div v-if="importTab === 'html'">
        <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5">{{ t('ie.browserGuide') }}</p>
          <ul class="text-xs text-gray-400 space-y-0.5">
            <li><strong>Chrome:</strong> Bookmarks Manager → ⋮ → Export</li>
            <li><strong>Firefox:</strong> Bookmarks → Manage → Import/Backup → Export to HTML</li>
            <li><strong>Edge:</strong> Favorites → ⋯ → Export</li>
            <li><strong>Safari:</strong> File → Export → Bookmarks</li>
          </ul>
        </div>

        <input type="file" ref="htmlFileInput" id="htmlFileInput" accept=".html,.htm" class="hidden" @change="handleHtmlFileUpload">
        <button @click="$refs.htmlFileInput.click()" class="btn btn-outline text-sm mb-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          {{ t('ie.chooseHTML') }}
        </button>
        <p v-if="htmlFileName" class="text-xs text-gray-500 mb-2">{{ t('ie.selected') }}: {{ htmlFileName }}</p>
        <button v-if="htmlFileName" @click="importHtmlBookmarks" class="btn btn-primary text-sm" :disabled="importing">
          {{ importing ? t('ie.importing') : t('ie.importBtn') }}
        </button>
      </div>
    </div>

    <!-- Result message -->
    <div v-if="importResult" class="mt-4 p-3 rounded-lg text-sm"
      :class="importResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'">
      {{ importResult.message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBookmarkStore } from '../stores/bookmarks'
import { useI18n } from '../i18n'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

const bookmarkStore = useBookmarkStore()

const importTab = ref('json')
const jsonFileName = ref('')
const htmlFileName = ref('')
const importing = ref(false)
const importResult = ref(null)

function handleJsonFileUpload(event) {
  const file = event.target.files[0]
  if (file) jsonFileName.value = file.name
}

function handleHtmlFileUpload(event) {
  const file = event.target.files[0]
  if (file) htmlFileName.value = file.name
}

function exportBookmarks() {
  try {
    const data = bookmarkStore.exportBookmarks()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `koby-bookmarks-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
    importResult.value = { success: true, message: t('ie.exportSuccess') }
  } catch (error) {
    importResult.value = { success: false, message: 'Export failed: ' + error.message }
  }
}

async function importJsonBookmarks() {
  const file = document.getElementById('getElementById').files[0]
  if (!file) return
  importing.value = true
  importResult.value = null
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const success = await bookmarkStore.importBookmarks(e.target.result)
        if (success) {
          importResult.value = { success: true, message: t('ie.importSuccess') }
          jsonFileName.value = ''
          document.getElementById('getElementById').value = ''
        } else { throw new Error('Import failed') }
      } catch { importResult.value = { success: false, message: 'Import failed: invalid format' } }
      finally { importing.value = false }
    }
    reader.onerror = () => { importing.value = false; importResult.value = { success: false, message: 'Failed to read file' } }
    reader.readAsText(file)
  } catch (error) { importing.value = false; importResult.value = { success: false, message: 'Import failed: ' + error.message } }
}

async function importHtmlBookmarks() {
  const file = document.getElementById('htmlFileInput').files[0]
  if (!file) return
  importing.value = true
  importResult.value = null
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const success = await bookmarkStore.importHtmlBookmarks(e.target.result)
        if (success) {
          importResult.value = { success: true, message: t('ie.importSuccess') }
          htmlFileName.value = ''
          document.getElementById('htmlFileInput').value = ''
        } else { throw new Error('Import failed') }
      } catch { importResult.value = { success: false, message: 'Import failed: invalid HTML format' } }
      finally { importing.value = false }
    }
    reader.onerror = () => { importing.value = false; importResult.value = { success: false, message: 'Failed to read file' } }
    reader.readAsText(file)
  } catch (error) { importing.value = false; importResult.value = { success: false, message: 'Import failed: ' + error.message } }
}
</script>

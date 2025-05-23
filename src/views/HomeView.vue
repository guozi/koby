<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">我的链接</h2>
      <button @click="showAddBookmarkModal = true" class="btn btn-primary flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        添加链接
      </button>
    </div>

    <!-- 收藏夹快速访问 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-3">我的收藏夹</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <router-link 
          v-for="collection in collections" 
          :key="collection.id"
          :to="`/collections?id=${collection.id}`"
          class="card flex items-center p-4 hover:border-primary border-2 border-transparent dark:bg-gray-800 dark:hover:border-primary"
        >
          <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" :style="{ backgroundColor: collection.color + '20' }">
            <span class="text-xl">{{ collection.icon }}</span>
          </div>
          <div>
            <h4 class="font-medium dark:text-white">{{ collection.name }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ getBookmarkCount(collection.id) }} 个链接</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 最近添加的链接 -->
    <div>
      <h3 class="text-lg font-semibold mb-3">最近添加</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="bookmark in recentBookmarks" :key="bookmark.id" class="card dark:bg-gray-800">
          <div class="flex items-start">
            <div class="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
              <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="favicon" class="w-6 h-6" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium truncate dark:text-white">{{ bookmark.title }}</h4>
              <a :href="bookmark.url" target="_blank" class="text-sm text-blue-500 hover:underline truncate block">{{ bookmark.url }}</a>
              <div class="flex items-center mt-2">
                <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 mr-2">
                  {{ getCollectionName(bookmark.collection_id) }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(bookmark.created_at) }}</span>
              </div>
              <!-- 标签 -->
              <div v-if="bookmark.tags && bookmark.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
                <span 
                  v-for="tag in bookmark.tags" 
                  :key="tag" 
                  class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex justify-end mt-2">
            <button @click="editBookmark(bookmark)" class="p-1 text-gray-500 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button @click="confirmDeleteBookmark(bookmark)" class="p-1 text-gray-500 hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加书签模态框 -->
    <div v-if="showAddBookmarkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <BookmarkForm 
        :bookmark="newBookmark" 
        :collections="collections" 
        :isEditing="false" 
        @submit="addNewBookmark" 
        @close="showAddBookmarkModal = false"
      />
    </div>

    <!-- 编辑书签模态框 -->
    <div v-if="showEditBookmarkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <BookmarkForm 
        :bookmark="editingBookmark" 
        :collections="collections" 
        :isEditing="true" 
        @submit="updateBookmarkData" 
        @close="showEditBookmarkModal = false"
      />
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4 dark:text-white">确认删除</h3>
        <p class="mb-4 dark:text-gray-300">确定要删除链接 "{{ bookmarkToDelete?.title }}" 吗？此操作无法撤销。</p>
        <div class="flex justify-end space-x-2">
          <button 
            @click="showDeleteConfirmModal = false" 
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
          >
            取消
          </button>
          <button 
            @click="deleteBookmark()" 
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBookmarkStore } from '../stores/bookmarks'
import BookmarkForm from '../components/BookmarkForm.vue'

const bookmarkStore = useBookmarkStore()

// 获取收藏夹和书签数据
const collections = computed(() => bookmarkStore.getAllCollections)
const bookmarks = computed(() => bookmarkStore.bookmarks)

// 最近添加的书签（最多8个）
const recentBookmarks = computed(() => {
  return [...bookmarks.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)
})

// 添加书签相关状态
const showAddBookmarkModal = ref(false)
const newBookmark = ref({
  url: '',
  title: '',
  description: '',
  collection_id: 1, // 默认收藏夹
  favicon: '',
  tags: []
})

// 编辑书签相关状态
const showEditBookmarkModal = ref(false)
const editingBookmark = ref(null)
const editBookmarkTagsInput = ref('')

// 删除书签相关状态
const showDeleteConfirmModal = ref(false)
const bookmarkToDelete = ref(null)

// 获取收藏夹中的书签数量
function getBookmarkCount(collection_id) {
  return bookmarks.value.filter(b => b.collection_id === collection_id).length
}

// 获取收藏夹名称
function getCollectionName(collection_id) {
  const collection = collections.value.find(c => c.id === collection_id)
  return collection ? collection.name : '未分类'
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 添加新书签
function addNewBookmark(bookmark) {
  bookmarkStore.addBookmark(bookmark)
  
  // 重置表单
  newBookmark.value = {
    url: '',
    title: '',
    description: '',
    collection_id: 1,
    favicon: '',
    tags: [],
    is_pinned: false
  }
  
  showAddBookmarkModal.value = false
}

// 编辑书签
function editBookmark(bookmark) {
  editingBookmark.value = { ...bookmark }
  // 如果有标签，将其转换为逗号分隔的字符串
  editBookmarkTagsInput.value = bookmark.tags && Array.isArray(bookmark.tags) ? bookmark.tags.join(', ') : ''
  showEditBookmarkModal.value = true
}

// 更新书签数据
function updateBookmarkData(updatedBookmark) {
  if (updatedBookmark) {
    bookmarkStore.updateBookmark(updatedBookmark.id, updatedBookmark)
    showEditBookmarkModal.value = false
  }
}

// 确认删除书签
function confirmDeleteBookmark(bookmark) {
  bookmarkToDelete.value = bookmark
  showDeleteConfirmModal.value = true
}

// 删除书签
function deleteBookmark() {
  if (bookmarkToDelete.value) {
    bookmarkStore.removeBookmark(bookmarkToDelete.value.id)
    showDeleteConfirmModal.value = false
    bookmarkToDelete.value = null
  }
}
</script>
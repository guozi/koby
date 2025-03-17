<template>
  <div>
    <div v-if="currentCollection" class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" :style="{ backgroundColor: currentCollection.color + '20' }">
            <span class="text-xl">{{ currentCollection.icon }}</span>
          </div>
          <h2 class="text-2xl font-bold">{{ currentCollection.name }}</h2>
        </div>
        <div class="flex space-x-2">
          <button @click="editCollection(currentCollection)" class="btn btn-secondary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            编辑收藏夹
          </button>
          <button @click="showAddBookmarkModal = true" class="btn btn-primary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            添加链接
          </button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="mb-6">
        <div class="relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索链接..." 
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- 书签列表 -->
      <div v-if="filteredBookmarks.length > 0" class="grid grid-cols-1 gap-4">
        <div v-for="bookmark in filteredBookmarks" :key="bookmark.id" class="card flex items-start p-4">
          <div class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mr-3 overflow-hidden">
            <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="favicon" class="w-6 h-6" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium">{{ bookmark.title }}</h4>
                <a :href="bookmark.url" target="_blank" class="text-sm text-blue-500 hover:underline block">{{ bookmark.url }}</a>
                <p v-if="bookmark.description" class="text-sm text-gray-600 mt-1">{{ bookmark.description }}</p>
                <div class="flex items-center mt-2">
                  <span class="text-xs text-gray-500">{{ formatDate(bookmark.createdAt) }}</span>
                </div>
              </div>
              <div class="flex space-x-1">
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
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-500">暂无链接</h3>
        <p class="mt-1 text-gray-500">点击"添加链接"按钮开始添加吧</p>
        <button @click="showAddBookmarkModal = true" class="mt-4 btn btn-primary">
          添加链接
        </button>
      </div>
    </div>

    <!-- 收藏夹不存在 -->
    <div v-else class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-500">收藏夹不存在</h3>
      <p class="mt-1 text-gray-500">请返回首页选择一个有效的收藏夹</p>
      <router-link to="/" class="mt-4 btn btn-primary inline-block">
        返回首页
      </router-link>
    </div>

    <!-- 添加书签模态框 -->
    <div v-if="showAddBookmarkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">添加链接</h3>
        <form @submit.prevent="addNewBookmark">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">URL</label>
            <input 
              v-model="newBookmark.url" 
              type="url" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com"
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">标题</label>
            <input 
              v-model="newBookmark.title" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="网站标题"
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">描述（可选）</label>
            <textarea 
              v-model="newBookmark.description" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="添加描述..."
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2">
            <button 
              type="button" 
              @click="showAddBookmarkModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              取消
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 编辑收藏夹模态框 -->
    <div v-if="showEditCollectionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">编辑收藏夹</h3>
        <form @submit.prevent="updateCollectionData">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">名称</label>
            <input 
              v-model="editingCollection.name" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">图标</label>
            <div class="grid grid-cols-8 gap-2">
              <button 
                v-for="emoji in emojiOptions" 
                :key="emoji"
                type="button"
                @click="editingCollection.icon = emoji"
                class="w-10 h-10 flex items-center justify-center rounded-md border"
                :class="editingCollection.icon === emoji ? 'border-primary bg-blue-50' : 'border-gray-300'"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">颜色</label>
            <div class="grid grid-cols-8 gap-2">
              <button 
                v-for="color in colorOptions" 
                :key="color"
                type="button"
                @click="editingCollection.color = color"
                class="w-10 h-10 rounded-md border border-gray-300"
                :style="{ backgroundColor: color }"
                :class="editingCollection.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''"
              ></button>
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button 
              type="button" 
              @click="showEditCollectionModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              取消
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="editingCollection.id === 1 && editingCollection.name !== '默认收藏夹'"
            >
              更新
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">确认删除</h3>
        <p class="mb-4">确定要删除链接 "{{ bookmarkToDelete?.title }}" 吗？此操作无法撤销。</p>
        <div class="flex justify-end space-x-2">
          <button 
            @click="showDeleteConfirmModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
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
import { useRoute } from 'vue-router'

const route = useRoute()
const bookmarkStore = useBookmarkStore()

// 获取收藏夹和书签数据
const collections = computed(() => bookmarkStore.getAllCollections)
const bookmarks = computed(() => bookmarkStore.bookmarks)

// 当前收藏夹ID（从URL参数获取）
const collectionId = computed(() => {
  const id = Number(route.query.id)
  return !isNaN(id) && id > 0 ? id : 1 // 如果没有指定ID，默认返回ID为1的默认收藏夹
})

// 当前收藏夹
const currentCollection = computed(() => {
  if (!collections.value.length) return null
  return collections.value.find(c => c.id === collectionId.value) || null
})

// 搜索功能
const searchQuery = ref('')
const filteredBookmarks = computed(() => {
  if (!currentCollection.value) return []
  
  const collectionBookmarks = bookmarks.value.filter(b => b.collectionId === currentCollection.value.id)
  
  if (!searchQuery.value.trim()) return collectionBookmarks
  
  const query = searchQuery.value.toLowerCase()
  return collectionBookmarks.filter(bookmark => 
    bookmark.title.toLowerCase().includes(query) || 
    bookmark.url.toLowerCase().includes(query) || 
    (bookmark.description && bookmark.description.toLowerCase().includes(query))
  )
})

// 添加书签相关状态
const showAddBookmarkModal = ref(false)
const newBookmark = ref({
  url: '',
  title: '',
  description: '',
  collectionId: collectionId.value,
  favicon: ''
})

// 编辑书签相关状态
const showEditBookmarkModal = ref(false)
const editingBookmark = ref(null)

// 删除书签相关状态
const showDeleteConfirmModal = ref(false)
const bookmarkToDelete = ref(null)

// 编辑收藏夹相关状态
const showEditCollectionModal = ref(false)
const editingCollection = ref(null)
const emojiOptions = ['📁', '💼', '📚', '🔖', '🌐', '💻', '📱', '🎮', '🎬', '🎵', '🎨', '📝', '📊', '📈', '🔍', '⭐']
const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4']

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 添加新书签
async function addNewBookmark() {
  if (!newBookmark.value.url || !newBookmark.value.title) {
    return
  }

  // 确保使用当前收藏夹ID
  const bookmark = {
    ...newBookmark.value,
    collectionId: collectionId.value
  }
  
  // 尝试从URL获取favicon
  try {
    const url = new URL(bookmark.url)
    bookmark.favicon = `${url.protocol}//${url.hostname}/favicon.ico`
  } catch (e) {
    // URL解析错误，不设置favicon
    bookmark.favicon = ''
  }
  
  await bookmarkStore.addBookmark(bookmark)
  
  // 重置表单
  newBookmark.value = {
    url: '',
    title: '',
    description: '',
    collectionId: collectionId.value,
    favicon: ''
  }
  
  showAddBookmarkModal.value = false
}

// 编辑书签
function editBookmark(bookmark) {
  editingBookmark.value = { ...bookmark }
  showEditBookmarkModal.value = true
}

// 更新书签数据
function updateBookmarkData() {
  if (editingBookmark.value) {
    bookmarkStore.updateBookmark(editingBookmark.value.id, editingBookmark.value)
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

// 编辑收藏夹
function editCollection(collection) {
  editingCollection.value = { ...collection }
  showEditCollectionModal.value = true
}

// 更新收藏夹数据
function updateCollectionData() {
  if (editingCollection.value) {
    bookmarkStore.updateCollection(editingCollection.value.id, editingCollection.value)
    showEditCollectionModal.value = false
  }
}
</script>
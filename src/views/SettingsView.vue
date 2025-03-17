<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">设置</h2>

    <!-- 收藏夹管理 -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">收藏夹管理</h3>
        <button @click="showAddCollectionModal = true" class="btn btn-primary flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          添加收藏夹
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div v-for="collection in collections" :key="collection.id" class="border-b border-gray-200 dark:border-gray-700 last:border-0">
          <div class="flex items-center justify-between p-4">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" :style="{ backgroundColor: collection.color + '20' }">
                <span class="text-xl">{{ collection.icon }}</span>
              </div>
              <div>
                <h4 class="font-medium">{{ collection.name }}</h4>
                <p class="text-sm text-gray-500">{{ getBookmarkCount(collection.id) }} 个链接</p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button @click="editCollection(collection)" class="p-1 text-gray-500 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button 
                @click="confirmDeleteCollection(collection)" 
                class="p-1 text-gray-500 hover:text-red-500"
                :disabled="collection.id === 1"
                :class="{ 'opacity-50 cursor-not-allowed': collection.id === 1 }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据导入导出 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">数据导入导出</h3>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div class="mb-4">
          <h4 class="font-medium mb-2">导出数据</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">将您的所有链接和收藏夹导出为JSON文件</p>
          <button @click="exportData" class="btn btn-primary">
            导出数据
          </button>
        </div>
        <div>
          <h4 class="font-medium mb-2">导入数据</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">从JSON文件导入链接和收藏夹</p>
          <div class="flex items-center">
            <input 
              type="file" 
              ref="fileInput" 
              accept=".json" 
              class="hidden" 
              @change="handleFileUpload"
            >
            <button @click="$refs.fileInput.click()" class="btn btn-secondary">
              选择文件
            </button>
            <span v-if="importFileName" class="ml-3 text-sm text-gray-600">已选择: {{ importFileName }}</span>
          </div>
          <div v-if="importError" class="mt-2 text-sm text-red-500">
            {{ importError }}
          </div>
          <div v-if="importSuccess" class="mt-2 text-sm text-green-500">
            数据导入成功！
          </div>
        </div>
      </div>
    </div>

    <!-- 关于 -->
    <div>
      <h3 class="text-lg font-semibold mb-4">关于</h3>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div class="flex items-center mb-4">
          <img src="/logo.svg" alt="Koby Logo" class="h-10 w-10 mr-3" />
          <div>
            <h4 class="font-bold text-lg">Koby</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">版本 0.1.0</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Koby 是一个简洁的链接管理工具，帮助您整理和管理网络书签。
        </p>
      </div>
    </div>

    <!-- 添加收藏夹模态框 -->
    <div v-if="showAddCollectionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">添加新收藏夹</h3>
        <form @submit.prevent="addNewCollection">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">名称</label>
            <input 
              v-model="newCollection.name" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="收藏夹名称"
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">图标</label>
            <div class="grid grid-cols-8 gap-2">
              <button 
                v-for="emoji in emojiOptions" 
                :key="emoji"
                type="button"
                @click="newCollection.icon = emoji"
                class="w-10 h-10 flex items-center justify-center rounded-md border"
                :class="newCollection.icon === emoji ? 'border-primary bg-blue-50' : 'border-gray-300'"
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
                @click="newCollection.color = color"
                class="w-10 h-10 rounded-md border border-gray-300"
                :style="{ backgroundColor: color }"
                :class="newCollection.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''"
              ></button>
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button 
              type="button" 
              @click="showAddCollectionModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              取消
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
            >
              保存
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
        <p class="mb-4">确定要删除收藏夹 "{{ collectionToDelete?.name }}" 吗？此操作无法撤销。</p>
        <p class="mb-4 text-sm text-gray-600">该收藏夹中的所有链接将被移动到默认收藏夹。</p>
        <div class="flex justify-end space-x-2">
          <button 
            @click="showDeleteConfirmModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            取消
          </button>
          <button 
            @click="deleteCollection()" 
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
import { ref, computed } from 'vue'
import { useBookmarkStore } from '../stores/bookmarks'

const bookmarkStore = useBookmarkStore()

// 获取收藏夹和书签数据
const collections = computed(() => bookmarkStore.getAllCollections)
const bookmarks = computed(() => bookmarkStore.bookmarks)

// 添加收藏夹相关状态
const showAddCollectionModal = ref(false)
const newCollection = ref({
  name: '',
  icon: '📁',
  color: '#3B82F6'
})

// 编辑收藏夹相关状态
const showEditCollectionModal = ref(false)
const editingCollection = ref(null)

// 删除收藏夹相关状态
const showDeleteConfirmModal = ref(false)
const collectionToDelete = ref(null)

// 导入导出相关状态
const importFileName = ref('')
const importError = ref('')
const importSuccess = ref(false)

// 图标和颜色选项
const emojiOptions = ['📁', '💼', '📚', '🔖', '🌐', '💻', '📱', '🎮', '🎬', '🎵', '🎨', '📝', '📊', '📈', '🔍', '⭐']
const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4']

// 获取收藏夹中的书签数量
function getBookmarkCount(collectionId) {
  return bookmarks.value.filter(b => b.collectionId === collectionId).length
}

// 添加新收藏夹
function addNewCollection() {
  bookmarkStore.addCollection(newCollection.value)
  
  // 重置表单
  newCollection.value = {
    name: '',
    icon: '📁',
    color: '#3B82F6'
  }
  
  showAddCollectionModal.value = false
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

// 确认删除收藏夹
function confirmDeleteCollection(collection) {
  // 默认收藏夹不能删除
  if (collection.id === 1) return
  
  collectionToDelete.value = collection
  showDeleteConfirmModal.value = true
}

// 删除收藏夹
function deleteCollection() {
  if (collectionToDelete.value && collectionToDelete.value.id !== 1) {
    bookmarkStore.removeCollection(collectionToDelete.value.id)
    showDeleteConfirmModal.value = false
    collectionToDelete.value = null
  }
}

// 导出数据
function exportData() {
  const data = bookmarkStore.exportBookmarks()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `koby-export-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 处理文件上传
function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  importFileName.value = file.name
  importError.value = ''
  importSuccess.value = false
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target.result
      const success = bookmarkStore.importBookmarks(content)
      
      if (success) {
        importSuccess.value = true
      } else {
        importError.value = '导入失败：数据格式不正确'
      }
    } catch (error) {
      importError.value = `导入失败：${error.message}`
    }
  }
  
  reader.onerror = () => {
    importError.value = '读取文件时发生错误'
  }
  
  reader.readAsText(file)
}
</script>
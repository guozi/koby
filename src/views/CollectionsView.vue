<template>
  <div class="flex flex-col md:flex-row gap-6 min-h-[70vh]">
    <!-- 移动端：收藏夹下拉选择器 -->
    <div class="md:hidden">
      <div class="flex items-center gap-2 mb-4">
        <select
          :value="collection_id"
          @change="selectCollection($event.target.value)"
          class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option v-for="c in flatCollections" :key="c.id" :value="c.id">
            {{ '\u00A0\u00A0'.repeat(c.depth) }}{{ c.icon }} {{ c.name }}
          </option>
        </select>
        <button @click="showAddCollectionModal = true" class="btn btn-primary px-3 py-2 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 侧边栏：收藏夹列表 -->
    <aside class="hidden md:block w-64 flex-shrink-0">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold dark:text-white">收藏夹</h3>
          <button @click="showAddCollectionModal = true" class="p-1 text-gray-500 hover:text-primary" title="新建收藏夹">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <ul class="space-y-0.5">
          <CollectionTreeItem
            v-for="node in collectionTree"
            :key="node.id"
            :node="node"
            :selected-id="collection_id"
            :can-delete="collections.length > 1"
            @select="selectCollection"
            @edit="editCollection"
            @delete="confirmDeleteCollection"
            @add-child="addChildCollection"
          />
        </ul>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 min-w-0">
      <div v-if="currentCollection">
        <!-- 标题栏 -->
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" :style="{ backgroundColor: currentCollection.color + '20' }">
              <span class="text-xl">{{ currentCollection.icon }}</span>
            </div>
            <h2 class="text-2xl font-bold">{{ currentCollection.name }}</h2>
          </div>
          <button @click="showAddBookmarkModal = true" class="btn btn-primary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            添加链接
          </button>
        </div>

        <!-- 工具栏 -->
        <div class="mb-6 space-y-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="relative flex-grow">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索链接..."
                class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
                @input="handleSearch"
              >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div class="flex items-center space-x-3">
              <div class="relative">
                <select
                  v-model="currentSort"
                  @change="changeSort(currentSort)"
                  class="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary text-sm dark:text-white"
                >
                  <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              <div class="relative">
                <select
                  v-model="pageSize"
                  @change="changePageSize(pageSize)"
                  class="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary text-sm dark:text-white"
                >
                  <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}项/页</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              <button @click="toggleViewMode" class="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                <svg v-if="viewMode === 'grid'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 标签过滤 -->
          <div v-if="availableTags.length > 0" class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">标签筛选:</span>
            <div v-for="tag in availableTags" :key="tag"
                 @click="toggleTag(tag)"
                 class="px-2 py-1 text-xs rounded-full cursor-pointer transition-colors"
                 :class="selectedTags.includes(tag) ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'">
              {{ tag }}
            </div>
            <button
              v-if="searchQuery || selectedTags.length > 0 || currentSort !== 'created_desc'"
              @click="clearFilters"
              class="ml-2 text-xs text-gray-500 hover:text-primary underline">
              清除筛选
            </button>
          </div>
        </div>

        <!-- 书签网格视图 -->
        <div v-if="processedBookmarks.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div v-for="bookmark in paginatedBookmarks" :key="bookmark.id" class="card p-4 flex flex-col h-full">
            <div class="flex items-start mb-3">
              <div class="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
                <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="favicon" class="w-6 h-6" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-medium truncate">{{ bookmark.title }}</h4>
                <a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-500 hover:underline block truncate">{{ bookmark.url }}</a>
              </div>
            </div>
            <p v-if="bookmark.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{{ bookmark.description }}</p>
            <div class="mt-auto flex items-center justify-between">
              <span class="text-xs text-gray-500">{{ formatDate(bookmark.created_at) }}</span>
              <div class="flex space-x-1">
                <button @click="togglePin(bookmark)" class="p-1" aria-label="置顶"><PinIcon :isPinned="!!bookmark.is_pinned" /></button>
                <button @click="editBookmark(bookmark)" class="p-1 text-gray-500 hover:text-primary" aria-label="编辑链接">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                </button>
                <button @click="confirmDeleteBookmark(bookmark)" class="p-1 text-gray-500 hover:text-red-500" aria-label="删除链接">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </button>
              </div>
            </div>
            <div v-if="bookmark.tags && bookmark.tags.length > 0" class="mt-3 flex flex-wrap gap-1">
              <span v-for="tag in bookmark.tags" :key="tag" class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800">{{ tag }}</span>
            </div>
          </div>
        </div>

        <!-- 书签列表视图 -->
        <div v-if="processedBookmarks.length > 0 && viewMode === 'list'" class="space-y-3 mb-6">
          <div v-for="bookmark in paginatedBookmarks" :key="bookmark.id" class="card flex items-start p-4">
            <div class="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
              <img v-if="bookmark.favicon" :src="bookmark.favicon" alt="favicon" class="w-6 h-6" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-medium">{{ bookmark.title }}</h4>
                  <a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-500 hover:underline block">{{ bookmark.url }}</a>
                  <p v-if="bookmark.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ bookmark.description }}</p>
                  <div v-if="bookmark.tags && bookmark.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
                    <span v-for="tag in bookmark.tags" :key="tag" class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800">{{ tag }}</span>
                  </div>
                  <span class="text-xs text-gray-500 mt-2 block">{{ formatDate(bookmark.created_at) }}</span>
                </div>
                <div class="flex space-x-1 flex-shrink-0">
                  <button @click="togglePin(bookmark)" class="p-1" aria-label="置顶"><PinIcon :isPinned="!!bookmark.is_pinned" /></button>
                  <button @click="editBookmark(bookmark)" class="p-1 text-gray-500 hover:text-primary" aria-label="编辑链接">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  </button>
                  <button @click="confirmDeleteBookmark(bookmark)" class="p-1 text-gray-500 hover:text-red-500" aria-label="删除链接">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="processedBookmarks.length === 0" class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-500">暂无链接</h3>
          <p class="mt-1 text-gray-500">点击"添加链接"按钮开始添加吧</p>
          <button @click="showAddBookmarkModal = true" class="mt-4 btn btn-primary">添加链接</button>
        </div>

        <!-- 分页 -->
        <div v-if="processedBookmarks.length > 0" class="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-3 sm:space-y-0">
          <div class="text-sm text-gray-500">
            显示 {{ processedBookmarks.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} -
            {{ Math.min(currentPage * pageSize, processedBookmarks.length) }} 条，共
            {{ processedBookmarks.length }} 条
          </div>
          <div class="flex items-center space-x-1">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
              class="px-3 py-1 rounded border"
              :class="currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button v-for="page in pageNumbers" :key="page" @click="goToPage(page)"
              class="px-3 py-1 rounded border"
              :class="page === currentPage ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'">
              {{ page }}
            </button>
            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded border"
              :class="currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 无收藏夹 -->
      <div v-else class="text-center py-12">
        <h3 class="text-lg font-medium text-gray-500">暂无收藏夹</h3>
        <button @click="showAddCollectionModal = true" class="mt-4 btn btn-primary">新建收藏夹</button>
      </div>
    </div>

    <!-- 添加书签模态框 -->
    <div v-if="showAddBookmarkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <BookmarkForm :bookmark="newBookmark" :collections="flatCollections" :isEditing="false" :submitting="submitting" @submit="addNewBookmark" @close="showAddBookmarkModal = false" />
    </div>

    <!-- 编辑书签模态框 -->
    <div v-if="showEditBookmarkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <BookmarkForm :bookmark="editingBookmark" :collections="flatCollections" :isEditing="true" :submitting="submitting" @submit="updateBookmarkData" @close="showEditBookmarkModal = false" />
    </div>

    <!-- 添加收藏夹模态框 -->
    <div v-if="showAddCollectionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <CollectionForm :collection="newCollection" :collections="flatCollections" :isEditing="false" :submitting="submitting" @submit="addNewCollection" @close="showAddCollectionModal = false" />
    </div>

    <!-- 编辑收藏夹模态框 -->
    <div v-if="showEditCollectionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <CollectionForm :collection="editingCollection" :collections="editableCollections" :isEditing="true" :submitting="submitting" @submit="updateCollectionData" @close="showEditCollectionModal = false" />
    </div>

    <!-- 删除书签确认 -->
    <div v-if="showDeleteBookmarkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4 dark:text-white">确认删除</h3>
        <p class="mb-4 dark:text-gray-300">确定要删除链接 "{{ bookmarkToDelete?.title }}" 吗？此操作无法撤销。</p>
        <div class="flex justify-end space-x-2">
          <button @click="showDeleteBookmarkModal = false" :disabled="submitting" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50">取消</button>
          <button @click="deleteBookmark()" :disabled="submitting" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed">{{ submitting ? '删除中...' : '删除' }}</button>
        </div>
      </div>
    </div>

    <!-- 删除收藏夹确认 -->
    <div v-if="showDeleteCollectionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4 dark:text-white">确认删除</h3>
        <p class="mb-4 dark:text-white">确定要删除收藏夹 "{{ collectionToDelete?.name }}" 吗？</p>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">该收藏夹中的所有链接将被移动到其他收藏夹。</p>
        <div class="flex justify-end space-x-2">
          <button @click="showDeleteCollectionModal = false" :disabled="submitting" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50">取消</button>
          <button @click="deleteCollection()" :disabled="submitting" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed">{{ submitting ? '删除中...' : '删除' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useBookmarkStore } from '../stores/bookmarks'
import { useToastStore } from '../stores/toast'
import { useRoute, useRouter } from 'vue-router'
import PinIcon from '../components/PinIcon.vue'
import BookmarkForm from '../components/BookmarkForm.vue'
import CollectionForm from '../components/CollectionForm.vue'
import CollectionTreeItem from '../components/CollectionTreeItem.vue'

const route = useRoute()
const router = useRouter()
const bookmarkStore = useBookmarkStore()
const toast = useToastStore()

const collections = computed(() => bookmarkStore.getAllCollections)
const bookmarks = computed(() => bookmarkStore.bookmarks)
const collectionTree = computed(() => bookmarkStore.collectionTree)
const flatCollections = computed(() => bookmarkStore.flatCollectionsWithDepth)

// 当前收藏夹ID
const collection_id = computed(() => {
  const id = route.query.id
  if (id && collections.value.some(c => c.id === id)) return id
  return collections.value.length > 0 ? collections.value[0].id : null
})

const currentCollection = computed(() => {
  if (!collections.value.length) return null
  return collections.value.find(c => c.id === collection_id.value) || null
})

// 分页
const currentPage = ref(Number(route.query.page) || 1)
const pageSize = ref(Number(route.query.pageSize) || 12)
const pageSizeOptions = [12, 24, 48, 96]

// 排序
const sortOptions = [
  { value: 'created_desc', label: '最新添加' },
  { value: 'created_asc', label: '最早添加' },
  { value: 'title_asc', label: '标题 A-Z' },
  { value: 'title_desc', label: '标题 Z-A' },
  { value: 'url_asc', label: '网址 A-Z' },
  { value: 'url_desc', label: '网址 Z-A' }
]
const currentSort = ref(route.query.sort || 'created_desc')

// 视图模式
const viewMode = ref(route.query.view || 'grid')

// 搜索
const searchQuery = ref(route.query.q || '')
const searchTimeout = ref(null)

// 标签过滤
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

// 处理书签
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

const paginatedBookmarks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return processedBookmarks.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(processedBookmarks.value.length / pageSize.value) || 1)

const pageNumbers = computed(() => {
  const pages = []
  const max = 5
  if (totalPages.value <= max) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    let start = Math.max(currentPage.value - Math.floor(max / 2), 1)
    let end = start + max - 1
    if (end > totalPages.value) { end = totalPages.value; start = Math.max(end - max + 1, 1) }
    for (let i = start; i <= end; i++) pages.push(i)
  }
  return pages
})

// URL 参数同步
watch(() => route.query, (q) => {
  if (q.page) currentPage.value = Number(q.page)
  if (q.pageSize) pageSize.value = Number(q.pageSize)
  if (q.sort) currentSort.value = q.sort
  if (q.view) viewMode.value = q.view
  if (q.q !== undefined) searchQuery.value = q.q || ''
}, { immediate: true })

function updateUrlParams() {
  router.replace({
    query: {
      ...route.query,
      page: currentPage.value,
      pageSize: pageSize.value,
      sort: currentSort.value,
      view: viewMode.value,
      q: searchQuery.value || undefined
    }
  })
}

function selectCollection(id) {
  currentPage.value = 1
  searchQuery.value = ''
  selectedTags.value = []
  router.replace({ query: { id, view: viewMode.value } })
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  updateUrlParams()
}

function changePageSize(size) {
  pageSize.value = size
  currentPage.value = 1
  updateUrlParams()
}

function changeSort(sort) {
  currentSort.value = sort
  updateUrlParams()
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
  updateUrlParams()
}

function handleSearch() {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1
    updateUrlParams()
  }, 300)
}

function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
  currentPage.value = 1
}

function clearFilters() {
  searchQuery.value = ''
  selectedTags.value = []
  currentSort.value = 'created_desc'
  currentPage.value = 1
  updateUrlParams()
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function safeUrl(url) {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol) ? url : '#'
  } catch { return '#' }
}

// 书签 CRUD
const showAddBookmarkModal = ref(false)
const newBookmark = ref({ url: '', title: '', description: '', collection_id: null, favicon: '', tags: [], is_pinned: false })
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
    newBookmark.value = { url: '', title: '', description: '', collection_id: collection_id.value, favicon: '', tags: [], is_pinned: false }
    showAddBookmarkModal.value = false
    toast.success('链接添加成功')
  } catch {
    toast.error('添加链接失败，请重试')
  } finally {
    submitting.value = false
  }
}

function editBookmark(bookmark) {
  editingBookmark.value = { ...bookmark }
  showEditBookmarkModal.value = true
}

async function updateBookmarkData(updated) {
  if (!updated || submitting.value) return
  submitting.value = true
  try {
    await bookmarkStore.updateBookmark(updated.id, updated)
    showEditBookmarkModal.value = false
    toast.success('链接更新成功')
  } catch {
    toast.error('更新链接失败，请重试')
  } finally {
    submitting.value = false
  }
}

function confirmDeleteBookmark(bookmark) {
  bookmarkToDelete.value = bookmark
  showDeleteBookmarkModal.value = true
}

async function deleteBookmark() {
  if (!bookmarkToDelete.value || submitting.value) return
  submitting.value = true
  try {
    await bookmarkStore.removeBookmark(bookmarkToDelete.value.id)
    showDeleteBookmarkModal.value = false
    bookmarkToDelete.value = null
    toast.success('链接已删除')
  } catch {
    toast.error('删除链接失败，请重试')
  } finally {
    submitting.value = false
  }
}

async function togglePin(bookmark) {
  await bookmarkStore.toggleBookmarkPin(bookmark.id)
}

// 收藏夹 CRUD
const showAddCollectionModal = ref(false)
const newCollection = ref({ name: '', icon: '📁', color: '#3B82F6', parent_id: null })
const showEditCollectionModal = ref(false)
const editingCollection = ref(null)
const showDeleteCollectionModal = ref(false)
const collectionToDelete = ref(null)
const submitting = ref(false)

// 编辑时排除自身及后代
const editableCollections = computed(() => {
  if (!editingCollection.value) return flatCollections.value
  const excludeIds = new Set()
  function collectDescendants(id) {
    excludeIds.add(id)
    collections.value.filter(c => c.parent_id === id).forEach(c => collectDescendants(c.id))
  }
  collectDescendants(editingCollection.value.id)
  return flatCollections.value.filter(c => !excludeIds.has(c.id))
})

async function addNewCollection(collection) {
  if (submitting.value) return
  submitting.value = true
  try {
    await bookmarkStore.addCollection(collection)
    newCollection.value = { name: '', icon: '📁', color: '#3B82F6', parent_id: null }
    showAddCollectionModal.value = false
    toast.success('收藏夹创建成功')
  } catch {
    toast.error('创建收藏夹失败，请重试')
  } finally {
    submitting.value = false
  }
}

function addChildCollection(parentNode) {
  newCollection.value = { name: '', icon: '📁', color: '#3B82F6', parent_id: parentNode.id }
  showAddCollectionModal.value = true
}

function editCollection(collection) {
  editingCollection.value = { ...collection }
  showEditCollectionModal.value = true
}

async function updateCollectionData(collection) {
  if (!collection || submitting.value) return
  submitting.value = true
  try {
    await bookmarkStore.updateCollection(collection.id, collection)
    showEditCollectionModal.value = false
    toast.success('收藏夹更新成功')
  } catch {
    toast.error('更新收藏夹失败，请重试')
  } finally {
    submitting.value = false
  }
}

function confirmDeleteCollection(collection) {
  collectionToDelete.value = collection
  showDeleteCollectionModal.value = true
}

async function deleteCollection() {
  if (!collectionToDelete.value || submitting.value) return
  submitting.value = true
  try {
    const deletedId = collectionToDelete.value.id
    await bookmarkStore.removeCollection(deletedId)
    showDeleteCollectionModal.value = false
    collectionToDelete.value = null
    toast.success('收藏夹已删除')
    if (deletedId === collection_id.value && collections.value.length > 0) {
      selectCollection(collections.value[0].id)
    }
  } catch {
    toast.error('删除收藏夹失败，请重试')
  } finally {
    submitting.value = false
  }
}

// Escape 关闭确认框
function onEscape(e) {
  if (e.key === 'Escape') {
    if (showDeleteBookmarkModal.value) showDeleteBookmarkModal.value = false
    if (showDeleteCollectionModal.value) showDeleteCollectionModal.value = false
  }
}
onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => document.removeEventListener('keydown', onEscape))
</script>

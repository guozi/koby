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

      <!-- 工具栏：搜索、排序、视图切换 -->
      <div class="mb-6 space-y-4">
        <!-- 搜索和视图切换 -->
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
            <!-- 排序下拉菜单 -->
            <div class="relative">
              <select 
                v-model="currentSort" 
                @change="changeSort(currentSort)"
                class="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary text-sm dark:text-white"
              >
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            
            <!-- 每页显示数量 -->
            <div class="relative">
              <select 
                v-model="pageSize" 
                @change="changePageSize(pageSize)"
                class="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary text-sm dark:text-white"
              >
                <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}项/页</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            
            <!-- 视图切换按钮 -->
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

      <!-- 书签列表 - 网格视图 -->
      <div v-if="processedBookmarks.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
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
              <a :href="bookmark.url" target="_blank" class="text-sm text-blue-500 hover:underline block truncate">{{ bookmark.url }}</a>
            </div>
          </div>
          
          <p v-if="bookmark.description" class="text-sm text-gray-600 mb-3 line-clamp-2">{{ bookmark.description }}</p>
          
          <div class="mt-auto flex items-center justify-between">
            <span class="text-xs text-gray-500">{{ formatDate(bookmark.created_at) }}</span>
            
            <div class="flex space-x-1">
              <button @click="togglePin(bookmark)" class="p-1 text-gray-500" :class="{'text-yellow-500 hover:text-yellow-600': bookmark.is_pinned, 'hover:text-yellow-500': !bookmark.is_pinned}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2.17a2 2 0 01-.586 1.414l-3.828 3.829a1 1 0 01-1.414 0L5.586 8.583A2 2 0 015 7.17V5zm6 8.83l3.828-3.829A4 4 0 0017 7.17V5a4 4 0 00-4-4H7a4 4 0 00-4 4v2.17a4 4 0 001.172 2.83l3.828 3.829a3 3 0 004.243 0z" />
                </svg>
              </button>
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
          
          <!-- 标签 -->
          <div v-if="bookmark.tags && bookmark.tags.length > 0" class="mt-3 flex flex-wrap gap-1">
            <span 
              v-for="tag in bookmark.tags" 
              :key="tag" 
              class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 书签列表 - 列表视图 -->
      <div v-if="processedBookmarks.length > 0 && viewMode === 'list'" class="space-y-3 mb-6">
        <div v-for="bookmark in paginatedBookmarks" :key="bookmark.id" class="card flex items-start p-4">
          <div class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
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
                
                <!-- 标签 -->
                <div v-if="bookmark.tags && bookmark.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
                  <span 
                    v-for="tag in bookmark.tags" 
                    :key="tag" 
                    class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200">
                    {{ tag }}
                  </span>
                </div>
                
                <div class="flex items-center mt-2">
                  <span class="text-xs text-gray-500">{{ formatDate(bookmark.created_at) }}</span>
                </div>
              </div>
              <div class="flex space-x-1">
                <button @click="togglePin(bookmark)" class="p-1 text-gray-500" :class="{'text-yellow-500 hover:text-yellow-600': bookmark.is_pinned, 'hover:text-yellow-500': !bookmark.is_pinned}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2.17a2 2 0 01-.586 1.414l-3.828 3.829a1 1 0 01-1.414 0L5.586 8.583A2 2 0 015 7.17V5zm6 8.83l3.828-3.829A4 4 0 0017 7.17V5a4 4 0 00-4-4H7a4 4 0 00-4 4v2.17a4 4 0 001.172 2.83l3.828 3.829a3 3 0 004.243 0z" />
                  </svg>
                </button>
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
      <div v-if="processedBookmarks.length === 0" class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-500">暂无链接</h3>
        <p class="mt-1 text-gray-500">点击"添加链接"按钮开始添加吧</p>
        <button @click="showAddBookmarkModal = true" class="mt-4 btn btn-primary">
          添加链接
        </button>
      </div>

      <!-- 分页控件 -->
      <div v-if="processedBookmarks.length > 0" class="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-3 sm:space-y-0">
        <div class="text-sm text-gray-500">
          显示 {{ processedBookmarks.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} - 
          {{ Math.min(currentPage * pageSize, processedBookmarks.length) }} 条，共 
          {{ processedBookmarks.length }} 条
        </div>
        
        <div class="flex items-center space-x-1">
          <!-- 上一页 -->
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border" 
            :class="currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <!-- 页码 -->
          <button 
            v-for="page in pageNumbers" 
            :key="page"
            @click="goToPage(page)"
            class="px-3 py-1 rounded border" 
            :class="page === currentPage ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50'"
          >
            {{ page }}
          </button>
          
          <!-- 下一页 -->
          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded border" 
            :class="currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
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
        <h3 class="text-xl font-bold mb-4 dark:text-white">添加链接</h3>
        <form @submit.prevent="addNewBookmark">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">URL</label>
            <input 
              v-model="newBookmark.url" 
              type="url" 
              required 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com"
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">标题</label>
            <input 
              v-model="newBookmark.title" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
              placeholder="网站标题"
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">描述（可选）</label>
            <textarea 
              v-model="newBookmark.description" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
              placeholder="添加描述..."
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">标签（可选，用逗号分隔）</label>
            <div class="relative">
              <input 
                v-model="newBookmarkTagsInput" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
                placeholder="工作, 学习, 娱乐..."
              >
              <div v-if="parsedNewBookmarkTags.length > 0" class="mt-2 flex flex-wrap gap-1">
                <span 
                  v-for="tag in parsedNewBookmarkTags" 
                  :key="tag" 
                  class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800 flex items-center">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button 
              type="button" 
              @click="showAddBookmarkModal = false" 
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
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
        <h3 class="text-xl font-bold mb-4 dark:text-white">编辑收藏夹</h3>
        <form @submit.prevent="updateCollectionData">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">名称</label>
            <input 
              v-model="editingCollection.name" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">图标</label>
            <div class="grid grid-cols-8 gap-2">
              <button 
                v-for="emoji in emojiOptions" 
                :key="emoji"
                type="button"
                @click="editingCollection.icon = emoji"
                class="w-10 h-10 flex items-center justify-center rounded-md border"
                :class="editingCollection.icon === emoji ? 'border-primary bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">颜色</label>
            <div class="grid grid-cols-8 gap-2">
              <button 
                v-for="color in colorOptions" 
                :key="color"
                type="button"
                @click="editingCollection.color = color"
                class="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-600"
                :style="{ backgroundColor: color }"
                :class="editingCollection.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''"
              ></button>
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button 
              type="button" 
              @click="showEditCollectionModal = false" 
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
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

    <!-- 编辑书签模态框 -->
    <div v-if="showEditBookmarkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">编辑链接</h3>
        <form @submit.prevent="updateBookmarkData">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">URL</label>
            <input 
              v-model="editingBookmark.url" 
              type="url" 
              required 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com"
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">标题</label>
            <input 
              v-model="editingBookmark.title" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
              placeholder="网站标题"
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">描述（可选）</label>
            <textarea 
              v-model="editingBookmark.description" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
              placeholder="添加描述..."
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">图标</label>
            <div class="flex items-center space-x-3 mb-2">
              <div class="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img v-if="editingBookmark.favicon" :src="editingBookmark.favicon" alt="favicon" class="w-6 h-6" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input 
              v-model="editingBookmark.favicon" 
              type="url" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/favicon.ico"
            >
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1 dark:text-white">标签（可选，用逗号分隔）</label>
            <div class="relative">
              <input 
                v-model="editBookmarkTagsInput" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
                placeholder="工作, 学习, 娱乐..."
              >
              <div v-if="parsedEditBookmarkTags.length > 0" class="mt-2 flex flex-wrap gap-1">
                <span 
                  v-for="tag in parsedEditBookmarkTags" 
                  :key="tag" 
                  class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800 flex items-center">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button 
              type="button" 
              @click="showEditBookmarkModal = false" 
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
            >
              取消
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
            >
              更新
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBookmarkStore } from '../stores/bookmarks'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const bookmarkStore = useBookmarkStore()

// 获取收藏夹和书签数据
const collections = computed(() => bookmarkStore.getAllCollections)
const bookmarks = computed(() => bookmarkStore.bookmarks)

// 当前收藏夹ID（从URL参数获取）
const collection_id = computed(() => {
  const id = Number(route.query.id)
  return !isNaN(id) && id > 0 ? id : 1 // 如果没有指定ID，默认返回ID为1的默认收藏夹
})

// 当前收藏夹
const currentCollection = computed(() => {
  if (!collections.value.length) return null
  return collections.value.find(c => c.id === collection_id.value) || null
})

// 分页相关
const currentPage = ref(Number(route.query.page) || 1)
const pageSize = ref(Number(route.query.pageSize) || 12)
const pageSizeOptions = [12, 24, 48, 96]

// 排序相关
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
const viewMode = ref(route.query.view || 'grid') // grid 或 list

// 搜索功能
const searchQuery = ref(route.query.q || '')
const searchTimeout = ref(null)

// 标签过滤
const selectedTags = ref([])
const availableTags = computed(() => {
  // 从当前收藏夹的所有书签中提取标签
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

// 处理书签数据
const processedBookmarks = computed(() => {
  if (!currentCollection.value) return []
  
  // 1. 先按收藏夹过滤
  let result = bookmarks.value.filter(b => b.collection_id === currentCollection.value.id)
  
  // 2. 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(bookmark => 
      bookmark.title.toLowerCase().includes(query) || 
      bookmark.url.toLowerCase().includes(query) || 
      (bookmark.description && bookmark.description.toLowerCase().includes(query))
    )
  }
  
  // 3. 标签过滤
  if (selectedTags.value.length > 0) {
    result = result.filter(bookmark => {
      if (!bookmark.tags || !Array.isArray(bookmark.tags)) return false
      return selectedTags.value.every(tag => bookmark.tags.includes(tag))
    })
  }
  
  // 4. 排序
  result = [...result] // 创建副本以避免修改原数组
  result.sort((a, b) => {
    // 首先按照置顶状态排序
    if (a.is_pinned !== b.is_pinned) {
      return b.is_pinned ? 1 : -1
    }
    
    // 然后按照选择的排序方式排序
    switch (currentSort.value) {
      case 'created_desc':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'created_asc':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'title_asc':
        return a.title.localeCompare(b.title)
      case 'title_desc':
        return b.title.localeCompare(a.title)
      case 'url_asc':
        return a.url.localeCompare(b.url)
      case 'url_desc':
        return b.url.localeCompare(a.url)
      default:
        return 0
    }
  })
  
  return result
})

// 分页后的书签
const paginatedBookmarks = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  return processedBookmarks.value.slice(startIndex, startIndex + pageSize.value)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(processedBookmarks.value.length / pageSize.value) || 1
})

// 页码数组，用于分页导航
const pageNumbers = computed(() => {
  const pages = []
  const maxVisiblePages = 5 // 最多显示的页码数
  
  if (totalPages.value <= maxVisiblePages) {
    // 如果总页数小于等于最大可见页码数，则显示所有页码
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // 否则，显示当前页附近的页码
    let startPage = Math.max(currentPage.value - Math.floor(maxVisiblePages / 2), 1)
    let endPage = startPage + maxVisiblePages - 1
    
    if (endPage > totalPages.value) {
      endPage = totalPages.value
      startPage = Math.max(endPage - maxVisiblePages + 1, 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
  }
  
  return pages
})

// 监听URL参数变化
watch(() => route.query, (newQuery) => {
  if (newQuery.page) currentPage.value = Number(newQuery.page)
  if (newQuery.pageSize) pageSize.value = Number(newQuery.pageSize)
  if (newQuery.sort) currentSort.value = newQuery.sort
  if (newQuery.view) viewMode.value = newQuery.view
  if (newQuery.q !== undefined) searchQuery.value = newQuery.q || ''
}, { immediate: true })

// 更新URL参数
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

// 切换页码
function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  updateUrlParams()
}

// 切换每页显示数量
function changePageSize(size) {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  updateUrlParams()
}

// 切换排序方式
function changeSort(sort) {
  currentSort.value = sort
  updateUrlParams()
}

// 切换视图模式
function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
  updateUrlParams()
}

// 处理搜索
function handleSearch() {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1 // 重置到第一页
    updateUrlParams()
  }, 300)
}

// 切换标签选择
function toggleTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
  currentPage.value = 1 // 重置到第一页
}

// 清除所有筛选
function clearFilters() {
  searchQuery.value = ''
  selectedTags.value = []
  currentSort.value = 'created_desc'
  currentPage.value = 1
  updateUrlParams()
}

// 添加书签相关状态
const showAddBookmarkModal = ref(false)
const newBookmark = ref({
  url: '',
  title: '',
  description: '',
  collection_id: collection_id.value,
  favicon: '',
  tags: []
})
const newBookmarkTagsInput = ref('')
const parsedNewBookmarkTags = computed(() => {
  if (!newBookmarkTagsInput.value) return []
  return newBookmarkTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
})

// 编辑书签相关状态
const showEditBookmarkModal = ref(false)
const editingBookmark = ref(null)
const editBookmarkTagsInput = ref('')
const parsedEditBookmarkTags = computed(() => {
  if (!editBookmarkTagsInput.value) return []
  return editBookmarkTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
})

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

  // 确保使用当前收藏夹ID和处理标签
  const bookmark = {
    ...newBookmark.value,
    collection_id: collection_id.value,
    tags: parsedNewBookmarkTags.value
  }
  
  await bookmarkStore.addBookmark(bookmark)
  
  // 重置表单
  newBookmark.value = {
    url: '',
    title: '',
    description: '',
    collection_id: collection_id.value,
    favicon: '',
    tags: []
  }
  newBookmarkTagsInput.value = ''
  
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
function updateBookmarkData() {
  if (editingBookmark.value) {
    // 更新标签
    const updatedBookmark = {
      ...editingBookmark.value,
      tags: parsedEditBookmarkTags.value
    }
    
    bookmarkStore.updateBookmark(updatedBookmark.id, updatedBookmark)
    showEditBookmarkModal.value = false
    editBookmarkTagsInput.value = ''
  }
}

// 确认删除书签
function confirmDeleteBookmark(bookmark) {
  bookmarkToDelete.value = bookmark
  showDeleteConfirmModal.value = true
}

// 删除书签
async function deleteBookmark() {
  if (bookmarkToDelete.value) {
    try {
      await bookmarkStore.removeBookmark(bookmarkToDelete.value.id)
      showDeleteConfirmModal.value = false
      bookmarkToDelete.value = null
    } catch (error) {
      console.error('删除书签失败:', error)
    }
  }
}

// 切换书签置顶状态
async function togglePin(bookmark) {
  try {
    await bookmarkStore.toggleBookmarkPin(bookmark.id)
  } catch (error) {
    console.error('切换书签置顶状态失败:', error)
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
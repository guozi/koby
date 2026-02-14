<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold dark:text-white">{{ isEditing ? '编辑链接' : '添加新链接' }}</h3>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <form @submit.prevent="submitForm" class="space-y-5">
      <!-- URL 输入 -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input 
            v-model="formData.url" 
            type="url" 
            required 
            class="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
            placeholder="https://example.com"
          >
        </div>
      </div>
      
      <!-- 标题输入 -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">标题</label>
        <input 
          v-model="formData.title" 
          type="text" 
          required 
          class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
          placeholder="网站标题"
        >
      </div>
      
      <!-- 描述输入 -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">描述 <span class="text-gray-500 dark:text-gray-400 text-xs">(可选)</span></label>
        <textarea 
          v-model="formData.description" 
          class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
          placeholder="简短描述..."
          rows="3"
        ></textarea>
      </div>
      
      <!-- 图标输入 (仅编辑模式) -->
      <div v-if="isEditing" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">图标</label>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-sm">
            <img v-if="formData.favicon" :src="formData.favicon" alt="favicon" class="w-7 h-7" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input 
            v-model="formData.favicon" 
            type="url" 
            class="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
            placeholder="https://example.com/favicon.ico"
          >
        </div>
      </div>
      
      <!-- 收藏夹选择 -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">收藏夹</label>
        <div class="relative">
          <select 
            v-model="formData.collection_id" 
            class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 dark:text-white appearance-none transition-all duration-200 pr-10"
          >
            <option v-for="collection in collections" :key="collection.id" :value="collection.id">
              {{ '\u00A0\u00A0'.repeat(collection.depth || 0) }}{{ collection.icon }} {{ collection.name }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- 标签输入 -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">标签 <span class="text-gray-500 dark:text-gray-400 text-xs">(用逗号分隔)</span></label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <input 
            v-model="tagsInput" 
            type="text" 
            class="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
            placeholder="工作, 学习, 娱乐..."
          >
        </div>
        
        <!-- 标签预览 -->
        <div v-if="parsedTags.length > 0" class="flex flex-wrap gap-2 mt-2 pt-2">
          <div 
            v-for="tag in parsedTags" 
            :key="tag" 
            class="group px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-800 flex items-center transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-800/40"
          >
            <span>{{ tag }}</span>
            <button 
              type="button"
              @click="removeTag(tag)" 
              class="ml-1.5 text-blue-400 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 固定选项 -->
      <!-- <div class="flex items-center space-x-2">
        <div class="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
          <input 
            type="checkbox" 
            id="pin-toggle" 
            v-model="formData.is_pinned"
            class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
          />
          <label 
            for="pin-toggle" 
            class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"
          ></label>
        </div>
        <label for="pin-toggle" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center">
          <PinIcon :isPinned="formData.is_pinned" class="mr-1.5" />
          固定到顶部
        </label>
      </div> -->
      
      <!-- 按钮组 -->
      <div class="flex justify-end space-x-3 pt-2">
        <button 
          type="button" 
          @click="$emit('close')" 
          class="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 font-medium"
        >
          取消
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="submitting" class="animate-spin h-5 w-5 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else-if="isEditing" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ submitting ? '提交中...' : (isEditing ? '更新' : '添加') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  bookmark: {
    type: Object,
    default: () => ({
      url: '',
      title: '',
      description: '',
      collection_id: 1,
      favicon: '',
      tags: [],
      is_pinned: false
    })
  },
  collections: {
    type: Array,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'close']);

function onEscape(e) { if (e.key === 'Escape') emit('close') }
onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => document.removeEventListener('keydown', onEscape))

// 创建表单数据的副本，避免直接修改props
const formData = ref({ ...props.bookmark });

// 标签输入处理
const tagsInput = ref(props.bookmark.tags && Array.isArray(props.bookmark.tags) ? props.bookmark.tags.join(', ') : '');

// 解析标签
const parsedTags = computed(() => {
  if (!tagsInput.value) return [];
  return tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
});

// 移除标签
function removeTag(tagToRemove) {
  const tags = parsedTags.value.filter(tag => tag !== tagToRemove);
  tagsInput.value = tags.join(', ');
}

// 监听props变化，更新表单数据
watch(() => props.bookmark, (newVal) => {
  formData.value = { ...newVal };
  tagsInput.value = newVal.tags && Array.isArray(newVal.tags) ? newVal.tags.join(', ') : '';
}, { deep: true });

function isSafeUrl(url) {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch { return false }
}

function submitForm() {
  if (!isSafeUrl(formData.value.url)) {
    alert('URL 必须以 http:// 或 https:// 开头')
    return
  }
  const updatedBookmark = {
    ...formData.value,
    tags: parsedTags.value
  };

  emit('submit', updatedBookmark);
}
</script>

<style scoped>
.toggle-checkbox:checked {
  transform: translateX(100%);
  border-color: #3B82F6;
}

.toggle-checkbox:checked + .toggle-label {
  background-color: #3B82F6;
}
</style>
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold dark:text-white">{{ isEditing ? '编辑收藏夹' : '添加新收藏夹' }}</h3>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <form @submit.prevent="submitForm" class="space-y-5">
      <!-- 名称输入 -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">名称</label>
        <input 
          v-model="formData.name" 
          type="text" 
          required 
          class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
          placeholder="收藏夹名称"
        >
      </div>
      
      <!-- 图标选择 -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">图标</label>
        <div class="grid grid-cols-8 gap-2">
          <button 
            v-for="emoji in emojiOptions" 
            :key="emoji"
            type="button"
            @click="formData.icon = emoji"
            class="w-10 h-10 flex items-center justify-center rounded-md border transition-all duration-200"
            :class="formData.icon === emoji ? 'border-primary bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
      
      <!-- 颜色选择 -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">颜色</label>
        <div class="grid grid-cols-8 gap-2">
          <button 
            v-for="color in colorOptions" 
            :key="color"
            type="button"
            @click="formData.color = color"
            class="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-600 transition-all duration-200"
            :style="{ backgroundColor: color }"
            :class="formData.color === color ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-gray-800' : ''"
          ></button>
        </div>
      </div>
      
      <!-- 预览 -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">预览</label>
        <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" :style="{ backgroundColor: formData.color + '20' }">
            <span class="text-xl">{{ formData.icon }}</span>
          </div>
          <div>
            <h4 class="font-medium dark:text-white">{{ formData.name || '收藏夹名称' }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">0 个链接</p>
          </div>
        </div>
      </div>
      
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
          class="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center"
        >
          <svg v-if="isEditing" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ isEditing ? '更新' : '添加' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  collection: {
    type: Object,
    default: () => ({
      name: '',
      icon: '📁',
      color: '#3B82F6',
      id: null
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'close']);

function onEscape(e) { if (e.key === 'Escape') emit('close') }
onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => document.removeEventListener('keydown', onEscape))

// 创建表单数据的副本，避免直接修改props
const formData = ref({ ...props.collection });

// 图标和颜色选项
const emojiOptions = ['📁', '💼', '📚', '🔖', '🌐', '💻', '📱', '🎮', '🎬', '🎵', '🎨', '📝', '📊', '📈', '🔍', '⭐'];
const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4'];

// 监听props变化，更新表单数据
watch(() => props.collection, (newVal) => {
  formData.value = { ...newVal };
}, { deep: true });

// 提交表单
function submitForm() {
  emit('submit', { ...formData.value });
}
</script>
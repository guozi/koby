<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    aria-label="切换主题"
  >
    <!-- 亮色模式图标 (显示在暗色模式下) -->
    <svg
      v-if="isDark"
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 text-yellow-400"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clip-rule="evenodd"
      />
    </svg>
    <!-- 暗色模式图标 (显示在暗色模式下) -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 text-gray-700 dark:text-gray-300"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  </button>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useThemeStore } from '../stores/theme';

// 使用主题存储
const themeStore = useThemeStore();

// 获取当前主题状态，使用计算属性保持响应性
const isDark = computed(() => themeStore.isDark);
const toggleTheme = () => themeStore.toggleTheme();

// 初始化主题
onMounted(() => {
  themeStore.initTheme();
});
</script>
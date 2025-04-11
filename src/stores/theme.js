import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { usePreferredDark } from '@vueuse/core';

export const useThemeStore = defineStore('theme', () => {
  // 检测系统是否为暗色模式
  const prefersDark = usePreferredDark();
  
  // 当前主题状态
  const isDark = ref(false);

  // 初始化主题
  function initTheme() {
    // 优先使用用户保存的主题设置
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      isDark.value = savedTheme === 'dark';
    } else {
      // 如果用户没有设置，则使用系统主题
      isDark.value = prefersDark.value;
    }
    
    updateTheme();
  }

  // 切换主题
  function toggleTheme() {
    isDark.value = !isDark.value;
    updateTheme();
  }

  // 更新主题
  function updateTheme() {
    // 更新DOM
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 保存到localStorage
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  }

  // 监听系统主题变化
  watch(prefersDark, (newValue) => {
    // 只有当用户没有手动设置主题时，才跟随系统主题
    if (localStorage.getItem('theme') === null) {
      isDark.value = newValue;
      updateTheme();
    }
  });

  return {
    isDark,
    toggleTheme,
    initTheme
  };
});
<template>
  <div class="min-h-screen bg-light dark:bg-dark text-dark dark:text-light">
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <img src="/logo.svg" alt="Koby Logo" class="h-8 w-8" />
          <h1 class="text-xl font-bold text-primary">Koby</h1>
        </div>
        <nav class="flex items-center space-x-4">
          <template v-if="authStore.isLoggedIn">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/collections" class="nav-link">收藏夹</router-link>
            <router-link to="/settings" class="nav-link">设置</router-link>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ authStore.user?.name }}</span>
            <button @click="authStore.logout()" class="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
              退出
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link">登录</router-link>
          </template>
          <ThemeToggle />
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6">
      <router-view />
    </main>

    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-auto">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {{ new Date().getFullYear() }} Koby - 链接管理工具
      </div>
    </footer>

    <Toast />
  </div>
</template>

<script setup>
import { useBookmarkStore } from './stores/bookmarks';
import { useThemeStore } from './stores/theme';
import { useAuthStore } from './stores/auth';
import { onMounted } from 'vue';
import ThemeToggle from './components/ThemeToggle.vue';
import Toast from './components/Toast.vue';

const bookmarkStore = useBookmarkStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    themeStore.initTheme();
    if (authStore.isLoggedIn) {
      const isAuthenticated = await authStore.checkAuth();
      if (isAuthenticated) {
        await bookmarkStore.initialize();
      }
    }
  } catch (error) {
    console.error('初始化应用数据失败:', error);
  }
});
</script>

<style>
.nav-link {
  @apply px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors;
}

.router-link-active {
  @apply text-primary dark:text-primary font-medium;
}
</style>

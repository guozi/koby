<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <template v-if="authStore.isLoggedIn">
      <!-- Left Sidebar -->
      <aside class="fixed inset-y-0 left-0 w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 flex-col hidden md:flex">
        <div class="h-14 flex items-center gap-2.5 px-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <img src="/logo.svg" alt="Koby" class="h-7 w-7" />
          <span class="text-lg font-bold text-primary">Koby</span>
        </div>
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <router-link to="/" class="sidebar-item" :class="{ 'sidebar-item-active': $route.path === '/' }">
            <svg class="flex-shrink-0" style="width:18px;height:18px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span>{{ t('nav.home') }}</span>
          </router-link>
          <router-link to="/collections" class="sidebar-item" :class="{ 'sidebar-item-active': $route.path === '/collections' && !$route.query.id }">
            <svg class="flex-shrink-0" style="width:18px;height:18px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <span>{{ t('nav.collections') }}</span>
          </router-link>
          <div class="pt-4 pb-2">
            <div class="flex items-center justify-between px-1">
              <span class="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{{ t('nav.categories') }}</span>
              <span class="text-2xs text-gray-400 dark:text-gray-500">{{ bookmarkStore.bookmarks.length }}</span>
            </div>
          </div>
          <router-link v-for="collection in sidebarCollections" :key="collection.id" :to="`/collections?id=${collection.id}`" class="sidebar-item" :class="{ 'sidebar-item-active': $route.query.id === collection.id }">
            <span class="text-base flex-shrink-0">{{ collection.icon }}</span>
            <span class="truncate">{{ collection.name }}</span>
            <span class="ml-auto text-2xs text-gray-400 dark:text-gray-500 tabular-nums">{{ getBookmarkCount(collection.id) }}</span>
          </router-link>
        </nav>
        <div class="px-3 py-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <router-link to="/settings" class="sidebar-item" :class="{ 'sidebar-item-active': $route.path === '/settings' }">
            <svg class="flex-shrink-0" style="width:18px;height:18px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>{{ t('nav.settings') }}</span>
          </router-link>
        </div>
      </aside>

      <!-- Main area -->
      <div class="md:pl-60 flex flex-col min-h-screen">
        <!-- Top bar -->
        <header class="sticky top-0 z-20 h-14 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6">
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 -ml-2 btn-ghost rounded-lg">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div class="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{{ currentPageTitle }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">{{ authStore.user?.name }}</span>
            <LangToggle />
            <ThemeToggle />
            <button @click="authStore.logout()" class="btn-ghost rounded-lg p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" :title="t('nav.logout')">
              <svg style="width:18px;height:18px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        <!-- Mobile sidebar overlay -->
        <Teleport to="body">
          <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 md:hidden">
            <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="mobileMenuOpen = false"></div>
            <aside class="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl flex flex-col animate-fade-in">
              <div class="h-14 flex items-center gap-2.5 px-5 border-b border-gray-200 dark:border-gray-700">
                <img src="/logo.svg" alt="Koby" class="h-7 w-7" />
                <span class="text-lg font-bold text-primary">Koby</span>
                <button @click="mobileMenuOpen = false" class="ml-auto p-1 text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <router-link @click="mobileMenuOpen = false" to="/" class="sidebar-item"><span>{{ t('nav.home') }}</span></router-link>
                <router-link @click="mobileMenuOpen = false" to="/collections" class="sidebar-item"><span>{{ t('nav.collections') }}</span></router-link>
                <div class="pt-4 pb-2"><span class="text-2xs font-semibold text-gray-400 uppercase tracking-wider px-1">{{ t('nav.categories') }}</span></div>
                <router-link v-for="collection in sidebarCollections" :key="collection.id" @click="mobileMenuOpen = false" :to="`/collections?id=${collection.id}`" class="sidebar-item">
                  <span class="text-base flex-shrink-0">{{ collection.icon }}</span>
                  <span class="truncate">{{ collection.name }}</span>
                </router-link>
              </nav>
              <div class="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
                <router-link @click="mobileMenuOpen = false" to="/settings" class="sidebar-item"><span>{{ t('nav.settings') }}</span></router-link>
              </div>
            </aside>
          </div>
        </Teleport>

        <main class="flex-1 px-4 md:px-8 py-6">
          <router-view />
        </main>
      </div>
    </template>

    <template v-else>
      <router-view />
    </template>

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBookmarkStore } from './stores/bookmarks';
import { useThemeStore } from './stores/theme';
import { useAuthStore } from './stores/auth';
import { useI18n } from './i18n';
import ThemeToggle from './components/ThemeToggle.vue';
import LangToggle from './components/LangToggle.vue';
import Toast from './components/Toast.vue';

const { t: _t } = useI18n();
const t = (key, params) => _t.value(key, params);

const route = useRoute();
const bookmarkStore = useBookmarkStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const sidebarCollections = computed(() => bookmarkStore.getAllCollections);

const currentPageTitle = computed(() => {
  const titles = { '/': t('nav.home'), '/collections': t('nav.collections'), '/bookmarks': t('all.title'), '/settings': t('nav.settings') };
  return titles[route.path] || '';
});

function getBookmarkCount(collectionId) {
  return bookmarkStore.bookmarks.filter(b => b.collection_id === collectionId).length;
}

onMounted(async () => {
  try {
    themeStore.initTheme();
    if (authStore.isLoggedIn) {
      const isAuthenticated = await authStore.checkAuth();
      if (isAuthenticated) await bookmarkStore.initialize();
    }
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
});
</script>

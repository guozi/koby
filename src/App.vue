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
          <router-link to="/toolbox" class="sidebar-item" :class="{ 'sidebar-item-active': $route.path === '/toolbox' }">
            <svg class="flex-shrink-0" style="width:18px;height:18px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
            <span>{{ t('nav.toolbox') }}</span>
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
          <div class="flex items-center gap-1.5">
            <!-- Search -->
            <button @click="searchModalRef?.open()" class="btn-ghost rounded-lg px-2.5 py-1.5 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center gap-1.5" :title="t('search.placeholder')">
              <svg style="width:18px;height:18px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <kbd class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-2xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">{{ isMac ? '⌘' : 'Ctrl' }}+K</kbd>
            </button>

            <div class="toolbar-divider"></div>

            <!-- Preferences -->
            <LangToggle />
            <ThemeToggle />

            <div class="toolbar-divider"></div>

            <!-- User Menu -->
            <div class="relative">
              <button @click.stop="userMenuOpen = !userMenuOpen" class="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {{ userInitial }}
                </div>
                <span class="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{{ authStore.user?.name }}</span>
                <svg class="hidden sm:block w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform" :class="{ 'rotate-180': userMenuOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <Transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-if="userMenuOpen" class="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <router-link to="/settings" @click="userMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {{ t('nav.profile') }}
                  </router-link>
                  <div class="my-1 border-t border-gray-100 dark:border-gray-700"></div>
                  <button @click="handleLogout" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    {{ t('nav.logout') }}
                  </button>
                </div>
              </Transition>
            </div>
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
                <router-link @click="mobileMenuOpen = false" to="/toolbox" class="sidebar-item"><span>{{ t('nav.toolbox') }}</span></router-link>
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
    <SearchModal v-if="authStore.isLoggedIn" ref="searchModalRef" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useBookmarkStore } from './stores/bookmarks';
import { useThemeStore } from './stores/theme';
import { useAuthStore } from './stores/auth';
import { useI18n } from './i18n';
import ThemeToggle from './components/ThemeToggle.vue';
import LangToggle from './components/LangToggle.vue';
import Toast from './components/Toast.vue';
import SearchModal from './components/SearchModal.vue';

const { t: _t } = useI18n();
const t = (key, params) => _t.value(key, params);

const route = useRoute();
const bookmarkStore = useBookmarkStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);
const searchModalRef = ref(null);
const userMenuOpen = ref(false);
const isMac = computed(() => navigator.platform.toUpperCase().includes('MAC'));
const userInitial = computed(() => {
  const name = authStore.user?.name;
  return name ? name.charAt(0).toUpperCase() : '?';
});

function handleLogout() {
  userMenuOpen.value = false;
  authStore.logout();
}

function closeUserMenu(e) {
  if (userMenuOpen.value) userMenuOpen.value = false;
}

watch(() => route.path, () => { userMenuOpen.value = false; });

const sidebarCollections = computed(() => bookmarkStore.getAllCollections);

const currentPageTitle = computed(() => {
  const titles = { '/': t('nav.home'), '/collections': t('nav.collections'), '/bookmarks': t('all.title'), '/toolbox': t('nav.toolbox'), '/settings': t('nav.settings') };
  return titles[route.path] || '';
});

function getBookmarkCount(collectionId) {
  return bookmarkStore.bookmarks.filter(b => b.collection_id === collectionId).length;
}

onMounted(async () => {
  document.addEventListener('click', closeUserMenu);
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

onBeforeUnmount(() => {
  document.removeEventListener('click', closeUserMenu);
});
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">设置</h2>

    <!-- 账户信息 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">账户信息</h3>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">昵称</span>
            <span class="dark:text-white">{{ authStore.user?.name }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">邮箱</span>
            <span class="dark:text-white">{{ authStore.user?.email }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据导入导出 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">数据导入导出</h3>
      <ImportExportPanel />
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
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import ImportExportPanel from '../components/ImportExportPanel.vue'

const authStore = useAuthStore()
</script>

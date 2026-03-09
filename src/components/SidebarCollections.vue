<template>
  <template v-for="node in collections" :key="node.id">
    <div class="relative group">
      <router-link
        :to="`/collections?id=${node.id}`"
        :class="[
          collapsed ? 'sidebar-item-collapsed' : 'sidebar-item',
          { 'sidebar-item-active': $route.path === '/collections' && $route.query.id === node.id }
        ]"
        :style="!collapsed ? { paddingLeft: (12 + depth * 16) + 'px' } : undefined"
        :title="collapsed ? node.name : undefined"
        @click="$emit('navigate')"
      >
        <button
          v-if="node.children?.length && !collapsed"
          class="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          @click.prevent.stop="toggle(node.id)"
        >
          <svg
            class="w-3 h-3 transition-transform duration-150"
            :class="{ 'rotate-90': isExpanded(node.id) }"
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </button>
        <span v-else-if="!collapsed" class="flex-shrink-0 w-4"></span>
        <span class="text-base flex-shrink-0">{{ node.icon }}</span>
        <span v-show="!collapsed" class="truncate">{{ node.name }}</span>
        <span v-show="!collapsed" class="ml-auto text-2xs text-gray-400 dark:text-gray-500 tabular-nums">{{ getTotalCount(node) }}</span>
      </router-link>
    </div>
    <SidebarCollections
      v-if="node.children?.length && isExpanded(node.id) && !collapsed"
      :collections="node.children"
      :depth="depth + 1"
      :collapsed="collapsed"
      :bookmarks="bookmarks"
      :expanded-ids="expandedIds"
      @navigate="$emit('navigate')"
      @toggle="$emit('toggle', $event)"
    />
  </template>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  collections: { type: Array, required: true },
  depth: { type: Number, default: 0 },
  collapsed: { type: Boolean, default: false },
  bookmarks: { type: Array, required: true },
  expandedIds: { type: Set, required: true }
})

const emit = defineEmits(['navigate', 'toggle'])

function isExpanded(id) {
  return props.expandedIds.has(id)
}

function toggle(id) {
  emit('toggle', id)
}

function getTotalCount(node) {
  let count = props.bookmarks.filter(b => b.collection_id === node.id).length
  if (node.children) {
    for (const child of node.children) {
      count += getTotalCount(child)
    }
  }
  return count
}
</script>

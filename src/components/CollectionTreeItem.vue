<template>
  <li>
    <div
      @click="$emit('select', node.id)"
      class="group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors"
      :class="node.id === selectedId
        ? 'bg-primary/10 text-primary font-medium'
        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'"
      :style="{ paddingLeft: (depth * 16 + 12) + 'px' }"
    >
      <div class="flex items-center min-w-0">
        <button
          v-if="node.children && node.children.length > 0"
          @click.stop="expanded = !expanded"
          class="mr-1 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform" :class="expanded ? 'rotate-90' : ''" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <span v-else class="w-5 flex-shrink-0"></span>
        <span class="mr-2">{{ node.icon }}</span>
        <span class="truncate">{{ node.name }}</span>
      </div>
      <div class="hidden group-hover:flex items-center space-x-1 flex-shrink-0">
        <button v-if="depth < 2" @click.stop="$emit('add-child', node)" class="p-0.5 text-gray-400 hover:text-primary" aria-label="添加子收藏夹" title="添加子收藏夹">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
        <button @click.stop="$emit('edit', node)" class="p-0.5 text-gray-400 hover:text-primary" aria-label="编辑收藏夹">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          v-if="canDelete"
          @click.stop="$emit('delete', node)"
          class="p-0.5 text-gray-400 hover:text-red-500"
          aria-label="删除收藏夹"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    <ul v-if="expanded && node.children && node.children.length > 0" class="space-y-0.5">
      <CollectionTreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :selected-id="selectedId"
        :can-delete="canDelete"
        @select="$emit('select', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @add-child="$emit('add-child', $event)"
      />
    </ul>
  </li>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  selectedId: { type: [String, Number], default: null },
  canDelete: { type: Boolean, default: true }
});

defineEmits(['select', 'edit', 'delete', 'add-child']);

const expanded = ref(true);
</script>

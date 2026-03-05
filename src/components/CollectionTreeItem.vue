<template>
  <li>
    <div
      @click="$emit('select', node.id)"
      class="group flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition-colors duration-150"
      :class="node.id === selectedId
        ? 'bg-primary-50 dark:bg-primary-700/20 text-primary-600 dark:text-primary-400 font-medium'
        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'"
      :style="{ paddingLeft: (depth * 14 + 10) + 'px' }"
    >
      <div class="flex items-center min-w-0 gap-1.5">
        <button
          v-if="node.children && node.children.length > 0"
          @click.stop="expanded = !expanded"
          class="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
        >
          <svg class="w-3 h-3 transition-transform" :class="expanded ? 'rotate-90' : ''" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <span v-else class="w-4 flex-shrink-0"></span>
        <span class="text-sm flex-shrink-0">{{ node.icon }}</span>
        <span class="text-sm truncate">{{ node.name }}</span>
      </div>
      <div class="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
        <button v-if="depth < 2" @click.stop="$emit('add-child', node)" class="p-0.5 text-gray-400 hover:text-primary rounded" title="Add sub-collection">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
        <button @click.stop="$emit('edit', node)" class="p-0.5 text-gray-400 hover:text-primary rounded">
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
        </button>
        <button v-if="canDelete" @click.stop="$emit('delete', node)" class="p-0.5 text-gray-400 hover:text-red-500 rounded">
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
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

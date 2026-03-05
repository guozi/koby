<template>
  <div class="modal-content max-w-md p-6">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ isEditing ? t('cf.editCollection') : t('cf.newCollection') }}</h3>
      <button @click="$emit('close')" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Name -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('cf.name') }}</label>
        <input v-model="formData.name" type="text" required class="input" :placeholder="t('cf.previewName')" />
      </div>

      <!-- Parent -->
      <div v-if="collections.length > 0">
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          {{ t('cf.parent') }} <span class="text-gray-400">({{ t('bf.optional') }})</span>
        </label>
        <select v-model="formData.parent_id" class="select">
          <option :value="null">{{ t('cf.parentNone') }}</option>
          <option v-for="c in collections" :key="c.id" :value="c.id">
            {{ '\u00A0\u00A0'.repeat(c.depth || 0) }}{{ c.icon }} {{ c.name }}
          </option>
        </select>
      </div>

      <!-- Icon -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('cf.icon') }}</label>
        <div class="grid grid-cols-8 gap-1.5">
          <button v-for="emoji in emojiOptions" :key="emoji" type="button" @click="formData.icon = emoji"
            class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-all duration-150"
            :class="formData.icon === emoji ? 'border-primary bg-primary-50 dark:bg-primary-900/30 ring-1 ring-primary' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- Color -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('cf.color') }}</label>
        <div class="flex flex-wrap gap-2">
          <button v-for="color in colorOptions" :key="color" type="button" @click="formData.color = color"
            class="w-8 h-8 rounded-lg transition-all duration-150"
            :style="{ backgroundColor: color }"
            :class="formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : 'hover:scale-110'">
          </button>
        </div>
      </div>

      <!-- Preview -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ t('cf.preview') }}</label>
        <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" :style="{ backgroundColor: formData.color + '15' }">
            {{ formData.icon }}
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ formData.name || t('cf.previewName') }}</h4>
            <p class="text-xs text-gray-400 mt-0.5">0 {{ t('cf.links') }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" @click="$emit('close')" class="btn btn-outline">{{ t('cf.cancel') }}</button>
        <button type="submit" :disabled="submitting" class="btn btn-primary disabled:opacity-50">
          <svg v-if="submitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {{ submitting ? t('cf.saving') : (isEditing ? t('cf.update') : t('cf.create')) }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../i18n';

const { t: _t } = useI18n();
const t = (key, params) => _t.value(key, params);

const props = defineProps({
  collection: { type: Object, default: () => ({ name: '', icon: '📁', color: '#3B82F6', parent_id: null, id: null }) },
  collections: { type: Array, default: () => [] },
  isEditing: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'close']);

function onEscape(e) { if (e.key === 'Escape') emit('close') }
onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => document.removeEventListener('keydown', onEscape))

const formData = ref({ ...props.collection });
const emojiOptions = ['📁', '💼', '📚', '🔖', '🌐', '💻', '📱', '🎮', '🎬', '🎵', '🎨', '📝', '📊', '📈', '🔍', '⭐'];
const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4'];

watch(() => props.collection, (newVal) => { formData.value = { ...newVal } }, { deep: true });

function submitForm() { emit('submit', { ...formData.value }) }
</script>

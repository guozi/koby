<template>
  <div class="space-y-4">
    <!-- Input fields -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ t('toolbox.metaTitle') }}</label>
        <input v-model="meta.title" type="text" class="input text-sm" placeholder="My Awesome Website" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ t('toolbox.metaAuthor') }}</label>
        <input v-model="meta.author" type="text" class="input text-sm" placeholder="John Doe" />
      </div>
      <div class="sm:col-span-2">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ t('toolbox.metaDescription') }}</label>
        <textarea v-model="meta.description" class="input text-sm resize-none" rows="2" placeholder="A brief description of your page..."></textarea>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ t('toolbox.metaKeywords') }}</label>
        <input v-model="meta.keywords" type="text" class="input text-sm" placeholder="web, tools, seo" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ t('toolbox.metaUrl') }}</label>
        <input v-model="meta.url" type="text" class="input text-sm" placeholder="https://example.com" />
      </div>
      <div class="sm:col-span-2">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ t('toolbox.metaImage') }}</label>
        <input v-model="meta.image" type="text" class="input text-sm" placeholder="https://example.com/og-image.png" />
      </div>
    </div>

    <!-- Toggle OG / Twitter -->
    <div class="flex gap-3">
      <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
        <input v-model="includeOg" type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" />
        {{ t('toolbox.metaOg') }}
      </label>
      <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
        <input v-model="includeTwitter" type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" />
        {{ t('toolbox.metaTwitter') }}
      </label>
    </div>

    <!-- Google preview -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.metaPreview') }}</label>
      <div class="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-lg">
        <div class="text-sm text-green-700 dark:text-green-400 truncate">{{ meta.url || 'https://example.com' }}</div>
        <div class="text-lg text-blue-700 dark:text-blue-400 font-medium truncate mt-0.5">{{ meta.title || 'Page Title' }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{{ meta.description || 'Page description will appear here...' }}</div>
      </div>
    </div>

    <!-- Generated HTML -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.metaGenerated') }}</label>
      <div class="flex gap-1">
        <pre class="input font-mono text-xs bg-gray-50 dark:bg-gray-900 flex-1 whitespace-pre-wrap overflow-x-auto">{{ generatedHtml }}</pre>
        <button @click="copyResult(generatedHtml)" class="btn btn-outline text-sm px-2 self-start">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'
import { escapeHtml as esc } from '../../utils/color'

const { t, copyResult } = useToolHelper()

const meta = reactive({
  title: '',
  description: '',
  keywords: '',
  author: '',
  url: '',
  image: '',
})

const includeOg = ref(true)
const includeTwitter = ref(true)

const generatedHtml = computed(() => {
  const lines = []
  if (meta.title) lines.push(`<title>${esc(meta.title)}</title>`)
  if (meta.description) lines.push(`<meta name="description" content="${esc(meta.description)}" />`)
  if (meta.keywords) lines.push(`<meta name="keywords" content="${esc(meta.keywords)}" />`)
  if (meta.author) lines.push(`<meta name="author" content="${esc(meta.author)}" />`)
  lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')

  if (includeOg.value) {
    lines.push('')
    lines.push('<!-- Open Graph -->')
    if (meta.title) lines.push(`<meta property="og:title" content="${esc(meta.title)}" />`)
    if (meta.description) lines.push(`<meta property="og:description" content="${esc(meta.description)}" />`)
    lines.push('<meta property="og:type" content="website" />')
    if (meta.url) lines.push(`<meta property="og:url" content="${esc(meta.url)}" />`)
    if (meta.image) lines.push(`<meta property="og:image" content="${esc(meta.image)}" />`)
  }

  if (includeTwitter.value) {
    lines.push('')
    lines.push('<!-- Twitter Card -->')
    lines.push('<meta name="twitter:card" content="summary_large_image" />')
    if (meta.title) lines.push(`<meta name="twitter:title" content="${esc(meta.title)}" />`)
    if (meta.description) lines.push(`<meta name="twitter:description" content="${esc(meta.description)}" />`)
    if (meta.image) lines.push(`<meta name="twitter:image" content="${esc(meta.image)}" />`)
  }

  return lines.join('\n')
})
</script>

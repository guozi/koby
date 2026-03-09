<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('toolbox.title') }}</h1>
        <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 tabular-nums">
          {{ t('toolbox.toolCount', { n: allTools.length }) }}
        </span>
      </div>
      <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">{{ t('toolbox.subtitle') }}</p>
    </div>

    <!-- No tool selected: card grid with categories -->
    <div v-if="!activeTool">
      <!-- Search -->
      <div class="mb-5">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" type="text" :placeholder="t('toolbox.searchPlaceholder')"
            class="input text-sm pl-10 w-full sm:w-80" />
        </div>
      </div>

      <!-- Grouped tools -->
      <div v-if="filteredCategories.length > 0" class="space-y-6">
        <div v-for="cat in filteredCategories" :key="cat.key">
          <div class="flex items-center gap-2 mb-3">
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ cat.name }}</h2>
            <span class="text-xs text-gray-400 dark:text-gray-500 tabular-nums">{{ cat.tools.length }}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <button v-for="tool in cat.tools" :key="tool.id" @click="activeTool = tool.id"
              class="group text-left p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                     hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
                  :style="{ backgroundColor: tool.color + '15', color: tool.color }">
                  {{ tool.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{{ tool.name }}</div>
                    <span v-if="tool.badge === 'new'" class="px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">New</span>
                    <span v-if="tool.badge === 'beta'" class="px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">Beta</span>
                  </div>
                  <div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{{ tool.desc }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- No results -->
      <div v-else class="text-center py-12 text-sm text-gray-400">{{ t('toolbox.noResults') }}</div>
    </div>

    <!-- Tool selected: full-width layout -->
    <div v-else>
      <!-- Back bar -->
      <div class="flex items-center gap-3 mb-5">
        <button @click="activeTool = null"
          class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
          {{ t('toolbox.allTools') }}
        </button>
        <span class="text-gray-200 dark:text-gray-700">/</span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold" :style="{ color: activeToolMeta.color }">{{ activeToolMeta.icon }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ activeToolMeta.name }}</span>
        </div>
      </div>

      <!-- Tool content -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 md:p-6">
        <component :is="toolComponents[activeTool]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../i18n'

import ToolJson from '../components/tools/ToolJson.vue'
import ToolBase64 from '../components/tools/ToolBase64.vue'
import ToolUrl from '../components/tools/ToolUrl.vue'
import ToolTimestamp from '../components/tools/ToolTimestamp.vue'
import ToolUuid from '../components/tools/ToolUuid.vue'
import ToolColor from '../components/tools/ToolColor.vue'
import ToolWordcount from '../components/tools/ToolWordcount.vue'
import ToolHash from '../components/tools/ToolHash.vue'
import ToolRegex from '../components/tools/ToolRegex.vue'
import ToolDiff from '../components/tools/ToolDiff.vue'
import ToolDateCalc from '../components/tools/ToolDateCalc.vue'
import ToolSql from '../components/tools/ToolSql.vue'
import ToolCodeImage from '../components/tools/ToolCodeImage.vue'
import ToolLorem from '../components/tools/ToolLorem.vue'
import ToolJwt from '../components/tools/ToolJwt.vue'
import ToolProps from '../components/tools/ToolProps.vue'
import ToolCron from '../components/tools/ToolCron.vue'
import ToolHttpCode from '../components/tools/ToolHttpCode.vue'
import ToolRadix from '../components/tools/ToolRadix.vue'
import ToolMarkdown from '../components/tools/ToolMarkdown.vue'
import ToolQrcode from '../components/tools/ToolQrcode.vue'
import ToolPxRem from '../components/tools/ToolPxRem.vue'
import ToolContrast from '../components/tools/ToolContrast.vue'
import ToolGradient from '../components/tools/ToolGradient.vue'
import ToolUnitConvert from '../components/tools/ToolUnitConvert.vue'
import ToolBarcode from '../components/tools/ToolBarcode.vue'
import ToolMetaTag from '../components/tools/ToolMetaTag.vue'

const { t: _t } = useI18n()
const t = (key, params) => _t.value(key, params)

const toolComponents = {
  json: ToolJson,
  base64: ToolBase64,
  url: ToolUrl,
  timestamp: ToolTimestamp,
  uuid: ToolUuid,
  color: ToolColor,
  wordcount: ToolWordcount,
  hash: ToolHash,
  regex: ToolRegex,
  diff: ToolDiff,
  datecalc: ToolDateCalc,
  sql: ToolSql,
  codeimg: ToolCodeImage,
  lorem: ToolLorem,
  jwt: ToolJwt,
  props: ToolProps,
  cron: ToolCron,
  httpcode: ToolHttpCode,
  radix: ToolRadix,
  markdown: ToolMarkdown,
  qrcode: ToolQrcode,
  pxrem: ToolPxRem,
  contrast: ToolContrast,
  gradient: ToolGradient,
  unitconvert: ToolUnitConvert,
  barcode: ToolBarcode,
  metatag: ToolMetaTag,
}

// category → tool id list
const categoryDefs = [
  { key: 'encoding',    ids: ['base64', 'url', 'hash', 'radix'] },
  { key: 'formatting',  ids: ['json', 'sql', 'markdown', 'props'] },
  { key: 'generators',  ids: ['uuid', 'qrcode', 'lorem', 'codeimg'] },
  { key: 'text',        ids: ['wordcount', 'diff', 'regex'] },
  { key: 'calculators', ids: ['datecalc', 'timestamp', 'cron'] },
  { key: 'webdev',      ids: ['color', 'httpcode', 'jwt'] },
  { key: 'frontend',    ids: ['pxrem', 'contrast', 'gradient'] },
  { key: 'utilities',   ids: ['unitconvert', 'barcode', 'metatag'] },
]

const catNameKeys = {
  encoding: 'toolbox.catEncoding',
  formatting: 'toolbox.catFormatting',
  generators: 'toolbox.catGenerators',
  text: 'toolbox.catText',
  calculators: 'toolbox.catCalculators',
  webdev: 'toolbox.catWebDev',
  frontend: 'toolbox.catFrontend',
  utilities: 'toolbox.catUtilities',
}

const toolDefs = [
  { id: 'json',      icon: '{ }',  color: '#F59E0B', nameKey: 'toolbox.json',      descKey: 'toolbox.jsonDesc' },
  { id: 'base64',    icon: 'B64',  color: '#8B5CF6', nameKey: 'toolbox.base64',    descKey: 'toolbox.base64Desc' },
  { id: 'url',       icon: '%',    color: '#3B82F6', nameKey: 'toolbox.url',       descKey: 'toolbox.urlDesc' },
  { id: 'timestamp', icon: 'T',    color: '#10B981', nameKey: 'toolbox.timestamp', descKey: 'toolbox.timestampDesc' },
  { id: 'uuid',      icon: '#',    color: '#EC4899', nameKey: 'toolbox.uuid',      descKey: 'toolbox.uuidDesc' },
  { id: 'color',     icon: 'Rgb',  color: '#F43F5E', nameKey: 'toolbox.color',     descKey: 'toolbox.colorDesc' },
  { id: 'wordcount', icon: 'Aa',   color: '#6366F1', nameKey: 'toolbox.wordcount', descKey: 'toolbox.wordcountDesc' },
  { id: 'hash',      icon: '#!',   color: '#0EA5E9', nameKey: 'toolbox.hash',      descKey: 'toolbox.hashDesc' },
  { id: 'regex',     icon: '.*',   color: '#D97706', nameKey: 'toolbox.regex',     descKey: 'toolbox.regexDesc' },
  { id: 'diff',      icon: '+-',   color: '#059669', nameKey: 'toolbox.diff',      descKey: 'toolbox.diffDesc' },
  { id: 'datecalc',  icon: 'Cal',  color: '#0D9488', nameKey: 'toolbox.datecalc',  descKey: 'toolbox.datecalcDesc' },
  { id: 'sql',       icon: 'SQL',  color: '#2563EB', nameKey: 'toolbox.sql',       descKey: 'toolbox.sqlDesc' },
  { id: 'codeimg',   icon: '</>',  color: '#6D28D9', nameKey: 'toolbox.codeimg',   descKey: 'toolbox.codeimgDesc' },
  { id: 'lorem',     icon: 'Lp',   color: '#7C3AED', nameKey: 'toolbox.lorem',     descKey: 'toolbox.loremDesc' },
  { id: 'jwt',       icon: 'JWT',  color: '#F97316', nameKey: 'toolbox.jwt',       descKey: 'toolbox.jwtDesc' },
  { id: 'props',     icon: 'P↔Y',  color: '#14B8A6', nameKey: 'toolbox.props',     descKey: 'toolbox.propsDesc' },
  { id: 'cron',      icon: 'Cron', color: '#A855F7', nameKey: 'toolbox.cron',      descKey: 'toolbox.cronDesc' },
  { id: 'httpcode',  icon: 'HTTP', color: '#EF4444', nameKey: 'toolbox.httpcode',  descKey: 'toolbox.httpcodeDesc' },
  { id: 'radix',     icon: '0x',   color: '#0891B2', nameKey: 'toolbox.radix',     descKey: 'toolbox.radixDesc' },
  { id: 'markdown',  icon: 'MD',   color: '#1D4ED8', nameKey: 'toolbox.markdown',  descKey: 'toolbox.markdownDesc' },
  { id: 'qrcode',    icon: 'QR',   color: '#7C3AED', nameKey: 'toolbox.qrcode',   descKey: 'toolbox.qrcodeDesc' },
  { id: 'pxrem',     icon: 'Px',   color: '#E11D48', nameKey: 'toolbox.pxrem',    descKey: 'toolbox.pxremDesc', badge: 'new' },
  { id: 'contrast',  icon: 'Aa',   color: '#7C3AED', nameKey: 'toolbox.contrast', descKey: 'toolbox.contrastDesc', badge: 'new' },
  { id: 'gradient',  icon: '▦',   color: '#EC4899', nameKey: 'toolbox.gradient',  descKey: 'toolbox.gradientDesc', badge: 'new' },
  { id: 'unitconvert', icon: '⇌', color: '#0EA5E9', nameKey: 'toolbox.unitconvert', descKey: 'toolbox.unitconvertDesc', badge: 'new' },
  { id: 'barcode',   icon: '|||',  color: '#64748B', nameKey: 'toolbox.barcode',   descKey: 'toolbox.barcodeDesc', badge: 'new' },
  { id: 'metatag',   icon: '<M>',  color: '#F59E0B', nameKey: 'toolbox.metatag',   descKey: 'toolbox.metatagDesc', badge: 'new' },
]

const allTools = computed(() =>
  toolDefs.map(d => ({
    ...d,
    name: t(d.nameKey),
    desc: t(d.descKey),
  }))
)

const search = ref('')
const activeTool = ref(null)

const filteredCategories = computed(() => {
  const q = search.value.toLowerCase().trim()
  return categoryDefs
    .map(cat => {
      const tools = cat.ids
        .map(id => allTools.value.find(t => t.id === id))
        .filter(Boolean)
        .filter(tool => !q || tool.name.toLowerCase().includes(q) || tool.desc.toLowerCase().includes(q))
      return { key: cat.key, name: t(catNameKeys[cat.key]), tools }
    })
    .filter(cat => cat.tools.length > 0)
})

const activeToolMeta = computed(() => allTools.value.find(t => t.id === activeTool.value) || {})
</script>

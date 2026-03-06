<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('toolbox.title') }}</h1>
      <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">{{ t('toolbox.subtitle') }}</p>
    </div>

    <!-- No tool selected: card grid -->
    <div v-if="!activeTool" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <button v-for="tool in tools" :key="tool.id" @click="activeTool = tool.id"
        class="group text-left p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
               hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
            :style="{ backgroundColor: tool.color + '15', color: tool.color }">
            {{ tool.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{{ tool.name }}</div>
            <div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{{ tool.desc }}</div>
          </div>
        </div>
      </button>
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
}

const tools = computed(() => [
  { id: 'json',      icon: '{ }',  color: '#F59E0B', name: t('toolbox.json'),      desc: t('toolbox.jsonDesc') },
  { id: 'base64',    icon: 'B64',  color: '#8B5CF6', name: t('toolbox.base64'),    desc: t('toolbox.base64Desc') },
  { id: 'url',       icon: '%',    color: '#3B82F6', name: t('toolbox.url'),       desc: t('toolbox.urlDesc') },
  { id: 'timestamp', icon: 'T',    color: '#10B981', name: t('toolbox.timestamp'), desc: t('toolbox.timestampDesc') },
  { id: 'uuid',      icon: '#',    color: '#EC4899', name: t('toolbox.uuid'),      desc: t('toolbox.uuidDesc') },
  { id: 'color',     icon: 'Rgb',  color: '#F43F5E', name: t('toolbox.color'),     desc: t('toolbox.colorDesc') },
  { id: 'wordcount', icon: 'Aa',   color: '#6366F1', name: t('toolbox.wordcount'), desc: t('toolbox.wordcountDesc') },
  { id: 'hash',      icon: '#!',   color: '#0EA5E9', name: t('toolbox.hash'),      desc: t('toolbox.hashDesc') },
  { id: 'regex',     icon: '.*',   color: '#D97706', name: t('toolbox.regex'),     desc: t('toolbox.regexDesc') },
  { id: 'diff',      icon: '+-',   color: '#059669', name: t('toolbox.diff'),      desc: t('toolbox.diffDesc') },
  { id: 'datecalc',  icon: 'Cal',  color: '#0D9488', name: t('toolbox.datecalc'),  desc: t('toolbox.datecalcDesc') },
  { id: 'sql',       icon: 'SQL',  color: '#2563EB', name: t('toolbox.sql'),       desc: t('toolbox.sqlDesc') },
  { id: 'codeimg',   icon: '</>',  color: '#6D28D9', name: t('toolbox.codeimg'),   desc: t('toolbox.codeimgDesc') },
  { id: 'lorem',     icon: 'Lp',   color: '#7C3AED', name: t('toolbox.lorem'),     desc: t('toolbox.loremDesc') },
])

const activeTool = ref(null)
const activeToolMeta = computed(() => tools.value.find(t => t.id === activeTool.value) || {})
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-2 mb-1">
      <button @click="format" class="btn btn-primary text-sm">{{ t('toolbox.format') }}</button>
      <button @click="minify" class="btn btn-outline text-sm">{{ t('toolbox.minify') }}</button>
      <button @click="input = output; output = ''" class="btn btn-outline text-sm">{{ t('toolbox.sqlApply') }}</button>
      <button v-if="output" @click="copyResult(output)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.input') }}</label>
        <textarea v-model="input" class="input font-mono text-sm resize-none" rows="16" :placeholder="t('toolbox.sqlInputHint')"></textarea>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.output') }}</label>
        <textarea v-model="output" readonly class="input font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900" rows="16" :placeholder="t('toolbox.outputHint')"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const input = ref('')
const output = ref('')

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'ON', 'AS',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
  'UNION', 'ALL', 'DISTINCT', 'EXISTS', 'BETWEEN', 'LIKE',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IS', 'NULL',
  'ASC', 'DESC', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'WITH', 'RECURSIVE', 'OVER', 'PARTITION', 'ROW_NUMBER', 'RANK',
]
const MAJOR_CLAUSES = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO', 'UPDATE', 'DELETE FROM', 'SET', 'VALUES', 'WITH']
const SUB_CLAUSES = ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN', 'AND', 'OR', 'ON']

function splitTopLevel(str, delimiter) {
  const parts = []
  let depth = 0, current = ''
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === delimiter && depth === 0) {
      parts.push(current); current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current)
  return parts
}

function format() {
  const raw = input.value.trim()
  if (!raw) return
  const strings = []
  let normalized = raw.replace(/'[^']*'/g, (m) => { strings.push(m); return `__STR${strings.length - 1}__` })
  normalized = normalized.replace(/\s+/g, ' ').trim()
  SQL_KEYWORDS.forEach(kw => {
    normalized = normalized.replace(new RegExp(`\\b${kw}\\b`, 'gi'), kw)
  })
  MAJOR_CLAUSES.forEach(clause => {
    const re = new RegExp(`\\s+${clause.replace(' ', '\\s+')}\\b`, 'gi')
    normalized = normalized.replace(re, `\n${clause}`)
  })
  SUB_CLAUSES.forEach(clause => {
    const re = new RegExp(`\\s+${clause.replace(' ', '\\s+')}\\b`, 'gi')
    normalized = normalized.replace(re, `\n  ${clause}`)
  })
  const lines = normalized.split('\n')
  const result = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^SELECT\b/i.test(trimmed)) {
      const afterSelect = trimmed.slice(6).trim()
      const fields = splitTopLevel(afterSelect, ',')
      if (fields.length > 1) {
        result.push('SELECT')
        fields.forEach((f, i) => {
          result.push('  ' + f.trim() + (i < fields.length - 1 ? ',' : ''))
        })
      } else {
        result.push(trimmed)
      }
    } else {
      result.push(trimmed)
    }
  }
  let out = result.join('\n')
  strings.forEach((s, i) => { out = out.replace(`__STR${i}__`, s) })
  output.value = out
}

function minify() {
  const raw = input.value.trim()
  if (!raw) return
  const strings = []
  let result = raw.replace(/'[^']*'/g, (m) => { strings.push(m); return `__STR${strings.length - 1}__` })
  result = result.replace(/\s+/g, ' ').trim()
  strings.forEach((s, i) => { result = result.replace(`__STR${i}__`, s) })
  output.value = result
}
</script>

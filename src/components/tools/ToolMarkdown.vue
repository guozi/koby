<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Markdown</label>
        <textarea v-model="input" class="input font-mono text-sm resize-none" rows="18" :placeholder="t('toolbox.mdInputHint')"></textarea>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.preview') }}</label>
        <div v-html="rendered" class="input bg-gray-50 dark:bg-gray-900 text-sm overflow-auto prose-preview" style="min-height:27rem;max-height:27rem"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t } = useToolHelper()
const input = ref('')

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderMd(src) {
  const lines = src.split('\n')
  let html = ''
  let inCode = false
  let codeLang = ''
  let codeLines = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (inCode) {
        html += `<pre style="background:#1e1e2e;color:#cdd6f4;padding:.75rem;border-radius:.375rem;overflow-x:auto;font-size:.8rem;margin:.5rem 0"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`
        codeLines = []
        inCode = false
      } else {
        inCode = true
        codeLang = line.slice(3).trim()
      }
      continue
    }
    if (inCode) { codeLines.push(line); continue }

    if (line.match(/^---+$/)) { html += '<hr style="border-color:#e5e7eb;margin:.75rem 0"/>'; continue }

    let processed = line
    const headingMatch = processed.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const sizes = ['', '1.5em', '1.3em', '1.1em', '1em', '.9em', '.85em']
      html += `<h${level} style="font-size:${sizes[level]};font-weight:700;margin:.6rem 0">${inlineFormat(headingMatch[2])}</h${level}>`
      continue
    }

    if (processed.match(/^>\s/)) {
      html += `<blockquote style="border-left:3px solid #6366f1;padding-left:.75rem;color:#6b7280;margin:.25rem 0">${inlineFormat(processed.slice(2))}</blockquote>`
      continue
    }

    const ulMatch = processed.match(/^(\s*)[-*]\s+(.+)$/)
    if (ulMatch) {
      html += `<div style="padding-left:${ulMatch[1].length / 2 + 1}rem;margin:.1rem 0">• ${inlineFormat(ulMatch[2])}</div>`
      continue
    }

    const olMatch = processed.match(/^(\s*)\d+\.\s+(.+)$/)
    if (olMatch) {
      html += `<div style="padding-left:${olMatch[1].length / 2 + 1}rem;margin:.1rem 0">${inlineFormat(olMatch[2])}</div>`
      continue
    }

    if (!processed.trim()) { html += '<div style="height:.5rem"></div>'; continue }
    html += `<p style="margin:.25rem 0">${inlineFormat(processed)}</p>`
  }

  if (inCode) {
    html += `<pre style="background:#1e1e2e;color:#cdd6f4;padding:.75rem;border-radius:.375rem;overflow-x:auto;font-size:.8rem;margin:.5rem 0"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`
  }

  return html
}

function inlineFormat(text) {
  let s = escapeHtml(text)
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:.25rem"/>')
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#3b82f6;text-decoration:underline" target="_blank">$1</a>')
  s = s.replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;padding:.1rem .3rem;border-radius:.25rem;font-size:.85em">$1</code>')
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  return s
}

const rendered = computed(() => input.value ? renderMd(input.value) : `<span style="color:#9ca3af">${t('toolbox.mdPreviewHint')}</span>`)
</script>

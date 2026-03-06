<template>
  <div class="space-y-4">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <div>
        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">{{ t('toolbox.language') }}</label>
        <select v-model="lang" class="select text-sm w-32">
          <option v-for="l in CODE_LANGS" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">{{ t('toolbox.theme') }}</label>
        <select v-model="theme" class="select text-sm w-32">
          <option v-for="(th, key) in CODE_THEMES" :key="key" :value="key">{{ th.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">{{ t('toolbox.fontSize') }}</label>
        <select v-model.number="fontSize" class="select text-sm w-20">
          <option :value="12">12</option>
          <option :value="14">14</option>
          <option :value="16">16</option>
          <option :value="18">18</option>
          <option :value="20">20</option>
        </select>
      </div>
      <div class="flex items-end gap-2 ml-auto">
        <label class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
          <input v-model="lineNums" type="checkbox" class="rounded border-gray-300 dark:border-gray-600" />
          {{ t('toolbox.lineNumbers') }}
        </label>
        <button @click="exportImage" class="btn btn-primary text-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {{ t('toolbox.exportImage') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="flex flex-col">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.input') }}</label>
        <textarea v-model="input" class="input font-mono text-sm resize-none flex-1 min-h-[320px] max-h-[560px]" :placeholder="t('toolbox.codeInputHint')"></textarea>
      </div>

      <!-- Preview -->
      <div class="flex flex-col">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.preview') }}</label>
        <div class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex-1 flex flex-col min-h-[320px] max-h-[560px]" :style="{ backgroundColor: currentTheme.bg }">
          <!-- Window chrome -->
          <div class="flex items-center gap-2 px-4 py-3" :style="{ backgroundColor: currentTheme.chrome }">
            <div class="flex gap-1.5">
              <span class="w-3 h-3 rounded-full bg-[#FF5F57]"></span>
              <span class="w-3 h-3 rounded-full bg-[#FEBC2E]"></span>
              <span class="w-3 h-3 rounded-full bg-[#28C840]"></span>
            </div>
            <span class="text-xs ml-2" :style="{ color: currentTheme.comment }">{{ langName }}</span>
          </div>
          <!-- Code area -->
          <div class="p-4 overflow-auto flex-1" :style="{ backgroundColor: currentTheme.bg, fontSize: fontSize + 'px', lineHeight: '1.6' }">
            <table class="border-collapse">
              <tbody>
                <tr v-for="(line, i) in highlightedLines" :key="i">
                  <td v-if="lineNums" class="pr-4 select-none text-right align-top" :style="{ color: currentTheme.comment, fontFamily: 'monospace', opacity: 0.5 }">{{ i + 1 }}</td>
                  <td class="whitespace-pre" style="font-family: monospace"><span v-for="(token, j) in line" :key="j" :style="{ color: token.color }">{{ token.text }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'
import { CODE_THEMES, CODE_LANGS, tokenizeLine } from '../../utils/codeHighlight'

const { t, toast } = useToolHelper()

const input = ref('function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// Print first 10 numbers\nfor (let i = 0; i < 10; i++) {\n  console.log(fibonacci(i));\n}')
const lang = ref('javascript')
const theme = ref('monokai')
const fontSize = ref(14)
const lineNums = ref(true)

const langName = computed(() => CODE_LANGS.find(l => l.id === lang.value)?.name || '')
const currentTheme = computed(() => CODE_THEMES[theme.value] || CODE_THEMES.monokai)

const highlightedLines = computed(() => {
  return input.value.split('\n').map(line => tokenizeLine(line, lang.value, currentTheme.value))
})

async function exportImage() {
  const themeVal = currentTheme.value
  const lines = highlightedLines.value
  const fs = fontSize.value
  const lineHeight = fs * 1.6
  const font = `${fs}px monospace`
  const padding = 24
  const chromeHeight = 40
  const showLineNums = lineNums.value

  const measureCanvas = document.createElement('canvas')
  const mctx = measureCanvas.getContext('2d')
  mctx.font = font

  const lineNumWidth = showLineNums ? mctx.measureText(String(lines.length)).width + 20 : 0

  let maxLineWidth = 0
  for (const line of lines) {
    const text = line.map(t => t.text).join('')
    const w = mctx.measureText(text).width
    if (w > maxLineWidth) maxLineWidth = w
  }

  const canvasWidth = Math.max(maxLineWidth + lineNumWidth + padding * 2 + 20, 400)
  const canvasHeight = chromeHeight + lines.length * lineHeight + padding * 2

  const canvas = document.createElement('canvas')
  const dpr = window.devicePixelRatio || 2
  canvas.width = canvasWidth * dpr
  canvas.height = canvasHeight * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  // Background with rounded corners
  const radius = 12
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(canvasWidth - radius, 0)
  ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, radius)
  ctx.lineTo(canvasWidth, canvasHeight - radius)
  ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - radius, canvasHeight)
  ctx.lineTo(radius, canvasHeight)
  ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
  ctx.fillStyle = themeVal.bg
  ctx.fill()

  // Chrome bar
  ctx.fillStyle = themeVal.chrome
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(canvasWidth - radius, 0)
  ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, radius)
  ctx.lineTo(canvasWidth, chromeHeight)
  ctx.lineTo(0, chromeHeight)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
  ctx.fill()

  // Traffic light dots
  const dotY = chromeHeight / 2, dotR = 6
  ctx.fillStyle = '#FF5F57'; ctx.beginPath(); ctx.arc(16 + dotR, dotY, dotR, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FEBC2E'; ctx.beginPath(); ctx.arc(16 + dotR * 3 + 4, dotY, dotR, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#28C840'; ctx.beginPath(); ctx.arc(16 + dotR * 5 + 8, dotY, dotR, 0, Math.PI * 2); ctx.fill()

  // Language label
  ctx.font = `${fs - 2}px sans-serif`
  ctx.fillStyle = themeVal.comment
  ctx.fillText(langName.value, 16 + dotR * 7 + 20, dotY + (fs - 2) / 3)

  // Code lines
  ctx.font = font
  ctx.textBaseline = 'top'
  const startY = chromeHeight + padding

  lines.forEach((tokens, i) => {
    const y = startY + i * lineHeight
    let x = padding

    if (showLineNums) {
      ctx.fillStyle = themeVal.comment
      ctx.globalAlpha = 0.5
      const numStr = String(i + 1)
      const numW = mctx.measureText(numStr).width
      ctx.fillText(numStr, padding + lineNumWidth - numW - 12, y)
      ctx.globalAlpha = 1
      x = padding + lineNumWidth
    }

    for (const token of tokens) {
      ctx.fillStyle = token.color
      ctx.fillText(token.text, x, y)
      x += mctx.measureText(token.text).width
    }
  })

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('toolbox.imageExported'))
  }, 'image/png')
}
</script>

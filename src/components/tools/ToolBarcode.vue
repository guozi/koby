<template>
  <div class="space-y-4">
    <!-- Format select -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.barcodeFormat') }}</label>
      <select v-model="format" class="input text-sm w-48">
        <option v-for="f in formats" :key="f" :value="f">{{ f }}</option>
      </select>
    </div>

    <!-- Value input -->
    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.barcodeValue') }}</label>
      <input v-model="value" type="text" class="input font-mono text-sm" :placeholder="placeholders[format]" />
      <div v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</div>
    </div>

    <!-- Preview -->
    <div class="flex justify-center p-4 bg-white rounded-xl border border-gray-200 dark:border-gray-700">
      <svg ref="svgRef"></svg>
    </div>

    <!-- Download buttons -->
    <div class="flex gap-2">
      <button @click="downloadSvg" class="btn btn-primary text-sm">{{ t('toolbox.barcodeDownload') }} SVG</button>
      <button @click="downloadPng" class="btn btn-outline text-sm">{{ t('toolbox.barcodeDownload') }} PNG</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'
import JsBarcode from 'jsbarcode'

const { t } = useToolHelper()

const formats = ['CODE128', 'EAN13', 'EAN8', 'UPC', 'CODE39', 'ITF14', 'MSI', 'pharmacode']
const format = ref('CODE128')
const value = ref('Hello Koby')
const error = ref('')
const svgRef = ref(null)

const placeholders = {
  CODE128: 'Hello World',
  EAN13: '5901234123457',
  EAN8: '96385074',
  UPC: '123456789012',
  CODE39: 'ABC-1234',
  ITF14: '12345678901231',
  MSI: '123456',
  pharmacode: '1234',
}

function renderBarcode() {
  error.value = ''
  if (!svgRef.value || !value.value) return
  try {
    JsBarcode(svgRef.value, value.value, {
      format: format.value,
      width: 2,
      height: 80,
      displayValue: true,
      margin: 10,
    })
  } catch (e) {
    error.value = e.message || 'Invalid value for this format'
  }
}

function downloadSvg() {
  if (!svgRef.value) return
  const svg = svgRef.value.outerHTML
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `barcode-${format.value}.svg`; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function downloadPng() {
  if (!svgRef.value) return
  const svg = svgRef.value
  const canvas = document.createElement('canvas')
  const rect = svg.getBoundingClientRect()
  canvas.width = rect.width * 2; canvas.height = rect.height * 2
  const ctx = canvas.getContext('2d')
  ctx.scale(2, 2)
  const img = new Image()
  const svgData = new XMLSerializer().serializeToString(svg)
  img.onload = () => {
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png'); a.download = `barcode-${format.value}.png`; a.click()
  }
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
}

watch([format, value], () => nextTick(renderBarcode))
onMounted(() => nextTick(renderBarcode))
</script>

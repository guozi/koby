<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Properties</label>
        <textarea v-model="propsText" class="input font-mono text-sm resize-none" rows="14" placeholder="app.name=MyApp&#10;app.port=3000&#10;db.host=localhost"></textarea>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">YAML</label>
        <textarea v-model="yamlText" class="input font-mono text-sm resize-none" rows="14" placeholder="app:&#10;  name: MyApp&#10;  port: 3000"></textarea>
      </div>
    </div>
    <div class="flex gap-2">
      <button @click="toYaml" class="btn btn-primary text-sm">Properties → YAML</button>
      <button @click="toProps" class="btn btn-outline text-sm">YAML → Properties</button>
      <button v-if="propsText || yamlText" @click="copyResult(yamlText || propsText)" class="btn btn-outline text-sm ml-auto">{{ t('toolbox.copy') }}</button>
    </div>
    <div v-if="error" class="text-xs text-red-500">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t, copyResult } = useToolHelper()

const propsText = ref('')
const yamlText = ref('')
const error = ref('')

function setNested(obj, keys, value) {
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in cur) || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {}
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = value
}

function objToYaml(obj, indent = 0) {
  let result = ''
  const pad = '  '.repeat(indent)
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object') {
      result += `${pad}${k}:\n${objToYaml(v, indent + 1)}`
    } else {
      result += `${pad}${k}: ${v}\n`
    }
  }
  return result
}

function toYaml() {
  error.value = ''
  try {
    const obj = {}
    for (const line of propsText.value.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      const colonIdx = trimmed.indexOf(':')
      let key, value
      if (eqIdx > 0 && (colonIdx < 0 || eqIdx < colonIdx)) {
        key = trimmed.slice(0, eqIdx).trim()
        value = trimmed.slice(eqIdx + 1).trim()
      } else if (colonIdx > 0) {
        key = trimmed.slice(0, colonIdx).trim()
        value = trimmed.slice(colonIdx + 1).trim()
      } else continue
      setNested(obj, key.split('.'), value)
    }
    yamlText.value = objToYaml(obj)
  } catch (e) { error.value = e.message }
}

function yamlToObj(text) {
  const lines = text.split('\n')
  const root = {}
  const stack = [{ obj: root, indent: -1 }]
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const indent = line.search(/\S/)
    const match = line.trim().match(/^([^:]+):\s*(.*)$/)
    if (!match) continue
    const key = match[1].trim()
    const val = match[2].trim()
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop()
    const parent = stack[stack.length - 1].obj
    if (val) {
      parent[key] = val
    } else {
      parent[key] = {}
      stack.push({ obj: parent[key], indent })
    }
  }
  return root
}

function flattenObj(obj, prefix = '') {
  let result = ''
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object') {
      result += flattenObj(v, key)
    } else {
      result += `${key}=${v}\n`
    }
  }
  return result
}

function toProps() {
  error.value = ''
  try {
    const obj = yamlToObj(yamlText.value)
    propsText.value = flattenObj(obj)
  } catch (e) { error.value = e.message }
}
</script>

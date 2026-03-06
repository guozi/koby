<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.original') }}</label>
        <textarea v-model="left" class="input font-mono text-sm resize-none" rows="8" :placeholder="t('toolbox.pasteText')"></textarea>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ t('toolbox.modified') }}</label>
        <textarea v-model="right" class="input font-mono text-sm resize-none" rows="8" :placeholder="t('toolbox.pasteText')"></textarea>
      </div>
    </div>
    <button @click="compute" class="btn btn-primary text-sm">{{ t('toolbox.compare') }}</button>
    <div v-if="result.length" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-xs space-y-0 overflow-x-auto">
      <div v-for="(line, i) in result" :key="i"
        :class="{
          'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20': line.type === 'add',
          'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20': line.type === 'remove',
          'text-gray-500 dark:text-gray-400': line.type === 'same'
        }" class="px-2 py-0.5 whitespace-pre">{{ line.prefix }}{{ line.text }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToolHelper } from '../../composables/useToolHelper'

const { t } = useToolHelper()

const left = ref('')
const right = ref('')
const result = ref([])

function compute() {
  const linesA = left.value.split('\n')
  const linesB = right.value.split('\n')
  const res = []
  let ai = 0, bi = 0
  while (ai < linesA.length || bi < linesB.length) {
    if (ai >= linesA.length) {
      res.push({ type: 'add', prefix: '+ ', text: linesB[bi] }); bi++
    } else if (bi >= linesB.length) {
      res.push({ type: 'remove', prefix: '- ', text: linesA[ai] }); ai++
    } else if (linesA[ai] === linesB[bi]) {
      res.push({ type: 'same', prefix: '  ', text: linesA[ai] }); ai++; bi++
    } else {
      res.push({ type: 'remove', prefix: '- ', text: linesA[ai] })
      res.push({ type: 'add', prefix: '+ ', text: linesB[bi] })
      ai++; bi++
    }
  }
  result.value = res
}
</script>

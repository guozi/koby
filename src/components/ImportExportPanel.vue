<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold mb-4">导入/导出书签</h3>

        <!-- 导出书签 -->
        <div class="mb-6">
            <h4 class="font-medium mb-2">导出书签</h4>
            <p class="text-sm text-gray-500 mb-3">将您的所有书签和收藏夹导出为JSON文件，方便备份或迁移。</p>
            <button @click="exportBookmarks" class="btn btn-primary flex">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                </svg>
                导出书签
            </button>
        </div>

        <!-- 导入书签 -->
        <div>
            <h4 class="font-medium mb-2">导入书签</h4>
            <p class="text-sm text-gray-500 mb-3">从JSON文件或浏览器导出的HTML文件导入书签。</p>

            <!-- 导入选项卡 -->
            <div class="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav class="flex -mb-px">
                    <button @click="importTab = 'json'" class="py-2 px-4 border-b-2 font-medium text-sm"
                        :class="importTab === 'json' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
                        从JSON导入
                    </button>
                    <button @click="importTab = 'html'" class="py-2 px-4 border-b-2 font-medium text-sm"
                        :class="importTab === 'html' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
                        从浏览器导入
                    </button>
                </nav>
            </div>

            <!-- JSON导入 -->
            <div v-if="importTab === 'json'" class="mb-4">
                <input type="file" ref="jsonFileInput" id="getElementById" accept=".json" class="hidden" @change="handleJsonFileUpload">
                <button @click="$refs.jsonFileInput.click()" class="btn btn-secondary flex mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    选择JSON文件
                </button>
                <p v-if="jsonFileName" class="text-sm text-gray-600 mb-2">已选择: {{ jsonFileName }}</p>
                <button v-if="jsonFileName" @click="importJsonBookmarks" class="btn btn-primary" :disabled="importing">
                    <span v-if="importing">导入中...</span>
                    <span v-else>导入书签</span>
                </button>
            </div>

            <!-- HTML导入 -->
            <div v-if="importTab === 'html'" class="mb-4">
                <div class="mb-4">
                    <h5 class="text-sm font-medium mb-2">从浏览器导出书签的步骤:</h5>
                    <ol class="text-sm text-gray-600 list-decimal pl-5 space-y-1">
                        <li><strong>Chrome:</strong> 书签管理器 → ⋮ → 导出书签</li>
                        <li><strong>Firefox:</strong> 书签 → 管理书签 → 导入和备份 → 导出书签到HTML</li>
                        <li><strong>Edge:</strong> 收藏夹 → ⋯ → 管理收藏夹 → ⋯ → 导出收藏夹</li>
                        <li><strong>Safari:</strong> 文件 → 导出 → 书签</li>
                    </ol>
                </div>

                <input type="file" ref="htmlFileInput" id="htmlFileInput" accept=".html,.htm" class="hidden"
                    @change="handleHtmlFileUpload">
                <button @click="$refs.htmlFileInput.click()" class="btn btn-secondary flex mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    选择HTML文件
                </button>
                <p v-if="htmlFileName" class="text-sm text-gray-600 mb-2">已选择: {{ htmlFileName }}</p>
                <button v-if="htmlFileName" @click="importHtmlBookmarks" class="btn btn-primary" :disabled="importing">
                    <span v-if="importing">导入中...</span>
                    <span v-else>导入书签</span>
                </button>
            </div>
        </div>

        <!-- 导入结果提示 -->
        <div v-if="importResult" class="mt-4 p-3 rounded-md"
            :class="importResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
            {{ importResult.message }}
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBookmarkStore } from '../stores/bookmarks'

const bookmarkStore = useBookmarkStore()

// 导入相关状态
const importTab = ref('json')
const jsonFileName = ref('')
const htmlFileName = ref('')
const importing = ref(false)
const importResult = ref(null)

// JSON文件上传处理
function handleJsonFileUpload(event) {
    const file = event.target.files[0]
    if (file) {
        jsonFileName.value = file.name
    }
}

// HTML文件上传处理
function handleHtmlFileUpload(event) {
    const file = event.target.files[0]
    if (file) {
        htmlFileName.value = file.name
    }
}

// 导出书签
function exportBookmarks() {
    try {
        const data = bookmarkStore.exportBookmarks()
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        // 创建下载链接并触发下载
        const a = document.createElement('a')
        a.href = url
        a.download = `koby-bookmarks-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()

        // 清理
        setTimeout(() => {
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }, 100)

        importResult.value = {
            success: true,
            message: '书签导出成功！'
        }
    } catch (error) {
        console.error('导出书签失败:', error)
        importResult.value = {
            success: false,
            message: '导出失败: ' + error.message
        }
    }
}

// 导入JSON书签
async function importJsonBookmarks() {
    const file = document.getElementById('jsonFileInput').files[0]
    if (!file) return

    importing.value = true
    importResult.value = null

    try {
        const reader = new FileReader()

        reader.onload = async (e) => {
            try {
                const data = e.target.result
                const success = await bookmarkStore.importBookmarks(data)

                if (success) {
                    importResult.value = {
                        success: true,
                        message: '书签导入成功！'
                    }
                    // 重置文件输入
                    jsonFileName.value = ''
                    document.getElementById('jsonFileInput').value = ''
                } else {
                    throw new Error('导入失败')
                }
            } catch (error) {
                console.error('导入JSON书签失败:', error)
                importResult.value = {
                    success: false,
                    message: '导入失败: 文件格式不正确或数据无效'
                }
            } finally {
                importing.value = false
            }
        }

        reader.onerror = () => {
            importing.value = false
            importResult.value = {
                success: false,
                message: '读取文件失败'
            }
        }

        reader.readAsText(file)
    } catch (error) {
        importing.value = false
        importResult.value = {
            success: false,
            message: '导入失败: ' + error.message
        }
    }
}


// 从HTML导入书签
async function importHtmlBookmarks(event) {
    const file = document.getElementById('htmlFileInput').files[0]
    if (!file) return

    importing.value = true
    importResult.value = null

    try {
        const reader = new FileReader()

        reader.onload = async (e) => {
            try {
                const htmlContent = e.target.result
                const success = await bookmarkStore.importHtmlBookmarks(htmlContent)

                if (success) {
                    importResult.value = {
                        success: true,
                        message: `成功导入 ${bookmarks.length} 个书签和 ${collections.length} 个收藏夹！`
                    }
                    // 重置文件输入
                    htmlFileName.value = ''
                    document.getElementById('htmlFileInput').value = ''
                } else {
                    throw new Error('导入失败')
                }
            } catch (error) {
                console.error('导入HTML书签失败:', error)
                importResult.value = {
                    success: false,
                    message: '导入失败: HTML格式不正确或无法解析'
                }
            } finally {
                importing.value = false
            }
        }

        reader.onerror = () => {
            importing.value = false
            importResult.value = {
                success: false,
                message: '读取文件失败'
            }
        }

        reader.readAsText(file)
    } catch (error) {
        importing.value = false
        importResult.value = {
            success: false,
            message: '导入失败: ' + error.message
        }
    }
}

</script>
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useBookmarkStore = defineStore('bookmarks', {
  state: () => ({
    bookmarks: useLocalStorage('koby-bookmarks', []),
    collections: useLocalStorage('koby-collections', [
      { id: 1, name: '默认收藏夹', icon: '📁', color: '#3B82F6' },
      { id: 2, name: '工作', icon: '💼', color: '#10B981' },
      { id: 3, name: '学习', icon: '📚', color: '#F59E0B' }
    ])
  }),
  getters: {
    getBookmarksByCollection: (state) => {
      return (collectionId) => state.bookmarks.filter(bookmark => bookmark.collectionId === collectionId)
    },
    getAllCollections: (state) => state.collections
  },
  actions: {
    addBookmark(bookmark) {
      const newBookmark = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...bookmark
      }
      this.bookmarks.push(newBookmark)
      return newBookmark
    },
    updateBookmark(id, data) {
      const index = this.bookmarks.findIndex(b => b.id === id)
      if (index !== -1) {
        this.bookmarks[index] = { ...this.bookmarks[index], ...data }
      }
    },
    removeBookmark(id) {
      this.bookmarks = this.bookmarks.filter(b => b.id !== id)
    },
    addCollection(collection) {
      const newCollection = {
        id: Date.now(),
        ...collection
      }
      this.collections.push(newCollection)
      return newCollection
    },
    updateCollection(id, data) {
      const index = this.collections.findIndex(c => c.id === id)
      if (index !== -1) {
        this.collections[index] = { ...this.collections[index], ...data }
      }
    },
    removeCollection(id) {
      // 删除收藏夹前，将该收藏夹下的书签移动到默认收藏夹
      this.bookmarks.forEach(bookmark => {
        if (bookmark.collectionId === id) {
          bookmark.collectionId = 1 // 默认收藏夹ID
        }
      })
      this.collections = this.collections.filter(c => c.id !== id)
    },
    importBookmarks(data) {
      try {
        const importedData = JSON.parse(data)
        if (Array.isArray(importedData.bookmarks)) {
          this.bookmarks = [...this.bookmarks, ...importedData.bookmarks]
        }
        if (Array.isArray(importedData.collections)) {
          this.collections = [...this.collections, ...importedData.collections]
        }
        return true
      } catch (error) {
        console.error('导入数据失败:', error)
        return false
      }
    },
    exportBookmarks() {
      return JSON.stringify({
        bookmarks: this.bookmarks,
        collections: this.collections
      })
    }
  }
})
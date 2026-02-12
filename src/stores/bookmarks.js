import { defineStore } from 'pinia'
import { bookmarksAPI, collectionsAPI } from '../services/api'

export const useBookmarkStore = defineStore('bookmarks', {
  state: () => ({
    bookmarks: [],
    collections: [],
    loading: false,
    error: null
  }),
  getters: {
    getBookmarksByCollection: (state) => {
      return (collection_id) => state.bookmarks.filter(bookmark => bookmark.collection_id === collection_id)
    },
    getAllCollections: (state) => state.collections
  },
  actions: {
    resetState() {
      this.bookmarks = [];
      this.collections = [];
      this.loading = false;
      this.error = null;
    },

    // 初始化加载数据
    async initialize() {
      try {
        this.loading = true;
        await this.fetchCollections();
        await this.fetchBookmarks();
        this.error = null;
      } catch (error) {
        console.error('初始化数据失败:', error);
        this.error = '加载数据失败，请刷新页面重试';
      } finally {
        this.loading = false;
      }
    },
    
    // 获取所有书签
    async fetchBookmarks() {
      try {
        this.bookmarks = await bookmarksAPI.getAll();
      } catch (error) {
        console.error('获取书签失败:', error);
        throw error;
      }
    },
    
    // 获取特定收藏夹下的书签
    async fetchBookmarksByCollection(collection_id) {
      try {
        return await bookmarksAPI.getByCollection(collection_id);
      } catch (error) {
        console.error(`获取收藏夹 ${collection_id} 的书签失败:`, error);
        throw error;
      }
    },
    
    // 获取所有收藏夹
    async fetchCollections() {
      try {
        this.collections = await collectionsAPI.getAll();
      } catch (error) {
        console.error('获取收藏夹失败:', error);
        throw error;
      }
    },
    
    // 添加书签
    async addBookmark(bookmark) {
      try {
        const newBookmark = await bookmarksAPI.add({
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description || '',
          collection_id: bookmark.collection_id,
          favicon: bookmark.favicon || null,
          tags: bookmark.tags || null,
          is_pinned: bookmark.is_pinned || false
        });
        this.bookmarks.push(newBookmark);
        return newBookmark;
      } catch (error) {
        console.error('添加书签失败:', error);
        throw error;
      }
    },
    
    // 更新书签
    async updateBookmark(id, data) {
      try {
        await bookmarksAPI.update(id, {
          title: data.title,
          url: data.url,
          description: data.description || '',
          collection_id: data.collection_id,
          favicon: data.favicon || null,
          tags: data.tags || null,
          is_pinned: data.is_pinned || false
        });
        const index = this.bookmarks.findIndex(b => b.id === id);
        if (index !== -1) {
          this.bookmarks[index] = { ...this.bookmarks[index], ...data };
        }
      } catch (error) {
        console.error('更新书签失败:', error);
        throw error;
      }
    },

    // 切换书签置顶状态
    async toggleBookmarkPin(id) {
      try {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (!bookmark) return;
        
        const newPinnedState = !bookmark.is_pinned;

        bookmark.is_pinned = newPinnedState;
        
        await bookmarksAPI.togglePin(id, bookmark);
      } catch (error) {
        console.error('切换书签置顶状态失败:', error);
        throw error;
      }
    },
    
    // 删除书签
    async removeBookmark(id) {
      try {
        await bookmarksAPI.delete(id);
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
      } catch (error) {
        console.error('删除书签失败:', error);
        throw error;
      }
    },
    
    // 添加收藏夹
    async addCollection(collection) {
      try {
        const newCollection = await collectionsAPI.add({
          name: collection.name,
          icon: collection.icon || '📁',
          color: collection.color || '#3B82F6'
        });
        this.collections.push(newCollection);
        return newCollection;
      } catch (error) {
        console.error('添加收藏夹失败:', error);
        throw error;
      }
    },
    
    // 更新收藏夹
    async updateCollection(id, data) {
      try {
        await collectionsAPI.update(id, {
          name: data.name,
          icon: data.icon,
          color: data.color
        });
        const index = this.collections.findIndex(c => c.id === id);
        if (index !== -1) {
          this.collections[index] = { ...this.collections[index], ...data };
        }
      } catch (error) {
        console.error('更新收藏夹失败:', error);
        throw error;
      }
    },

    // 删除收藏夹
    async removeCollection(id) {
      try {
        await collectionsAPI.delete(id);
        this.collections = this.collections.filter(c => c.id !== id);
        // 刷新书签列表，后端会自动处理关联的书签
        await this.fetchBookmarks();
      } catch (error) {
        console.error('删除收藏夹失败:', error);
        throw error;
      }
    },
    // 导入书签和收藏夹 (JSON格式)
    async importBookmarks(data) {
      try {
        const importedData = JSON.parse(data);
        
        // 导入收藏夹
        if (Array.isArray(importedData.collections)) {
          for (const collection of importedData.collections) {
            await this.addCollection({
              name: collection.name,
              icon: collection.icon,
              color: collection.color
            });
          }
        }
        
        // 导入书签
        if (Array.isArray(importedData.bookmarks)) {
          for (const bookmark of importedData.bookmarks) {
            await this.addBookmark({
              title: bookmark.title,
              url: bookmark.url,
              description: bookmark.description,
              collection_id: bookmark.collection_id,
              favicon: bookmark.favicon || null
            });
          }
        }
        
        return true;
      } catch (error) {
        console.error('导入数据失败:', error);
        return false;
      }
    },
    
    // 导入Chrome/Edge HTML格式书签
    async importHtmlBookmarks(htmlContent) {
      try {
        // 调用API解析HTML书签
        const parsedData = await bookmarksAPI.parseHtml(htmlContent);
        
        if (!parsedData || !parsedData.collections || !parsedData.bookmarks) {
          throw new Error('解析书签失败');
        }
        
        // 导入收藏夹并记录新ID
        const folderIdMap = new Map();
        for (const collection of parsedData.collections) {
          const newCollection = await this.addCollection({
            name: collection.name,
            icon: collection.icon,
            color: collection.color
          });
          // 记录临时ID到实际ID的映射
          folderIdMap.set(collection.tempId, newCollection.id);
        }
        
        // 导入书签
        for (const bookmark of parsedData.bookmarks) {
          // 如果书签使用临时ID，替换为实际ID
          let collectionId = bookmark.collection_id;
          if (folderIdMap.has(collectionId)) {
            collectionId = folderIdMap.get(collectionId);
          }
          
          await this.addBookmark({
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description || '',
            collection_id: collectionId,
            favicon: bookmark.favicon || null,
            tags: bookmark.tags || null,
            is_pinned: bookmark.is_pinned || false
          });
        }
        
        return true;
      } catch (error) {
        console.error('导入HTML书签失败:', error);
        return false;
      }
    },
    
    // 导出书签和收藏夹
    exportBookmarks() {
      return JSON.stringify({
        bookmarks: this.bookmarks,
        collections: this.collections
      });
    }
  }
})

import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加认证信息等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('API请求错误:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 书签相关API
export const bookmarksAPI = {
  // 获取所有书签
  getAll: () => apiClient.get('/api/bookmarks'),
  
  // 获取特定收藏夹下的书签
  getByCollection: (collection_id) => apiClient.get(`/api/bookmarks/collection/${collection_id}`),
  
  // 添加书签
  add: (bookmark) => apiClient.post('/api/bookmarks', bookmark),
  
  // 更新书签
  update: (id, bookmark) => apiClient.put(`/api/bookmarks/${id}`, bookmark),
  
  // 切换书签置顶状态
  togglePin: (id, bookmark) => apiClient.put(`/api/bookmarks/${id}`, bookmark),
  
  // 删除书签
  delete: (id) => apiClient.delete(`/api/bookmarks/${id}`)
};

// 收藏夹相关API
export const collectionsAPI = {
  // 获取所有收藏夹
  getAll: () => apiClient.get('/api/collections'),
  
  // 获取单个收藏夹
  getById: (id) => apiClient.get(`/api/collections/${id}`),
  
  // 添加收藏夹
  add: (collection) => apiClient.post('/api/collections', collection),
  
  // 更新收藏夹
  update: (id, collection) => apiClient.put(`/api/collections/${id}`, collection),
  
  // 删除收藏夹
  delete: (id) => apiClient.delete(`/api/collections/${id}`)
};
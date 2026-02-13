import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：注入 token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('koby_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器：提取 data + 处理 401
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('koby_token');
      localStorage.removeItem('koby_user');
      // 避免在登录页循环跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    console.error('API请求错误:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 认证 API
export const authAPI = {
  register: (data) => apiClient.post('/api/auth/register', data),
  login: (data) => apiClient.post('/api/auth/login', data),
  verifyEmail: (token) => apiClient.post('/api/auth/verify-email', { token }),
  me: () => apiClient.get('/api/auth/me'),
  resendVerification: (email) => apiClient.post('/api/auth/resend-verification', { email }),
  forgotPassword: (email) => apiClient.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => apiClient.post('/api/auth/reset-password', { token, newPassword }),
};

// 书签相关API
export const bookmarksAPI = {
  getAll: () => apiClient.get('/api/bookmarks'),
  getByCollection: (collection_id) => apiClient.get(`/api/bookmarks/collection/${collection_id}`),
  add: (bookmark) => apiClient.post('/api/bookmarks', bookmark),
  update: (id, bookmark) => apiClient.put(`/api/bookmarks/${id}`, bookmark),
  togglePin: (id, bookmark) => apiClient.put(`/api/bookmarks/${id}`, bookmark),
  delete: (id) => apiClient.delete(`/api/bookmarks/${id}`),
  parseHtml: (htmlContent) => apiClient.post('/api/bookmarks/parse-html', { htmlContent })
};

// 收藏夹相关API
export const collectionsAPI = {
  getAll: () => apiClient.get('/api/collections'),
  getById: (id) => apiClient.get(`/api/collections/${id}`),
  add: (collection) => apiClient.post('/api/collections', collection),
  update: (id, collection) => apiClient.put(`/api/collections/${id}`, collection),
  delete: (id) => apiClient.delete(`/api/collections/${id}`)
};

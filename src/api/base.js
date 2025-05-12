// src/api/base.js
import axios from 'axios';

// 创建基础axios实例
const api = axios.create({
  baseURL: 'http://127.0.0.1:8105/api',
  timeout: 5000
});

// 请求拦截器（添加JWT Token）
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器（处理401错误）
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token过期时清除存储
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
// src/api/base.js
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router'

const router = useRouter()

// 创建基础axios实例
const api = axios.create({
  baseURL: 'http://127.0.0.1:8105/api',
  timeout: 10000
});

// 请求拦截器（添加JWT Token）
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器（处理401错误和token过期）
api.interceptors.response.use(
  response => {
    // 检查响应数据是否包含 token 过期信息
    if (response.data && response.data.code === 400 && response.data.message === 'token已过期') {
      // 清除 token
      localStorage.removeItem('token');
      // 弹出提示
      ElMessage.error('登录信息过期，请重新登录');
      // 跳转到登录页面
      router.push('login');
      return Promise.reject(new Error('登录信息过期'));
    }
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      // Token过期时清除存储
      localStorage.removeItem('token');
      router.push('login');
    }
    return Promise.reject(error);
  }
);

export default api;
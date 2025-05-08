import { defineStore } from 'pinia'
import { authAPI } from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null
  }),
  actions: {
    // 登录操作
    async login(credentials) {
      try {
        const res = await authAPI.login(credentials); // 这是 Axios 调用

        // authAPI.login 调用将返回完整的 Axios 响应对象，
        // res.data 将包含后端载荷。
        
        if (res.data.code!=200) { // 检查响应数据中是否存在 token
          this.user = res.data; // 如果需要，存储整个用户对象
          this.token = res.data.token;
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify({
            user_id: res.data.user_id,
            username: res.data.username,
            role: res.data.role
          }));
          return res.data; // 成功登录
        } else {
          if (res.data && res.data.message) {
            throw new Error(res.data.message);
          }
          throw new Error('登录失败：未预期的响应结构。');
        }
      } catch (error) {
        console.error('登录 action 失败:', error);
        throw error;
      }
    },

    // 注册操作
    async register(userData) {
      try {
        // 假设 authAPI.register 处理调用，并可能返回特定数据或仅表示成功
        await authAPI.register(userData);
        return true;
      } catch (error) {
        console.error('注册失败:', error);
        throw error; // 传播错误
      }
    },

    // 退出登录
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // router.push('/login');
    }
  }
});

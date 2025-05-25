import api from '@/api/base';

export const authAPI = {
  // 登录接口
  login: (data) => api.post('/user/login/', data),
  
  // 注册接口（需后端实现）
  register: (data) => api.post('/user/register/', data),

  send_code: (data) => api.post('/user/sms_send/', data),

  login_code: (data) => api.post('/user/code_login/', data),

  forgot_password: (data) => api.post('/user/forgot-password/', data),

  get_public_key: () => api.get('/user/get-public-key/'),
}


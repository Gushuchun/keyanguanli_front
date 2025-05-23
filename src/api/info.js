import axios from 'axios';
import api from '@/api/base';

export const infoAPI = {
  // 获取教师信息
  getTeacherInfo: () => api.get('/teacher/info/'),
  
  // 获取学生信息
  getStudentInfo: () => api.get('/student/info/'),
  
  // 更新教师头像
  updateTeacherAvatar: (formData) => api.post('/teacher/info/update_avatar/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // 更新学生头像
  updateStudentAvatar: (formData) => api.post('/student/info/update_avatar/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // 更新学生信息
  updateStudentInfo: (id, data) => api.put(`/student/info/${id}/`, data),

  updateTeacherInfo: (id, data) => api.put(`/teacher/info/${id}/`, data),

  getstudentavatar: () => api.get(`/student/info/get_avatar/`),

  getteacheravatar: () => api.get(`/teacher/info/get_avatar/`),

  resetpassword: (data) => api.post(`/user/reset-password/`, data),

  getstudentinfo: (data) => api.post(`/student/info/get-student-info/`, data),

  getteachertinfo: (data) => api.post(`/teacher/info/get-teacher-info/`, data),

};
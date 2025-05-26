import api from '@/api/base';

export const infoAPI = {
    getTeamDetail: (id) => api.get(`/team/${id}/`),
    
    updateTeamName: (id, data) => api.put(`/team/${id}/`, data),

    getAllStudents: () => api.get('/student/'),

    getAllTeachers: () => api.get('/teacher/'),

    inviteNewStudent: (data) => api.post(`/team/invite-new-student/`, data),

    inviteNewTeacher: (data) => api.post(`/team/invite-new-teacher/`, data),

    removeStudentFromTeam: (data) => api.post(`/team/remove-student/`, data),

    removeTeacherFromTeam: (data) => api.post(`/team/remove-teacher/`, data),

    dismissTeam: (id) => api.delete(`/team/${id}/`),

    TeamConfirmStatus: (team_sn) => api.get(`/team/team-confirm-status/?team_sn=${team_sn}`),

    fetchTeamData: (page) => api.get('/team/my/', { params: { page } }),

    quitTeam: (id) => api.post(`/team/${id}/quit/`),

    searchTeam: (keyword, page) => api.get(`/team/search/?key=${keyword}`, { params: { page } }),

    confirmstudent: (id, data) => api.put(`/team/confirm-student/${id}/`, data),

    confirmteacher: (id, data) => api.put(`/team/confirm-teacher/${id}/`, data),

    createteam: (data) => api.post(`/team/`, data),
  };


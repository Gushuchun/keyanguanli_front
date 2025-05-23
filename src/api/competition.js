import api from '@/api/base';

export const infoAPI = {
    getCompetitionDetail: (id) => api.get(`/competition/${id}/`),
    
    updateCompetitionInfo: (id, data) => api.put(`/competition/${id}/`, data),

    getAllTeachers: () => api.get('/teacher/'),

    inviteNewTeacher: (data) => api.post(`/competition/invite-new-teacher/`, data),

    removeTeacherFromCompetition: (data) => api.post(`/competition/remove-teacher/`, data),

    dismissTeam: (id) => api.delete(`/team/${id}/`),

    CompetitionConfirmStatus: (competition_sn) => api.get(`/competition/competition-confirm-status/?competition_sn=${competition_sn}`),

    fetchcompetitionData:(page) => api.get(`/competition/my/`, { params: { page } }),

    getmyTeam: () => api.get(`/team/my/?com=1`),

    createCompetition: (data) => api.post(`/competition/`, data),

    CompetitionStudentConfirm: (id, data) => api.post(`/competition/confirm-student/${id}`, data),

    CompetitionTeacherConfirm: (id, data) => api.post(`/competition/confirm-teacher/${id}`, data),

    searchCompetition: (keyword, page) => api.get(`/competition/search/?key=${keyword}`, { params: { page } }),

  };


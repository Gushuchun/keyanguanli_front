import api from '@/api/base';

export const infoAPI = {
    getCompetitionDetail: (id) => api.get(`/competition/${id}/`),
    
    updateCompetitionInfo: (id, data) => api.put(`/competition/${id}/`, data),

    getAllTeachers: () => api.get('/teacher/'),

    inviteNewTeacher: (data) => api.post(`/competition/invite-new-teacher/`, data),

    removeTeacherFromCompetition: (data) => api.post(`/competition/remove-teacher/`, data),

    dismissTeam: (id) => api.delete(`/team/${id}/`),

    CompetitionConfirmStatus: (competition_sn) => api.get(`/competition/competition-confirm-status/?competition_sn=${competition_sn}`),

    fetchcompetitionData:() => api.get(`/competition/my/`),

    getmyTeam: () => api.get(`/team/my/`),

    createCompetition: (data) => api.post(`/competition/`, data),

    CompetitionStudentConfirm: (id, data) => api.post(`/competition/confirm-student/${id}`, data),

    CompetitionTeacherConfirm: (id, data) => api.post(`/competition/confirm-teacher/${id}`, data),

  };


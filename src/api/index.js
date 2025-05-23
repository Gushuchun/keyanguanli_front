import api from '@/api/base';

export const infoAPI = {

  getcollegeprize: () => api.get(`/college/`),

  getallcompetition: () => api.get(`/competition/`),

  getallteamcompetition: () => api.get(`/team/all-team-competition/`),

  getcollegepublic: () => api.get(`/college/public/`),
  
  search: (keyword) => api.get(`/user/search/?key=${keyword}`),
};
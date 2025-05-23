import axios from 'axios';
import api from '@/api/base';

export const settingsAPI = {
  
    getsettings: () => api.get('/settings/'),

    updatesettings: (id, data) => api.put(`/settings/${id}/`, data),

};
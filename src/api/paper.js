import api from '@/api/base';
import { create } from 'lodash';

export const paperAPI = {

    get_all_paper: () => api.get('/paper/'),

    create_paper: (data) => api.post('/paper/', data),

    get_my_paper: (page) => api.get('/paper/my/', { params: { page } }),

    get_paper_detail: (id) => api.get(`/paper/${id}/`),

    update_paper: (id, data) => api.put(`/paper/${id}/`, data),

    delete_paper: (id) => api.delete(`/paper/${id}/`),

    create_paper_inventors: (id, data) => api.post(`/paper/${id}/authors/`, data),

    update_paper_inventors: (id, data) => api.put(`/paper/${id}/authors/`, data),

    delete_paper_inventors: (id, data) => api.delete(`/paper/${id}/authors/`, data),
}
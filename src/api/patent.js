import api from '@/api/base';
import { create } from 'lodash';

export const patentAPI = {

    get_all_patents: () => api.get('/patent/'),

    create_patent: (data) => api.post('/patent/', data),

    get_my_patent: (page) => api.get('/patent/my/', { params: { page } }),

    get_patent_detail: (id) => api.get(`/patent/${id}/`),

    update_patent: (id, data) => api.put(`/patent/${id}/`, data),

    delete_patent: (id) => api.delete(`/patent/${id}/`),

    create_patent_inventors: (id, data) => api.post(`/patent/${id}/inventors/`, data),

    update_patent_inventors: (id, data) => api.put(`/patent/${id}/inventors/`, data),

    delete_patent_inventors: (id, data) => api.delete(`/patent/${id}/inventors/`, data),
}
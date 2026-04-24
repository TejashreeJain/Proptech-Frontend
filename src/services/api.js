import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const leadAPI = {
  // page and limit support pagination
  getAll: (params = {}) => api.get('/leads', { params }),

  getById: (id) => api.get(`/leads/${id}`),

  create: (data) => api.post('/leads', data),

  forceCreate: (data) => api.post('/leads?force=true', data),

  checkDuplicate: (phone, email) =>
    api.post('/leads/check-duplicate', { phone, email }),

  update: (id, data) => api.put(`/leads/${id}`, data),

  delete: (id) => api.delete(`/leads/${id}`),

  addNote: (id, text) => api.post(`/leads/${id}/notes`, { text }),

  getMetrics: () => api.get('/leads/dashboard/metrics'),
};

export default api;

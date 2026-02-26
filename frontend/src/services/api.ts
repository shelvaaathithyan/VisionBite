import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (name: string, email: string, password: string, confirmPassword: string) =>
    api.post('/auth/register', { name, email, password, confirmPassword }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

export const adminService = {
  getPendingUsers: () => api.get('/admin/pending-users'),
  approveUser: (id: string) => api.put(`/admin/approve/${id}`),
  rejectUser: (id: string) => api.put(`/admin/reject/${id}`),
  getApprovedStaff: () => api.get('/admin/approved-staff'),
};

export default api;

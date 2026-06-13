import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/profile', data),
  getDashboardStats: () => api.get('/users/dashboard/stats'),
  getPortfolio: (id: string) => api.get(`/users/${id}/portfolio`),
  aggregateSkills: () => api.post('/users/skills/aggregate'),
};

export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: Record<string, unknown>) => api.post('/projects', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  submit: (id: string) => api.post(`/projects/${id}/submit`),
  analyze: (id: string) => api.post(`/projects/${id}/analyze`),
};

export const certificatesApi = {
  list: () => api.get('/certificates'),
  create: (data: Record<string, unknown>) => api.post('/certificates', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/certificates/${id}`, data),
  delete: (id: string) => api.delete(`/certificates/${id}`),
  submit: (id: string) => api.post(`/certificates/${id}/submit`),
};

export const verificationsApi = {
  getPending: () => api.get('/verifications/pending'),
  getHistory: (params?: Record<string, string>) => api.get('/verifications/history', { params }),
  review: (type: string, id: string, data: { status: string; feedback?: string }) =>
    api.post(`/verifications/${type}/${id}/review`, data),
  getStats: () => api.get('/verifications/stats'),
};

export const badgesApi = {
  list: () => api.get('/badges'),
  my: () => api.get('/badges/my'),
  suggestions: () => api.get('/badges/suggestions'),
  check: () => api.post('/badges/check'),
};

export const notificationsApi = {
  list: (params?: Record<string, string>) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const githubApi = {
  analyze: (repoUrl: string, projectId?: string) =>
    api.post('/github-analysis/analyze', { repoUrl, projectId }),
  history: () => api.get('/github-analysis/history'),
  get: (id: string) => api.get(`/github-analysis/${id}`),
};

export const searchApi = {
  students: (params?: Record<string, string>) => api.get('/search/students', { params }),
};

export const recruiterApi = {
  getSaved: () => api.get('/recruiter/saved'),
  saveCandidate: (data: { studentId: string; notes?: string; tags?: string[] }) =>
    api.post('/recruiter/saved', data),
  removeSaved: (studentId: string) => api.delete(`/recruiter/saved/${studentId}`),
  getDashboard: () => api.get('/recruiter/dashboard'),
};

export const adminApi = {
  getAnalytics: () => api.get('/admin/analytics'),
  getTimeseries: (days?: number) => api.get('/admin/analytics/timeseries', { params: { days } }),
  getUsers: (params?: Record<string, string>) => api.get('/admin/users', { params }),
  createUser: (data: Record<string, unknown>) => api.post('/admin/users', data),
  updateUser: (id: string, data: Record<string, unknown>) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  suspendUser: (id: string, suspended: boolean) =>
    api.patch(`/admin/users/${id}/suspend`, { suspended }),
  assignVerifier: (id: string) => api.post(`/admin/users/${id}/assign-verifier`),
  assignRecruiter: (id: string) => api.post(`/admin/users/${id}/assign-recruiter`),
  getAuditLogs: (params?: Record<string, string>) => api.get('/audit-logs', { params }),
};

export const reportsApi = {
  downloadStudent: (studentId: string) =>
    api.get(`/reports/student/${studentId}`, { responseType: 'blob' }),
};


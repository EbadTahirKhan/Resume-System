// src/services/api.js - API Service for Backend Communication
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Achievement APIs
export const achievementAPI = {
  getAll: (type = null) => api.get('/achievements', { params: { type } }),
  getById: (id) => api.get(`/achievements/${id}`),
  create: (data) => api.post('/achievements', data),
  update: (id, data) => api.put(`/achievements/${id}`, data),
  delete: (id) => api.delete(`/achievements/${id}`),
  getStats: () => api.get('/achievements/stats/count'),
};

// Skill APIs
export const skillAPI = {
  getAll: () => api.get('/skills'),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
  bulkAdd: (skills) => api.post('/skills/bulk', { skills }),
};

// Resume APIs
export const resumeAPI = {
  getAll: () => api.get('/resumes'),
  getComplete: (id) => api.get(`/resumes/${id}/complete`),
  generate: (data) => api.post('/resumes/generate', data),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
  addAchievement: (resumeId, achievementId) => 
    api.post(`/resumes/${resumeId}/achievements`, { achievement_id: achievementId }),
  removeAchievement: (resumeId, achievementId) => 
    api.delete(`/resumes/${resumeId}/achievements/${achievementId}`),
};

export default api;
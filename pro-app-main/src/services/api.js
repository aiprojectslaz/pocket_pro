// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:1337/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the token to the headers if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default {
  getProcedure(id) {
    return apiClient.get(`/procedures/${id}`);
  },

  getProcedures() {
    return apiClient.get('/procedures');
  },

  getDefinitions() {
    return apiClient.get('/definitions');
  },

  getSubProcedures() {
    return apiClient.get('/sub-procedures');
  },

  getSubRoles() {
    return apiClient.get('/procedure-roles');
  },

  getAppendices() {
    return apiClient.get('/appendices');
  },

  getMainRoles() {
    return apiClient.get('/main-roles');
  },

  getProcedureById(id) {
    return apiClient.get(`/procedures/${id}`);
  },
};

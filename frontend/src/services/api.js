import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const healthService = {
  getHealth: async () => {
    const startTime = performance.now();
    const response = await api.get('/health');
    const endTime = performance.now();
    return {
      ...response.data,
      latency: Math.round(endTime - startTime),
    };
  },
};

export const deviceService = {
  getAll: (params) => api.get('/devices', { params }),
  getById: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
};

export const ipService = {
  validate: (ip) => api.post('/validate-ip', { ip }),
};

export const monitoringService = {
  getStatus: () => api.get('/monitoring/status'),
  getDevices: () => api.get('/monitoring/devices'),
  pingDevice: (id) => api.post(`/monitoring/ping/${id}`),
  pingAll: () => api.post('/monitoring/ping-all'),
  getLogs: (params) => api.get('/monitoring-logs', { params }),
};

export const activityLogService = {
  getLogs: (params) => api.get('/activity-logs', { params }),
};

export default api;

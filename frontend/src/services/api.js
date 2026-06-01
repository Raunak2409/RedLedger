import axios from 'axios';

// The API url is determined by environment configuration, falling back to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const productsApi = {
  create: (data) => api.post('/products', data),
  list: () => api.get('/products'),
  get: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const customersApi = {
  create: (data) => api.post('/customers', data),
  list: () => api.get('/customers'),
  get: (id) => api.get(`/customers/${id}`),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const ordersApi = {
  create: (data) => api.post('/orders', data),
  list: () => api.get('/orders'),
  get: (id) => api.get(`/orders/${id}`),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard'),
};

export default api;

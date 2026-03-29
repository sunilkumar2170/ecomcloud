import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
  
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  register: (data: any) =>
    api.post('/auth/register', data).then(r => r.data),
};

export const dashboardApi = {
  overview: () => api.get('/dashboard/overview').then(r => r.data),
  revenueChart: () => api.get('/dashboard/revenue-chart').then(r => r.data),
  recentOrders: () => api.get('/dashboard/recent-orders').then(r => r.data),
};

export const tenantsApi = {
  list: () => api.get('/tenants').then(r => r.data),
  get: (id: string) => api.get(`/tenants/${id}`).then(r => r.data),
  stats: (id: string) => api.get(`/tenants/${id}/stats`).then(r => r.data),
};

export const productsApi = {
  list: (tenantId: string) => api.get(`/tenants/${tenantId}/products`).then(r => r.data),
  get: (tenantId: string, id: string) => api.get(`/tenants/${tenantId}/products/${id}`).then(r => r.data),
  create: (tenantId: string, data: any) => api.post(`/tenants/${tenantId}/products`, data).then(r => r.data),
  update: (tenantId: string, id: string, data: any) => api.put(`/tenants/${tenantId}/products/${id}`, data).then(r => r.data),
  delete: (tenantId: string, id: string) => api.delete(`/tenants/${tenantId}/products/${id}`).then(r => r.data),
  categories: (tenantId: string) => api.get(`/tenants/${tenantId}/products/categories/list`).then(r => r.data),
  createCategory: (tenantId: string, name: string) => api.post(`/tenants/${tenantId}/products/categories`, { name }).then(r => r.data),
};

export const ordersApi = {
  list: (tenantId: string) => api.get(`/tenants/${tenantId}/orders`).then(r => r.data),
  get: (tenantId: string, id: string) => api.get(`/tenants/${tenantId}/orders/${id}`).then(r => r.data),
  create: (tenantId: string, data: any) => api.post(`/tenants/${tenantId}/orders`, data).then(r => r.data),
  confirm: (tenantId: string, id: string) => api.post(`/tenants/${tenantId}/orders/${id}/confirm`).then(r => r.data),
  updateStatus: (tenantId: string, id: string, status: string) =>
    api.put(`/tenants/${tenantId}/orders/${id}/status`, { status }).then(r => r.data),
};

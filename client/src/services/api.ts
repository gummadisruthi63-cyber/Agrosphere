import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrosphere_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('agrosphere_token');
      localStorage.removeItem('agrosphere_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { email: string; resetCode: string; newPassword: string }) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data)
};

// Dashboard Service
export const dashboardService = {
  getUnifiedDashboard: () => api.get('/dashboard')
};

// Farm Service
export const farmService = {
  getProfile: () => api.get('/farm/profile'),
  updateProfile: (data: any) => api.put('/farm/profile', data),
  getSheds: () => api.get('/farm/sheds'),
  createShed: (data: any) => api.post('/farm/sheds', data),
  updateShed: (id: string, data: any) => api.put(`/farm/sheds/${id}`, data),
  deleteShed: (id: string) => api.delete(`/farm/sheds/${id}`)
};

// Animals Service
export const animalService = {
  getAll: (params?: any) => api.get('/animals', { params }),
  getById: (id: string) => api.get(`/animals/${id}`),
  create: (data: any) => api.post('/animals', data),
  update: (id: string, data: any) => api.put(`/animals/${id}`, data),
  delete: (id: string) => api.delete(`/animals/${id}`),
  getStats: () => api.get('/animals/stats')
};

// Poultry Service
export const poultryService = {
  getAll: (params?: any) => api.get('/poultry', { params }),
  getById: (id: string) => api.get(`/poultry/${id}`),
  create: (data: any) => api.post('/poultry', data),
  update: (id: string, data: any) => api.put(`/poultry/${id}`, data),
  delete: (id: string) => api.delete(`/poultry/${id}`),
  recordMortality: (id: string, count: number, reason?: string) => api.post(`/poultry/${id}/mortality`, { count, reason })
};

// Milk Service
export const milkService = {
  getAll: (params?: any) => api.get('/milk-production', { params }),
  record: (data: any) => api.post('/milk-production', data),
  getStats: () => api.get('/milk-production/stats'),
  delete: (id: string) => api.delete(`/milk-production/${id}`)
};

// Egg Service
export const eggService = {
  getAll: (params?: any) => api.get('/egg-production', { params }),
  record: (data: any) => api.post('/egg-production', data),
  getStats: () => api.get('/egg-production/stats'),
  delete: (id: string) => api.delete(`/egg-production/${id}`)
};

// Feed Service
export const feedService = {
  getAll: (params?: any) => api.get('/feed', { params }),
  create: (data: any) => api.post('/feed', data),
  update: (id: string, data: any) => api.put(`/feed/${id}`, data),
  delete: (id: string) => api.delete(`/feed/${id}`),
  consume: (id: string, consumedQuantity: number, notes?: string) => api.post(`/feed/${id}/consume`, { consumedQuantity, notes }),
  restock: (id: string, data: any) => api.post(`/feed/${id}/restock`, data)
};

// Medicine Service
export const medicineService = {
  getAll: (params?: any) => api.get('/medicines', { params }),
  create: (data: any) => api.post('/medicines', data),
  update: (id: string, data: any) => api.put(`/medicines/${id}`, data),
  delete: (id: string) => api.delete(`/medicines/${id}`),
  getVaccinations: (params?: any) => api.get('/medicines/vaccinations/list', { params }),
  createVaccination: (data: any) => api.post('/medicines/vaccinations/list', data),
  updateVaccination: (id: string, data: any) => api.put(`/medicines/vaccinations/list/${id}`, data),
  getHealthRecords: (params?: any) => api.get('/medicines/health/records', { params }),
  createHealthRecord: (data: any) => api.post('/medicines/health/records', data)
};

// Inventory Service
export const inventoryService = {
  getAll: (params?: any) => api.get('/inventory', { params }),
  create: (data: any) => api.post('/inventory', data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
  adjustStock: (id: string, data: any) => api.post(`/inventory/${id}/adjust`, data)
};

// Sales Service
export const salesService = {
  getAll: (params?: any) => api.get('/sales', { params }),
  getById: (id: string) => api.get(`/sales/${id}`),
  create: (data: any) => api.post('/sales', data),
  update: (id: string, data: any) => api.put(`/sales/${id}`, data),
  delete: (id: string) => api.delete(`/sales/${id}`)
};

// Customers Service
export const customerService = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`)
};

// Expenses Service
export const expenseService = {
  getAll: (params?: any) => api.get('/expenses', { params }),
  create: (data: any) => api.post('/expenses', data),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`)
};

// Employees Service
export const employeeService = {
  getAll: (params?: any) => api.get('/employees', { params }),
  create: (data: any) => api.post('/employees', data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  getAttendance: (params?: any) => api.get('/employees/attendance/records', { params }),
  markAttendance: (data: any) => api.post('/employees/attendance/records', data),
  addTask: (id: string, taskData: any) => api.post(`/employees/${id}/tasks`, taskData),
  toggleTask: (employeeId: string, taskId: string) => api.patch(`/employees/${employeeId}/tasks/${taskId}/toggle`)
};

// Finance Service
export const financeService = {
  getOverview: (year?: number) => api.get('/finance/overview', { params: { year } })
};

// Reports Service
export const reportService = {
  getData: (params: any) => api.get('/reports', { params })
};

// Notifications Service
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id: string) => api.delete(`/notifications/${id}`)
};

// Settings Service
export const settingService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.put('/settings', data),
  changePassword: (data: any) => api.post('/settings/change-password', data),
  resetDemoData: () => api.post('/seed/reset')
};

export default api;

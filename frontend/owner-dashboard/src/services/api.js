import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Menu APIs
export const getMenuItems = async () => {
  try {
    const response = await api.get('/menu');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createMenuItem = async (itemData) => {
  try {
    const response = await api.post('/menu', itemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateMenuItem = async (id, itemData) => {
  try {
    const response = await api.put(`/menu/${id}`, itemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteMenuItem = async (id) => {
  try {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const toggleMenuItemAvailability = async (id) => {
  try {
    const response = await api.patch(`/menu/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Order APIs
export const getOrders = async (filters = {}) => {
  try {
    let query = '';
    if (filters.status) query += `status=${filters.status}&`;
    if (filters.startDate) query += `startDate=${filters.startDate}&`;
    if (filters.endDate) query += `endDate=${filters.endDate}&`;
    const response = await api.get(`/orders?${query}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Analytics APIs
export const getRevenueAnalytics = async (startDate, endDate) => {
  try {
    let query = '';
    if (startDate) query += `startDate=${startDate}&`;
    if (endDate) query += `endDate=${endDate}`;
    const response = await api.get(`/analytics/revenue?${query}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPopularItems = async () => {
  try {
    const response = await api.get('/analytics/popular-items');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPeakHours = async () => {
  try {
    const response = await api.get('/analytics/peak-hours');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTableOrders = async () => {
  try {
    const response = await api.get('/analytics/table-orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Inventory APIs
export const getIngredients = async () => {
  try {
    const response = await api.get('/inventory');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createIngredient = async (data) => {
  try {
    const response = await api.post('/inventory', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateIngredient = async (id, data) => {
  try {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getIngredientAnalytics = async (days = 30) => {
  try {
    const response = await api.get(`/analytics/ingredients?days=${days}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
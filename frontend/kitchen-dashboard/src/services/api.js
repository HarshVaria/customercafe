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
// Auth APIs
export const login = async (credentials) => {
  try {
    console.log('📡 API: Sending login request...');
    console.log('URL:', `${API_BASE_URL}/auth/login`);
    console.log('Credentials:', credentials);
    
    const response = await api.post('/auth/login', credentials);
    
    console.log('📡 API: Login response received:', response.data);
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    console.log('✅ Token saved to localStorage');
    
    return response.data;
  } catch (error) {
    console.error('📡 API: Login failed');
    console.error('Error:', error);
    console.error('Error response:', error.response);
    throw error.response?.data || error.message;
  }
};

// Order APIs
export const getOrders = async (filters = {}) => {
  try {
    let query = '';
    if (filters.status) query += `status=${filters.status}&`;
    const response = await api.get(`/orders?${query}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Inventory APIs for Kitchen Override
export const getIngredients = async () => {
  try {
    const response = await api.get('/inventory');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logStockUsage = async (updates) => {
  try {
    const response = await api.post('/inventory/log-usage', { updates });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
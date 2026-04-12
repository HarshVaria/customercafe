import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Menu APIs
export const getMenuItems = async (category = '') => {
  try {
    const url = category ? `/menu?category=${category}` : '/menu';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Order APIs
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getOrdersByTable = async (tableNumber) => {
  try {
    const response = await api.get(`/orders/table/${tableNumber}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
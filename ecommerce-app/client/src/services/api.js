import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getByVendor: (vendorId) => api.get(`/products/vendor/${vendorId}`),
  create: (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'image') {
        formData.append('image', productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });
    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  update: (productId, productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'image') {
        formData.append('image', productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });
    return api.put(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  delete: (productId) => api.delete(`/products/${productId}`),
  getById: (productId) => api.get(`/products/${productId}`),
};

export default api;

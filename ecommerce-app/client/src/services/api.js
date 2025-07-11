import axios from 'axios';

// Determine the API URL based on environment
const getApiUrl = () => {
  // 1. Check for environment variable first (highest priority)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. In development, use localhost
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:5000/api';
  }

  // 3. In production, determine the correct backend URL
  const { hostname } = window.location;
  
  // If running on localhost in production mode (e.g., local build)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // If running on Render frontend, use Render backend
  if (hostname.includes('onrender.com')) {
    return 'https://ecomstore-7j0x.onrender.com/api';
  }
  
  // Default fallback (should match your production backend URL)
  return 'https://ecomstore-7j0x.onrender.com/api';
};

const API_URL = getApiUrl();
console.log('Using API URL:', API_URL);

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Important for cookies, authorization headers with HTTPS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': window.location.origin,
    'Access-Control-Allow-Credentials': 'true'
  }
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

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Network Error: Please check your internet connection',
        isNetworkError: true
      });
    }
    
    // Handle specific error statuses
    if (error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
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

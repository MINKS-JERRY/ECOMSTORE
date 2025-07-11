import axios from 'axios';

// Always use relative paths for API requests
// This avoids CORS issues in production
const API_BASE_URL = '/api';

console.log('API base URL:', API_BASE_URL);

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Important for cookies, authorization headers with HTTPS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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
    
    // Append all fields to FormData
    formData.append('title', productData.title);
    formData.append('description', productData.description || '');
    formData.append('price', productData.price);
    
    // Handle file upload
    if (productData.image) {
      formData.append('image', productData.image);
    }
    
    console.log('Creating product with data:', {
      title: productData.title,
      description: productData.description,
      price: productData.price,
      hasImage: !!productData.image
    });
    
    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
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

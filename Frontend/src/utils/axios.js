import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/features/authSlice';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://capstone-cta-duyw.vercel.app/api'
  : 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    // Handle file uploads and JSON data
    if (config.data && config.data.image) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      store.dispatch(logout());
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

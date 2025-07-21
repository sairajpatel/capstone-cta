import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/features/authSlice';

// Use environment variable or fallback to the production URL
const API_URL = import.meta.env.VITE_API_URL || 'https://capstone-cta.vercel.app';

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
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
      // Check if it's an organizer route
      if (currentPath.includes('/organizer')) {
        window.location.href = '/organizer/login';
      }
      // Check if it's an admin route
      else if (currentPath.includes('/admin')) {
        window.location.href = '/admin/login';
      }
      // Default to user login
      else if (!currentPath.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

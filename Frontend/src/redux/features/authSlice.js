// redux/features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const getInitialUser = () => {
  const token = localStorage.getItem('token') || Cookies.get('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (!isExpired) {
        return {
          id: decoded.id,
          role: decoded.role,
          name: decoded.name,
          email: decoded.email
        };
      }
      // Clear expired token
      localStorage.removeItem('token');
      Cookies.remove('token');
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('token');
      Cookies.remove('token');
    }
  }
  return null;
};

const initialUser = getInitialUser();
const initialState = {
  token: localStorage.getItem('token') || Cookies.get('token') || null,
  role: initialUser?.role || null,
  isAuthenticated: !!initialUser,
  user: initialUser,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, role, userData } = action.payload;
      // Store token in both localStorage and cookie for redundancy
      localStorage.setItem('token', token);
      Cookies.set('token', token, {
        expires: 7, // 7 days
        secure: true,
        sameSite: 'Strict'
      });
      // Update state
      state.token = token;
      state.role = role;
      state.isAuthenticated = true;
      state.user = userData;
      state.error = null;
    },
    logout: (state) => {
      // Clear storage
      localStorage.removeItem('token');
      Cookies.remove('token');
      // Reset state
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    validateSession: (state) => {
      const token = state.token;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const isExpired = decoded.exp * 1000 < Date.now();
          if (isExpired) {
            // Token expired, logout
            localStorage.removeItem('token');
            Cookies.remove('token');
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
            state.user = null;
          }
        } catch (err) {
          // Invalid token, logout
          localStorage.removeItem('token');
          Cookies.remove('token');
          state.token = null;
          state.role = null;
          state.isAuthenticated = false;
          state.user = null;
        }
      }
    }
  }
});

export const { 
  login, 
  logout, 
  setUser, 
  setError, 
  clearError, 
  setLoading,
  validateSession 
} = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.role;
export const selectToken = (state) => state.auth.token;
export const selectError = (state) => state.auth.error;
export const selectLoading = (state) => state.auth.loading;

export default authSlice.reducer;

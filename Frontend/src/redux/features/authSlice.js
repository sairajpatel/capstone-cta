// redux/features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const getInitialUser = () => {
  const token = Cookies.get('token');
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
      Cookies.remove('token');
    } catch (err) {
      console.error('Invalid token:', err);
      Cookies.remove('token');
    }
  }
  return null;
};

const initialUser = getInitialUser();
const initialState = {
  token: Cookies.get('token') || null,
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
      // Set the token in cookie
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
      // Clear cookie
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
    }
  }
});

export const { login, logout, setUser, setError, clearError, setLoading } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.role;
export const selectToken = (state) => state.auth.token;
export const selectError = (state) => state.auth.error;
export const selectLoading = (state) => state.auth.loading;

export default authSlice.reducer;

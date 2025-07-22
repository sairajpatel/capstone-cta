import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AuthPageProtectWrapper = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    switch (role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'organizer':
        return <Navigate to="/organizer/dashboard" />;
      case 'user':
        return <Navigate to="/user/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

export default AuthPageProtectWrapper; 
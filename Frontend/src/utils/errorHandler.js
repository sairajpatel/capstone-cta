import { toast } from 'react-hot-toast';
import { logout } from '../redux/features/authSlice';

export const handleApiError = (error, dispatch) => {
  console.error('API Error:', error);
  
  if (error.response?.status === 403) {
    const errorMessage = error.response.data.message;
    const status = error.response.data.status;
    
    // Handle deactivated account
    if (status === 'inactive' || status === 'blocked') {
      toast.error(errorMessage);
      // Logout the user and redirect to login
      dispatch(logout());
      window.location.href = '/user/login';
      return true; // Error was handled
    }
  }
  
  return false; // Error was not handled
};

export const checkUserStatus = (error) => {
  return error.response?.status === 403 && 
         (error.response.data.status === 'inactive' || 
          error.response.data.status === 'blocked');
}; 
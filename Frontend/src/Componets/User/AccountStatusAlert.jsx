import React from 'react';
import { useSelector } from 'react-redux';

const AccountStatusAlert = () => {
  const { user } = useSelector((state) => state.auth);

  // Debug: Log user data to see what's available
  console.log('AccountStatusAlert - User data:', user);

  if (!user) {
    return null;
  }

  // If status is not available or is active, don't show alert
  if (!user.status || user.status === 'active') {
    return null;
  }

  const getStatusMessage = () => {
    switch (user.status) {
      case 'inactive':
        return {
          message: 'Your account is currently inactive. Please contact support to reactivate.',
          type: 'warning'
        };
      case 'blocked':
        return {
          message: 'Your account has been blocked. Please contact support.',
          type: 'error'
        };
      default:
        return {
          message: 'Your account has been deactivated.',
          type: 'error'
        };
    }
  };

  const { message, type } = getStatusMessage();
  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-yellow-100';
  const textColor = type === 'error' ? 'text-red-800' : 'text-yellow-800';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-yellow-200';

  return (
    <div className={`${bgColor} border ${borderColor} text-${textColor} px-4 py-3 rounded relative mb-4`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {type === 'error' ? (
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AccountStatusAlert; 
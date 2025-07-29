import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../redux/features/authSlice';
import axios from '../../utils/axios';

const UserProfileInitializer = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && token && user && !user.profileImage && !isLoading) {
        try {
          setIsLoading(true);
          // Fetch user profile to get complete user data including profile image
          const response = await axios.get('/auth/user/profile');
          if (response.data.success) {
            const userData = response.data.data;
            // Update Redux store with complete user data
            dispatch(updateUserProfile({
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              profileImage: userData.profileImage
            }));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Don't show error to user as this is a background operation
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, token, user, dispatch, isLoading]);

  return null; // This component doesn't render anything
};

export default UserProfileInitializer; 
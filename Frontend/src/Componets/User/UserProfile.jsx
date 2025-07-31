import React, { useState, useEffect } from 'react';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';
import { processImageUpload } from '../../utils/cloudinaryUpload';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/features/authSlice';
import TextSizeControls from './TextSizeControls';
import { useSelector } from 'react-redux';
import { store } from '../../redux/store';

const UserProfile = () => {
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    website: '',
    company: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: '',
    pincode: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Change email state
  const [activeTab, setActiveTab] = useState('account-info');
  const [emailData, setEmailData] = useState({
    currentEmail: '',
    newEmail: '',
    password: ''
  });
  const [emailLoading, setEmailLoading] = useState(false);
  
  // Change password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchProfile();
    // Set current email from Redux store
    const state = store.getState();
    if (state.auth.user) {
      setEmailData(prev => ({
        ...prev,
        currentEmail: state.auth.user.email || ''
      }));
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile/me');
      const profile = response.data;
      if (profile) {
        setProfileData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          website: profile.website || '',
          company: profile.company || '',
          phoneNumber: profile.phoneNumber || '',
          address: profile.address || '',
          city: profile.city || '',
          country: profile.country || '',
          pincode: profile.pincode || ''
        });
        if (profile.profileImage) {
          setImagePreview(profile.profileImage);
          console.log('Profile image URL:', profile.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't show error for first load as profile might not exist
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch profile data');
      }
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { base64, error } = await processImageUpload(file);
        if (error) {
          toast.error(error);
          return;
        }
        console.log('Image processed successfully');
        setProfileImage(base64);
        // Create a temporary preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        console.log('Preview URL set:', previewUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to process image');
      }
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      console.log('Preparing image data for upload...');
      
      // Ensure we're sending a proper string
      const imageData = typeof profileImage === 'string' 
        ? profileImage 
        : JSON.stringify(profileImage);

      console.log('Sending image to server...');
      const response = await axios.post('/profile/upload-image', {
        image: imageData
      });
      
      console.log('Server response:', response.data);
      
      if (response.data.success && response.data.imageUrl) {
        setImagePreview(response.data.imageUrl);
        setProfileImage(null); // Clear the selected image
        toast.success('Profile image uploaded successfully');
        
        // Update Redux store with new profile image URL
        dispatch(setUser({
          ...response.data.user,
          profileImage: response.data.imageUrl
        }));
        
        // Refresh profile data to ensure we have the latest image URL
        await fetchProfile();
      } else {
        throw new Error(response.data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to upload profile image');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('/profile/update', profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    });
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailLoading(true);

    try {
      const response = await axios.put('/profile/change-email', emailData);
      
      if (response.data.success) {
        toast.success('Email updated successfully');
        
        // Update Redux store with new user data
        dispatch(setUser(response.data.user));
        
        // Clear form
        setEmailData({
          currentEmail: response.data.user.email,
          newEmail: '',
          password: ''
        });
        
        // Switch back to account info tab
        setActiveTab('account-info');
      }
    } catch (error) {
      console.error('Error changing email:', error);
      toast.error(error.response?.data?.message || 'Failed to change email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);

    try {
      const response = await axios.put('/profile/change-password', passwordData);
      
      if (response.data.success) {
        toast.success('Password updated successfully');
        
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Reset password visibility
        setShowPassword({
          current: false,
          new: false,
          confirm: false
        });
        
        // Switch back to account info tab
        setActiveTab('account-info');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <TextSizeControls />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm">
              <h2 className="px-6 py-4 text-lg font-semibold border-b">Account Settings</h2>
              <div className="flex flex-col">
                <button 
                  onClick={() => setActiveTab('account-info')}
                  className={`px-6 py-3 text-left hover:bg-gray-50 ${
                    activeTab === 'account-info' ? 'bg-gray-100 font-medium' : 'text-gray-600'
                  }`}
                >
                  Account Info
                </button>
                <button 
                  onClick={() => setActiveTab('change-email')}
                  className={`px-6 py-3 text-left hover:bg-gray-50 ${
                    activeTab === 'change-email' ? 'bg-gray-100 font-medium' : 'text-gray-600'
                  }`}
                >
                  Change Email
                </button>
                <button 
                  onClick={() => setActiveTab('change-password')}
                  className={`px-6 py-3 text-left hover:bg-gray-50 ${
                    activeTab === 'change-password' ? 'bg-gray-100 font-medium' : 'text-gray-600'
                  }`}
                >
                  Password
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-4 sm:p-6">
            {activeTab === 'account-info' && (
              <>
                <h1 className="text-xl font-semibold mb-6">Account Information</h1>

                {/* Profile Photo */}
                <div className="mb-8">
                  <h3 className="text-base font-medium mb-4">Profile Photo</h3>
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mb-4">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Error loading image:', e);
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
                          }}
                        />
                      ) : (
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="profile-image"
                      />
                      <label
                        htmlFor="profile-image"
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer"
                      >
                        Choose Photo
                      </label>
                      {profileImage && (
                        <button
                          onClick={handleImageUpload}
                          disabled={loading}
                          className="mt-2 px-4 py-2 bg-[#28264D] text-white rounded-md text-sm hover:bg-opacity-90 disabled:opacity-50"
                        >
                          {loading ? 'Uploading...' : 'Upload Photo'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Information Form */}
                <div>
                  <h3 className="text-base font-medium mb-4">Profile Information</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Website</label>
                        <input
                          type="text"
                          name="website"
                          value={profileData.website}
                          onChange={handleChange}
                          placeholder="Enter website"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Company</label>
                        <input
                          type="text"
                          name="company"
                          value={profileData.company}
                          onChange={handleChange}
                          placeholder="Enter company name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-medium mb-4">Contact Details</h3>
                      <p className="text-sm text-gray-500 mb-4">These details will be used to contact you for ticketing or prizes.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleChange}
                          placeholder="Enter address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={handleChange}
                          placeholder="Enter city"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={profileData.country}
                          onChange={handleChange}
                          placeholder="Enter country"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          value={profileData.pincode}
                          onChange={handleChange}
                          placeholder="Enter pincode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-[#28264D] text-white rounded-lg text-sm hover:bg-opacity-90 disabled:opacity-50 w-full sm:w-auto"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {activeTab === 'change-email' && (
              <div>
                <h1 className="text-xl font-semibold mb-6">Change Email</h1>
                <div className="max-w-md">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-800">
                        Changing your email will update your login credentials. You'll need to use the new email address to sign in.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleChangeEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Current Email</label>
                      <input
                        type="email"
                        name="currentEmail"
                        value={emailData.currentEmail}
                        onChange={handleEmailChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">New Email</label>
                      <input
                        type="email"
                        name="newEmail"
                        value={emailData.newEmail}
                        onChange={handleEmailChange}
                        placeholder="Enter new email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={emailData.password}
                        onChange={handleEmailChange}
                        placeholder="Enter your password to confirm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={emailLoading}
                        className="px-6 py-2 bg-[#28264D] text-white rounded-lg text-sm hover:bg-opacity-90 disabled:opacity-50"
                      >
                        {emailLoading ? 'Updating...' : 'Update Email'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'change-password' && (
              <div>
                <h1 className="text-xl font-semibold mb-6">Change Password</h1>
                <div className="max-w-md">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-sm text-yellow-800">
                        Choose a strong password with at least 6 characters. Your new password should be different from your current password.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter your current password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.current ? (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.new ? (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.confirm ? (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-6 py-2 bg-[#28264D] text-white rounded-lg text-sm hover:bg-opacity-90 disabled:opacity-50"
                      >
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        <UserFooter />
      </div>
    </div>
  );
};

export default UserProfile; 
// Test script to verify profile image functionality
const axios = require('axios');

const testProfileImage = async () => {
  try {
    console.log('Testing profile image functionality...');
    
    // Test login with a user that has a profile image
    const loginResponse = await axios.post('http://localhost:5000/api/auth/user/login', {
      email: 'test@example.com', // Replace with actual test user email
      password: 'password123'    // Replace with actual test user password
    });

    console.log('Login Response:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data.success && loginResponse.data.data.profileImage) {
      console.log('✅ Profile image is included in login response!');
      console.log('Profile Image URL:', loginResponse.data.data.profileImage);
    } else {
      console.log('❌ Profile image not found in login response');
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

// Run the test
testProfileImage(); 
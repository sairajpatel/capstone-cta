const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  toggleEventInterest,
  getInterestedEvents,
  changeEmail,
  changePassword
} = require('../controllers/profileController');

// Get user profile
router.get('/me', protect, getUserProfile);

// Update profile
router.put('/update', protect, updateProfile);

// Upload profile image
router.post('/upload-image', protect, uploadProfileImage);

// Delete profile image
router.delete('/image', protect, deleteProfileImage);

// Change email
router.put('/change-email', protect, changeEmail);

// Change password
router.put('/change-password', protect, changePassword);

// Interest routes
router.post('/toggle-interest', protect, toggleEventInterest);
router.get('/interested-events', protect, getInterestedEvents);

module.exports = router; 
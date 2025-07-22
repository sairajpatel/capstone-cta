const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  toggleEventInterest,
  getInterestedEvents
} = require('../controllers/profileController');

// Get user profile
router.get('/me', protect, getUserProfile);

// Update profile
router.put('/update', protect, updateProfile);

// Upload profile image
router.post('/upload-image', protect, uploadProfileImage);

// Delete profile image
router.delete('/image', protect, deleteProfileImage);

// Interest routes
router.post('/toggle-interest', protect, toggleEventInterest);
router.get('/interested-events', protect, getInterestedEvents);

module.exports = router; 
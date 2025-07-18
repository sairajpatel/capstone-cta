const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage
} = require('../controllers/profileController');

// Get user profile
router.get('/me', protect, getUserProfile);

// Update profile
router.put('/update', protect, updateProfile);

// Upload profile image
router.post('/upload-image', protect, uploadProfileImage);

// Delete profile image
router.delete('/image', protect, deleteProfileImage);

module.exports = router; 
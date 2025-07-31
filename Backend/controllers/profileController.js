const mongoose = require('mongoose');
const UserProfile = require('../models/userProfileModel');
const cloudinary = require('../config/cloudinary');
const User = require('../models/userModel'); // Added for toggleEventInterest and getInterestedEvents
const { Event } = require('../models/eventModel'); // Fixed Event model import
const bcrypt = require('bcryptjs');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Create or update user profile
const updateProfile = async (req, res) => {
  try {
    const profileData = {
      ...req.body,
      user: req.user._id
    };

    let profile = await UserProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      profile = await UserProfile.findOneAndUpdate(
        { user: req.user._id },
        profileData,
        { new: true }
      );
    } else {
      // Create new profile
      profile = await UserProfile.create(profileData);
    }

    res.json(profile);
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    console.log('Starting image upload process');
    
    if (!req.body.image) {
      console.log('No image provided in request body');
      return res.status(400).json({ message: 'No image provided' });
    }

    // Find or create profile
    let profile = await UserProfile.findOne({ user: req.user._id });
    
    // Delete old image from Cloudinary if it exists
    if (profile && profile.profileImage) {
      try {
        // Extract public_id from the URL
        const urlParts = profile.profileImage.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `profile-images/${publicIdWithExtension.split('.')[0]}`;
        
        console.log('Deleting old image with public_id:', publicId);
        await cloudinary.uploader.destroy(publicId);
        console.log('Old image deleted from Cloudinary');
      } catch (error) {
        console.log('Error deleting old image from Cloudinary:', error);
      }
    }

    // Upload new image to Cloudinary
    console.log('Uploading to Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(req.body.image, {
      folder: 'profile-images',
      width: 500,
      height: 500,
      crop: "fill",
      gravity: "face"
    });

    console.log('Cloudinary upload result:', {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('Failed to get secure URL from Cloudinary');
    }

    // Update or create profile with new image URL
    if (profile) {
      profile.profileImage = uploadResult.secure_url;
      await profile.save();
    } else {
      profile = await UserProfile.create({
        user: req.user._id,
        profileImage: uploadResult.secure_url
      });
    }

    // Include user data in response
    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profileImage: uploadResult.secure_url
    };

    console.log('Profile updated with new image URL:', uploadResult.secure_url);
    res.json({ 
      success: true,
      message: 'Profile image uploaded successfully', 
      imageUrl: uploadResult.secure_url,
      user: userData
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error uploading profile image', 
      error: error.message,
      details: error.stack 
    });
  }
};

// Delete profile image
const deleteProfileImage = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    
    if (!profile || !profile.profileImage) {
      return res.status(404).json({ message: 'No profile image found' });
    }

    // Delete image from Cloudinary
    const urlParts = profile.profileImage.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = `profile-images/${publicIdWithExtension.split('.')[0]}`;
    
    await cloudinary.uploader.destroy(publicId);

    // Clear image URL in profile
    profile.profileImage = '';
    await profile.save();

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProfileImage:', error);
    res.status(500).json({ message: 'Error deleting profile image', error: error.message });
  }
};

// Toggle interest in an event
const toggleEventInterest = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;

    // Validate eventId
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    // Validate if eventId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize interestedEvents array if it doesn't exist
    if (!user.interestedEvents) {
      user.interestedEvents = [];
    }

    // Convert eventId to ObjectId for comparison
    const eventObjectId = new mongoose.Types.ObjectId(eventId);
    
    // Check if event is already in interests
    const eventIndex = user.interestedEvents.findIndex(id => id.equals(eventObjectId));
    const wasInterested = eventIndex > -1;

    if (wasInterested) {
      // Remove interest
      user.interestedEvents.splice(eventIndex, 1);
      await user.save();
      res.json({ 
        success: true,
        message: 'Event removed from interests', 
        isInterested: false,
        eventId: eventId
      });
    } else {
      // Add interest
      user.interestedEvents.push(eventObjectId);
      await user.save();
      res.json({ 
        success: true,
        message: 'Event marked as interested', 
        isInterested: true,
        eventId: eventId
      });
    }
  } catch (error) {
    console.error('Toggle interest error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating interest status',
      error: error.message 
    });
  }
};

// Get interested events
const getInterestedEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find user and populate interestedEvents with event details
    const user = await User.findById(userId).populate({
      path: 'interestedEvents',
      model: 'Event',
      select: 'title bannerImage startDate venue location ticketing category organizer status',
      populate: {
        path: 'organizer',
        select: 'name organization'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out any null or undefined events
    const events = (user.interestedEvents || []).filter(event => event);

    res.json({ 
      success: true,
      events,
      count: events.length 
    });
  } catch (error) {
    console.error('Get interested events error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching interested events',
      error: error.message 
    });
  }
};

// Change email functionality
const changeEmail = async (req, res) => {
  try {
    const { currentEmail, newEmail, password } = req.body;

    // Validate required fields
    if (!currentEmail || !newEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Current email, new email, and password are required'
      });
    }

    // Check if current email matches user's email
    if (currentEmail !== req.user.email) {
      return res.status(400).json({
        success: false,
        message: 'Current email does not match your account email'
      });
    }

    // Validate new email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check if new email is different from current email
    if (currentEmail === newEmail) {
      return res.status(400).json({
        success: false,
        message: 'New email must be different from current email'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, req.user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Check if new email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already in use'
      });
    }

    // Update user's email
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { email: newEmail },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Email updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Error in changeEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email',
      error: error.message
    });
  }
};

// Change password functionality
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirm password are required'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current password
    const isNewPasswordSame = await bcrypt.compare(newPassword, req.user.password);
    if (isNewPasswordSame) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { password: hashedPassword },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Password updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  toggleEventInterest,
  getInterestedEvents,
  changeEmail,
  changePassword
}; 
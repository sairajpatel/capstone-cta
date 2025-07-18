const UserProfile = require('../models/userProfileModel');
const cloudinary = require('../config/cloudinary');

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

    console.log('Profile updated with new image URL:', uploadResult.secure_url);
    res.json({ 
      success: true,
      message: 'Profile image uploaded successfully', 
      imageUrl: uploadResult.secure_url 
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

module.exports = {
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage
}; 
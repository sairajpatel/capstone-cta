const Admin = require('../models/adminModel');
const Organizer = require('../models/organizerModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Admin Controllers
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin and include password
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = generateToken(admin._id, 'admin');

        // Set cookie
  res.cookie('token', token);

        res.status(200).json({
            success: true,
            data: {
                _id: admin._id,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.adminLogout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);
        res.json({
            success: true,
            data: {
                _id: admin._id,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Organizer Controllers
exports.registerOrganizer = async (req, res) => {
    try {
        const { name, email, password, phone, organization } = req.body;

        // Check if organizer exists
        const organizerExists = await Organizer.findOne({ email });

        if (organizerExists) {
            return res.status(400).json({
                success: false,
                message: 'Organizer already exists'
            });
        }

        // Create organizer
        const organizer = await Organizer.create({
            name,
            email,
            password,
            phone,
            organization
        });

        // Create token
        const token = generateToken(organizer._id, 'organizer');

        // Set cookie
        res.cookie('token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            success: true,
            data: {
                _id: organizer._id,
                name: organizer.name,
                email: organizer.email,
                phone: organizer.phone,
                organization: organizer.organization,
                isVerified: organizer.isVerified,
                role: organizer.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.organizerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find organizer and include password
        const organizer = await Organizer.findOne({ email }).select('+password');

        if (!organizer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await organizer.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = generateToken(organizer._id, 'organizer');

        // Set cookie with appropriate settings for cross-origin
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/'
        });

        res.json({
            success: true,
            token, // Include token in response body
            data: {
                _id: organizer._id,
                name: organizer.name,
                email: organizer.email,
                phone: organizer.phone,
                organization: organizer.organization,
                isVerified: organizer.isVerified,
                role: organizer.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.organizerLogout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

// User Controllers
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        // Create token
        const token = generateToken(user._id, 'user');

        // Set cookie with appropriate settings for cross-origin
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/'
        });

        res.status(200).json({
            success: true,
            token,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Get user profile to include profile image
        const UserProfile = require('../models/userProfileModel');
        const userProfile = await UserProfile.findOne({ user: user._id });

        // Create token
        const token = generateToken(user._id, 'user');

        // Set cookie with appropriate settings for cross-origin
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Always use secure in production
            sameSite: 'None', // Required for cross-origin
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/'
        });

        // Send response with profile image if available
        res.status(200).json({
            success: true,
            token,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: 'user',
                profileImage: userProfile?.profileImage || null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
};

exports.userLogout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user profile to include profile image
        const UserProfile = require('../models/userProfileModel');
        const userProfile = await UserProfile.findOne({ user: req.user._id });

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: 'user',
                profileImage: userProfile?.profileImage || null
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
};

exports.getOrganizerProfile = async (req, res) => {
    try {
        const organizer = await Organizer.findById(req.organizer._id);
        res.json({
            success: true,
            data: {
                _id: organizer._id,
                name: organizer.name,
                email: organizer.email,
                phone: organizer.phone,
                organization: organizer.organization,
                isVerified: organizer.isVerified,
                role: organizer.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 
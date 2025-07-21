const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const { Event } = require('../models/eventModel'); // Fix the import to destructure Event
const Organizer = require('../models/organizerModel');
const Booking = require('../models/bookingModel');
const cloudinary = require('../config/cloudinary');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Register admin
exports.registerAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if admin exists
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        // Create admin
        const admin = await Admin.create({
            email,
            password
        });

        const token = generateToken(admin._id, 'admin');
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            success: true,
            data: {
                _id: admin._id,
                email: admin.email,
                role: 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin login
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin || !(await admin.matchPassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(admin._id, 'admin');
        
        // Set cookie for additional security
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Send response with token
        res.status(200).json({
            success: true,
            token: token,
            data: {
                _id: admin._id,
                email: admin.email,
                role: 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin logout
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// Get admin profile
exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const admin = await Admin.findById(req.admin._id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (name) admin.name = name;
        if (email) admin.email = email;
        if (phone) admin.phone = phone;

        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: admin
        });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Upload admin profile photo
exports.uploadProfilePhoto = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Delete old image from Cloudinary if it exists
        if (admin.profilePhoto && admin.profilePhoto.includes('cloudinary')) {
            try {
                const publicId = admin.profilePhoto.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`admin-profiles/${publicId}`);
            } catch (error) {
                console.log('Error deleting old profile photo:', error);
            }
        }

        // Upload new image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.body.image, {
            folder: 'admin-profiles',
            width: 500,
            height: 500,
            crop: "fill",
            quality: "auto"
        });

        if (!uploadResult || !uploadResult.secure_url) {
            throw new Error('Failed to upload image to Cloudinary');
        }

        // Update admin profile with new photo URL
        admin.profilePhoto = uploadResult.secure_url;
        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully',
            data: {
                profilePhoto: uploadResult.secure_url
            }
        });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        // Get total events
        const totalEvents = await Event.countDocuments();
        
        // Get active users
        const activeUsers = await User.countDocuments({ status: 'active' });
        
        // Get total organizers
        const totalOrganizers = await Organizer.countDocuments();
        
        // Calculate total revenue and tickets sold from confirmed bookings
        const bookings = await Booking.find({ status: 'confirmed' });
        
        let totalRevenue = 0;
        let totalTicketsSold = 0;
        
        bookings.forEach(booking => {
            totalRevenue += booking.totalAmount;
            totalTicketsSold += booking.quantity;
        });

        // Send response with proper structure
        res.status(200).json({
            success: true,
            data: {
                events: {
                    total: totalEvents,
                    ticketsSold: totalTicketsSold
                },
                users: {
                    total: activeUsers,
                    organizers: totalOrganizers
                },
                revenue: totalRevenue
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user stats
exports.getUserStats = async (req, res) => {
    try {
        const activeUsers = await User.countDocuments();
        const totalOrganizers = await Organizer.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                active: activeUsers,
                organizers: totalOrganizers,
                total: activeUsers + totalOrganizers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get revenue stats
exports.getRevenueStats = async (req, res) => {
    try {
        const bookings = await Booking.find({ 
            status: 'confirmed',
            createdAt: { 
                $gte: new Date(new Date().getFullYear(), 0, 1) // Start of current year
            }
        }).sort('createdAt');

        // Calculate monthly revenue from bookings
        const monthlyRevenue = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        bookings.forEach(booking => {
            const month = months[new Date(booking.createdAt).getMonth()];
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + booking.totalAmount;
        });

        // Convert to array format for frontend
        const monthly = months.map(month => ({
            month,
            value: monthlyRevenue[month] || 0
        }));

        // Calculate total revenue
        const total = Object.values(monthlyRevenue).reduce((acc, curr) => acc + curr, 0);

        res.status(200).json({
            success: true,
            data: {
                monthly,
                total
            }
        });
    } catch (error) {
        console.error('Revenue Stats Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 
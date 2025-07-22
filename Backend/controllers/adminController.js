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
exports.getProfile = async (req, res) => {
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
        console.error('Error getting admin profile:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, bio } = req.body;
        const admin = await Admin.findById(req.admin._id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (name) admin.name = name;
        if (phone) admin.phone = phone;
        if (bio) admin.bio = bio;

        await admin.save();

        res.status(200).json({
            success: true,
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

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
    try {
        console.log('Starting profile image upload...');
        
        if (!req.body.image) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an image'
            });
        }

        const admin = await Admin.findById(req.admin._id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Delete old image from Cloudinary if it exists
        if (admin.profileImage) {
            try {
                const urlParts = admin.profileImage.split('/');
                const publicIdWithExtension = urlParts[urlParts.length - 1];
                const publicId = `admin-profiles/${publicIdWithExtension.split('.')[0]}`;
                console.log('Attempting to delete old image:', publicId);
                await cloudinary.uploader.destroy(publicId);
                console.log('Successfully deleted old image');
            } catch (error) {
                console.error('Error deleting old image:', error);
                // Continue with upload even if delete fails
            }
        }

        // Upload new image to Cloudinary
        console.log('Uploading new image to Cloudinary...');
        const uploadResult = await cloudinary.uploader.upload(req.body.image, {
            folder: 'admin-profiles',
            width: 500,
            height: 500,
            crop: "fill",
            gravity: "face"
        });

        console.log('Upload result:', {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        });

        if (!uploadResult || !uploadResult.secure_url) {
            throw new Error('Failed to upload image to Cloudinary');
        }

        // Update admin profile with new image URL
        admin.profileImage = uploadResult.secure_url;
        await admin.save();

        res.status(200).json({
            success: true,
            data: {
                imageUrl: uploadResult.secure_url,
                admin: admin
            }
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading profile image',
            error: error.message
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

// Get all users (including organizers)
exports.getAllUsers = async (req, res) => {
    try {
        // Get users and organizers separately
        const users = await User.find().select('name email role status lastLogin');
        const organizers = await Organizer.find().select('name email organization status lastLogin');

        // Format organizers to match user structure
        const formattedOrganizers = organizers.map(org => ({
            name: org.name,
            email: org.email,
            role: 'Organizer',
            status: org.status ? org.status.charAt(0).toUpperCase() + org.status.slice(1) : 'Active', // Normalize status
            lastLogin: org.lastLogin,
            _id: org._id,
            organization: org.organization,
            userType: 'Organizer'
        }));

        // Format users
        const formattedUsers = users.map(user => ({
            name: user.name,
            email: user.email,
            role: 'User',
            status: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active', // Normalize status
            lastLogin: user.lastLogin,
            _id: user._id,
            userType: 'User'
        }));

        // Combine and sort by lastLogin
        const allUsers = [...formattedOrganizers, ...formattedUsers]
            .sort((a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0));

        res.status(200).json({
            success: true,
            data: allUsers
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, userType } = req.body;

        console.log('Updating status:', { userId, status, userType });

        // Normalize status to lowercase for storage
        const normalizedStatus = status.toLowerCase();

        let user;
        if (userType === 'Organizer') {
            user = await Organizer.findByIdAndUpdate(
                userId,
                { status: normalizedStatus },
                { new: true }
            );
        } else {
            user = await User.findByIdAndUpdate(
                userId,
                { status: normalizedStatus },
                { new: true }
            );
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Format response with capitalized status
        const response = {
            ...user.toObject(),
            status: user.status.charAt(0).toUpperCase() + user.status.slice(1)
        };

        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error in updateUserStatus:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { userId, userType } = req.body;

        let user;
        if (userType === 'Organizer') {
            user = await Organizer.findByIdAndDelete(userId);
        } else {
            user = await User.findByIdAndDelete(userId);
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 

// Get user details
exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        // Try to find in User collection first
        let user = await User.findById(userId);
        let userType = 'User';

        // If not found in User collection, try Organizer collection
        if (!user) {
            user = await Organizer.findById(userId);
            userType = 'Organizer';
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Format the response
        const formattedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: userType,
            status: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active',
            lastLogin: user.lastLogin,
            userType,
            ...(userType === 'Organizer' && { organization: user.organization })
        };

        res.status(200).json({
            success: true,
            data: formattedUser
        });
    } catch (error) {
        console.error('Error in getUserDetails:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 

// Get ticket statistics
exports.getTicketStats = async (req, res) => {
    try {
        const Booking = require('../models/bookingModel');
        const Event = require('../models/eventModel');

        // Get all bookings with event details
        const bookings = await Booking.find()
            .populate('event', 'title category');

        // Calculate total tickets and revenue
        let totalTickets = 0;
        let totalRevenue = 0;
        const categoryMap = new Map();

        // Process each booking
        bookings.forEach(booking => {
            if (!booking.event) return; // Skip if event is deleted

            const category = booking.event.category;
            totalTickets += booking.quantity;
            totalRevenue += booking.totalAmount;

            // Update category statistics
            if (!categoryMap.has(category)) {
                categoryMap.set(category, {
                    category,
                    ticketsSold: 0,
                    revenue: 0
                });
            }
            const categoryStats = categoryMap.get(category);
            categoryStats.ticketsSold += booking.quantity;
            categoryStats.revenue += booking.totalAmount;
        });

        // Get recent sales (last 10 bookings)
        const recentSales = await Booking.find()
            .populate('event', 'title category')
            .sort({ createdAt: -1 })
            .limit(10)
            .then(bookings => bookings
                .filter(booking => booking.event) // Filter out bookings with deleted events
                .map(booking => ({
                    eventTitle: booking.event.title,
                    category: booking.event.category,
                    ticketsSold: booking.quantity,
                    revenue: booking.totalAmount,
                    date: booking.createdAt
                }))
            );

        res.status(200).json({
            success: true,
            data: {
                totalTickets,
                totalRevenue,
                categoryStats: Array.from(categoryMap.values()),
                recentSales
            }
        });
    } catch (error) {
        console.error('Error in getTicketStats:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 
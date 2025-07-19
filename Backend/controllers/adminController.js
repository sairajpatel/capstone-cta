const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const { Event } = require('../models/eventModel'); // Fix the import to destructure Event
const Organizer = require('../models/organizerModel');
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
        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndUpdate(req.admin._id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalEvents = await Event.countDocuments();
        const activeUsers = await User.countDocuments();
        const totalOrganizers = await Organizer.countDocuments();
        
        // Calculate total revenue and tickets sold
        const events = await Event.find({
            status: 'published',
            eventType: 'ticketed'
        }).select('ticketing');
        
        let totalRevenue = 0;
        let totalTicketsSold = 0;
        
        events.forEach(event => {
            if (event.ticketing && event.ticketing.length > 0) {
                event.ticketing.forEach(ticket => {
                    // Assuming sold tickets is the difference between total and available
                    const soldTickets = ticket.quantity || 0;
                    totalTicketsSold += soldTickets;
                    totalRevenue += soldTickets * ticket.price;
                });
            }
        });

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
        const events = await Event.find({
            status: 'published',
            eventType: 'ticketed'
        }).select('ticketing createdAt');

        // Calculate monthly revenue
        const monthlyRevenue = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        events.forEach(event => {
            const month = months[new Date(event.createdAt).getMonth()];
            let eventRevenue = 0;

            if (event.ticketing && event.ticketing.length > 0) {
                event.ticketing.forEach(ticket => {
                    // Assuming sold tickets is the difference between total and available
                    const soldTickets = ticket.quantity || 0;
                    eventRevenue += soldTickets * ticket.price;
                });
            }
            
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + eventRevenue;
        });

        // Convert to array format for frontend
        const monthly = Object.entries(monthlyRevenue).map(([month, value]) => ({
            month,
            value
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
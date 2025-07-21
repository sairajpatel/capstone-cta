const { Event, EVENT_CATEGORIES } = require('../models/eventModel');
const cloudinary = require('../config/cloudinary');

// Get Event Categories
exports.getEventCategories = async (req, res) => {
    try {
        const categories = Object.entries(EVENT_CATEGORIES).map(([key, value]) => ({
            value: value,
            label: value.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ')
        }));

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Event - Step 1 (Basic Details)
exports.createEventBasic = async (req, res) => {
    try {
        if (!req.user || req.userRole !== 'organizer') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to create events'
            });
        }

        const { title, category, scheduleType, startDate, startTime, endTime, location, description } = req.body;

        const event = await Event.create({
            title,
            category,
            scheduleType,
            startDate,
            startTime,
            endTime,
            location,
            description,
            organizer: req.user._id,
            status: 'draft'
        });

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Event Banner - Step 2
exports.updateEventBanner = async (req, res) => {
    try {
        if (!req.user || req.userRole !== 'organizer') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update events'
            });
        }

        if (!req.body.bannerImage) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a banner image'
            });
        }

        const event = await Event.findOne({ _id: req.params.eventId, organizer: req.user._id });
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or not authorized'
            });
        }

        // Delete old image from Cloudinary if it exists
        if (event.bannerImage && event.bannerImage.includes('cloudinary')) {
            try {
                const urlParts = event.bannerImage.split('/');
                const publicIdWithExtension = urlParts[urlParts.length - 1];
                const publicId = `event-banners/${publicIdWithExtension.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.log('Error deleting old banner from Cloudinary:', error);
            }
        }

        // Upload new image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.body.bannerImage, {
            folder: 'event-banners',
            width: 1920,
            height: 1080,
            crop: "fill",
            quality: "auto"
        });

        if (!uploadResult || !uploadResult.secure_url) {
            throw new Error('Failed to get secure URL from Cloudinary');
        }

        // Update event with new banner URL
        event.bannerImage = uploadResult.secure_url;
        await event.save();

        res.status(200).json({
            success: true,
            data: {
                bannerImage: uploadResult.secure_url
            }
        });
    } catch (error) {
        console.error('Error in updateEventBanner:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Event Ticketing - Step 3
exports.updateEventTicketing = async (req, res) => {
    try {
        if (!req.user || req.userRole !== 'organizer') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update events'
            });
        }

        const { ticketing, eventType } = req.body;
        const event = await Event.findOne({ _id: req.params.eventId, organizer: req.user._id });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or not authorized'
            });
        }

        event.ticketing = ticketing;
        event.eventType = eventType;
        await event.save();

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error updating event ticketing:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Publish Event - Step 4
exports.publishEvent = async (req, res) => {
    try {
        if (!req.user || req.userRole !== 'organizer') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to publish events'
            });
        }

        const event = await Event.findOne({ _id: req.params.eventId, organizer: req.user._id });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or not authorized'
            });
        }

        // Validate all required fields are present
        if (!event.title || !event.bannerImage || !event.ticketing) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all event details before publishing'
            });
        }

        event.status = 'published';
        await event.save();

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error publishing event:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Event Details
exports.getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId)
            .populate('organizer', 'name organization');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Organizer's Events
exports.getOrganizerEvents = async (req, res) => {
    try {
        if (!req.user || req.userRole !== 'organizer') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        const events = await Event.find({ organizer: req.user._id })
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching organizer events:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Popular Events
exports.getPopularEvents = async (req, res) => {
    try {
        console.log('Fetching popular events...');

        // First check if we have any events at all
        const totalEvents = await Event.countDocuments();
        console.log('Total events in database:', totalEvents);

        // Check published events
        const publishedEvents = await Event.countDocuments({ status: 'published' });
        console.log('Total published events:', publishedEvents);
        
        // Find all published events
        const events = await Event.find({ 
            status: 'published'
        })
        .populate({
            path: 'organizer',
            select: 'name organization'
        })
        .sort('-createdAt')
        .limit(6)
        .lean();

        console.log('Found events:', JSON.stringify(events, null, 2));

        res.status(200).json({
            success: true,
            data: events || []
        });
    } catch (error) {
        console.error('Error in getPopularEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching popular events',
            error: error.message,
            stack: error.stack
        });
    }
};

// Get Events by Category
exports.getEventsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const events = await Event.find({ 
            status: 'published',
            category,
            startDate: { $gte: new Date() }
        })
        .populate('organizer', 'name organization')
        .sort('startDate')
        .limit(6);

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search Events
exports.searchEvents = async (req, res) => {
    try {
        const { query } = req.query;
        const events = await Event.find({
            status: 'published',
            startDate: { $gte: new Date() },
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('organizer', 'name organization')
        .sort('startDate')
        .limit(10);

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create test event (temporary function for debugging)
exports.createTestEvent = async (req, res) => {
    try {
        // First create a test organizer if none exists
        const Organizer = require('../models/organizerModel');
        let organizer = await Organizer.findOne({ email: 'test@example.com' });
        
        if (!organizer) {
            organizer = await Organizer.create({
                name: 'Test Organizer',
                email: 'test@example.com',
                password: 'password123',
                phone: '1234567890',
                organization: 'Test Organization'
            });
        }

        // Create a test event
        const event = await Event.create({
            title: 'Test Event',
            organizer: organizer._id,
            category: 'WORKSHOP',
            scheduleType: 'single',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            startTime: '10:00',
            endTime: '12:00',
            location: 'Test Location',
            description: 'This is a test event',
            status: 'published',
            eventType: 'free'
        });

        await event.populate('organizer', 'name organization');

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error creating test event:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating test event',
            error: error.message
        });
    }
};

// Get All Events
exports.getAllEvents = async (req, res) => {
    try {
        console.log('getAllEvents called');
        console.log('Query params:', req.query);
        
        const query = { status: 'published' };
        
        // Apply category filter
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Apply price filter
        if (req.query.priceRange) {
            switch (req.query.priceRange) {
                case 'free':
                    query.eventType = 'free';
                    break;
                case 'under25':
                    query.eventType = 'ticketed';
                    query['ticketing'] = {
                        $elemMatch: {
                            price: { $lt: 25 }
                        }
                    };
                    break;
                case '25-50':
                    query.eventType = 'ticketed';
                    query['ticketing'] = {
                        $elemMatch: {
                            price: { $gte: 25, $lte: 50 }
                        }
                    };
                    break;
                case 'above50':
                    query.eventType = 'ticketed';
                    query['ticketing'] = {
                        $elemMatch: {
                            price: { $gt: 50 }
                        }
                    };
                    break;
            }
        }

        // Apply date filter
        if (req.query.dateRange) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            switch (req.query.dateRange) {
                case 'today':
                    query.startDate = {
                        $gte: today,
                        $lt: tomorrow
                    };
                    break;
                case 'tomorrow':
                    query.startDate = {
                        $gte: tomorrow,
                        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
                    };
                    break;
                case 'weekend':
                    const friday = new Date(today);
                    friday.setDate(friday.getDate() + (5 - friday.getDay()));
                    const monday = new Date(friday);
                    monday.setDate(monday.getDate() + 3);
                    query.startDate = {
                        $gte: friday,
                        $lt: monday
                    };
                    break;
                case 'week':
                    query.startDate = {
                        $gte: today,
                        $lt: nextWeek
                    };
                    break;
                case 'month':
                    query.startDate = {
                        $gte: today,
                        $lt: nextMonth
                    };
                    break;
            }
        }

        console.log('MongoDB query:', JSON.stringify(query, null, 2));

        // Now get the filtered events
        const events = await Event.find(query)
            .populate('organizer', 'name organization')
            .sort({ startDate: 1 });

        console.log(`Found ${events.length} events matching the criteria`);

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error in getAllEvents:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 

exports.getUpcomingEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = await Event.find({
            status: 'published',
            startDate: { $gte: today }
        })
        .sort({ startDate: 1 })
        .limit(5)
        .select('title startDate startTime location bannerImage');

        res.status(200).json({
            success: true,
            data: upcomingEvents
        });
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 

exports.getAdminUpcomingEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const events = await Event.find({
            startDate: { $gte: today }
        })
        .sort({ startDate: 1 })
        .select('title status startDate bannerImage');

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAdminPastEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const events = await Event.find({
            startDate: { $lt: today }
        })
        .sort({ startDate: -1 })
        .select('title status startDate bannerImage');

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching past events:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 

// Edit Event
exports.editEvent = async (req, res) => {
    try {
        if (!req.user || req.userRole !== 'organizer') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to edit events'
            });
        }

        const { 
            title, 
            category, 
            scheduleType, 
            startDate, 
            startTime, 
            endTime, 
            location, 
            description,
            eventType,
            ticketing 
        } = req.body;

        // Find event and check ownership
        const event = await Event.findOne({ _id: req.params.eventId, organizer: req.user._id });
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or not authorized'
            });
        }

        // Only allow editing if event is in draft status or if only updating certain fields
        if (event.status !== 'draft' && !['title', 'description', 'location'].includes(Object.keys(req.body)[0])) {
            return res.status(400).json({
                success: false,
                message: 'Published events can only have title, description, and location updated'
            });
        }

        // Update fields
        const updateFields = {
            title: title || event.title,
            category: category || event.category,
            scheduleType: scheduleType || event.scheduleType,
            startDate: startDate || event.startDate,
            startTime: startTime || event.startTime,
            endTime: endTime || event.endTime,
            location: location || event.location,
            description: description || event.description
        };

        // Only update ticketing if event is in draft status
        if (event.status === 'draft') {
            if (eventType) updateFields.eventType = eventType;
            if (ticketing) updateFields.ticketing = ticketing;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.eventId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).populate('organizer', 'name organization');

        res.status(200).json({
            success: true,
            data: updatedEvent
        });
    } catch (error) {
        console.error('Error editing event:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Event for Editing
exports.getEventForEditing = async (req, res) => {
    try {
        if (!req.user || req.userRole !== 'organizer') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to edit events'
            });
        }

        const event = await Event.findOne({ 
            _id: req.params.eventId, 
            organizer: req.user._id 
        }).populate('organizer', 'name organization');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or not authorized'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error fetching event for editing:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 
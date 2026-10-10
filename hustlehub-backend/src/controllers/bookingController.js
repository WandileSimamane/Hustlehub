const Booking = require('../models/bookingModel');
const Gig = require('../models/gigModel');
const Transaction = require('../models/transactionModel.js');

// Client creates a booking for a gig (no transaction yet: that happens on confirmation)
exports.createBooking = async (req, res, next) => {
    try {
        const { gigId } = req.body;
        const clientId = req.user.id || req.user._id;

        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ message: 'Gig not found' });
        }

        // Support whatever field name your Gig model uses for the owner/freelancer
        const freelancerId = gig.owner || gig.freelancer || gig.user;
        if (!freelancerId) {
            return res.status(400).json({ message: 'This gig has no assigned freelancer/owner' });
        }

        const booking = await Booking.create({
            gig: gigId,
            client: clientId,
            freelancer: freelancerId,
            status: 'Pending'
        });

        res.status(201).json({
            message: 'Booking created successfully',
            booking
        });
    } catch (error) {
        next(error);
    }
};

// Get bookings based on user role (Admin gets all system bookings)
exports.getBookings = async (req, res, next) => {
    try {
        let query = {};
        const userId = req.user.id || req.user._id;

        if (req.user.role === 'Client') {
            query.client = userId;
        } else if (req.user.role === 'Freelancer') {
            query.freelancer = userId;
        }
        // If role is 'Admin', query remains empty ({}), fetching ALL bookings in the system

        const bookings = await Booking.find(query)
            .populate('gig')
            .populate('client', 'name email')
            .populate('freelancer', 'name email');

        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};

// Freelancer updates status (Confirm / Decline)
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Confirmed' or 'Declined'
        const userId = req.user.id || req.user._id;

        if (!['Confirmed', 'Declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only the freelancer who owns this booking (or an Admin) may change it
        if (req.user.role !== 'Admin' && booking.freelancer.toString() !== String(userId)) {
            return res.status(403).json({ message: 'You can only update your own bookings' });
        }

        booking.status = status;
        await booking.save();

        if (status === 'Confirmed') {
            // Create the transaction once per booking (guards against double clicks)
            const existing = await Transaction.findOne({ booking: booking._id });
            if (!existing) {
                const gig = await Gig.findById(booking.gig);
                await Transaction.create({
                    booking: booking._id,
                    client: booking.client,
                    freelancer: booking.freelancer,
                    gig: booking.gig,
                    amount: gig ? gig.price || 0 : 0
                });
            }
        } else {
            // Declined: make sure no income is recorded for this booking
            await Transaction.deleteOne({ booking: booking._id });
        }

        res.status(200).json({ message: `Booking status updated to ${status}`, booking });
    } catch (error) {
        next(error);
    }
};
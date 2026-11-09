 /*
 * Title: winston
 * Author: winstonjs
 * Date: Jun 12, 2024
 * Availability: https://github.com/winstonjs/winston
 * Accessed: November 9, 2026
 */
const Booking = require('../models/bookingModel');
const Gig = require('../models/gigModel');
const Transaction = require('../models/transactionModel.js');
const logger = require('../utils/logger'); // Inject logger

// Client creates a booking for a gig (no transaction yet: that happens on confirmation)
exports.createBooking = async (req, res, next) => {
    try {
        const { gigId } = req.body;
        const safeGigId = String(gigId); //explicitly cast to string
        const clientId = String(req.user.id || req.user._id);

        // Pass the sanitized variable to the database query
        const gig = await Gig.findById(safeGigId);
        if (!gig) {
            return res.status(404).json({ message: 'Gig not found' });
        }

        const freelancerId = String(gig.owner || gig.freelancer || gig.user);
        if (!freelancerId || freelancerId === 'undefined') {
            return res.status(400).json({ message: 'This gig has no assigned freelancer/owner' });
        }

        if (freelancerId === clientId) {
            return res.status(400).json({ message: 'You cannot book your own gig' });
        }

        const booking = await Booking.create({
            gig: safeGigId,
            client: clientId,
            freelancer: freelancerId,
            status: 'Pending',
            paymentStatus: 'Unpaid'
        });

        // Log the booking creation
        logger.info('New booking created', { 
            bookingId: booking._id, 
            clientId: clientId, 
            freelancerId: freelancerId 
        });

        res.status(201).json({
            message: 'Booking created! Proceed to payment to secure your booking.',
            booking
        });
    } catch (error) {
        logger.error('Error creating booking', { error: error.message });
        next(error);
    }
};

exports.payForBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cardHolder, cardNumber, expiry, cvv } = req.body;
        const userId = req.user.id || req.user._id;

        const booking = await Booking.findById(id).populate('gig');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.client.toString() !== String(userId)) {
            return res.status(403).json({ message: 'You can only pay for your own bookings' });
        }

        if (booking.status === 'Declined') {
            return res.status(400).json({ message: 'Cannot pay for a declined booking' });
        }

        if (booking.paymentStatus === 'Paid') {
            return res.status(400).json({ message: 'This booking has already been paid for' });
        }

        const cleanCardNumber = String(cardNumber || '').replace(/\s+/g, '');
        if (!cardHolder || !/^\d{13,19}$/.test(cleanCardNumber) || !expiry || !/^\d{3,4}$/.test(String(cvv || ''))) {
            return res.status(400).json({ message: 'Please provide valid mock payment card details' });
        }

        booking.paymentStatus = 'Paid';
        booking.paymentReference = `HH-PAY-${Date.now().toString().slice(-6)}`;
        booking.paidAt = new Date();
        await booking.save();

        // Log the payment
        logger.info('Booking payment successful', { 
            bookingId: booking._id, 
            amount: booking.gig.price,
            reference: booking.paymentReference 
        });

        res.status(200).json({
            message: 'Payment successful! Funds are held in escrow until the freelancer confirms.',
            booking
        });
    } catch (error) {
        logger.error('Error processing payment', { error: error.message });
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

        const bookings = await Booking.find(query)
            .populate('gig')
            .populate('client', 'name email')
            .populate('freelancer', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};

// Freelancer updates status (Confirm / Decline)
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        const userId = req.user.id || req.user._id;

        if (!['Confirmed', 'Declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (req.user.role !== 'Admin' && booking.freelancer.toString() !== String(userId)) {
            return res.status(403).json({ message: 'You can only update your own bookings' });
        }

        if (status === 'Confirmed' && booking.paymentStatus !== 'Paid') {
            return res.status(400).json({ message: 'Cannot confirm booking until the client completes payment' });
        }

        booking.status = status;

        if (status === 'Confirmed') {
            await booking.save();
            const existing = await Transaction.findOne({ booking: booking._id });
            if (!existing) {
                const gig = await Gig.findById(booking.gig);
                await Transaction.create({
                    booking: booking._id,
                    client: booking.client,
                    freelancer: booking.freelancer,
                    gig: booking.gig,
                    amount: gig ? gig.price || 0 : 0,
                    paymentReference: booking.paymentReference
                });
                
                // Log transaction creation
                logger.info('Transaction logged to ledger', { bookingId: booking._id });
            }
        } else {
            if (booking.paymentStatus === 'Paid') {
                booking.paymentStatus = 'Refunded';
            }
            await booking.save();
            await Transaction.deleteOne({ booking: booking._id });
        }

        // Log status change
        logger.info(`Booking status updated to ${status}`, { bookingId: booking._id, freelancerId: userId });

        res.status(200).json({ message: `Booking status updated to ${status}`, booking });
    } catch (error) {
        logger.error('Error updating booking status', { error: error.message });
        next(error);
    }
};
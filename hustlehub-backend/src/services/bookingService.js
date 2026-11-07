const Booking = require('../models/bookingModel');
const Transaction = require('../models/transactionModel');
const Gig = require('../models/gigModel');

//Create a booking and a corresponding transaction
exports.createBooking = async (gigId, clientId) => {
    const gig = await Gig.findById(gigId);
    if (!gig) {
        throw new Error('Gig not found');
    }

    const freelancerId = gig.owner || gig.freelancer || gig.user;
    if (freelancerId.toString() === clientId.toString()) {
        throw new Error('You cannot book your own gig');
    }

    const newBooking = new Booking({
        gig: gig._id,
        client: clientId,
        freelancer: freelancerId, 
        status: 'Pending',
        paymentStatus: 'Unpaid'
    });

    await newBooking.save();

    return { booking: newBooking };
};

exports.processMockPayment = async (bookingId, clientId, paymentDetails = {}) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new Error('Booking not found');
    }

    if (booking.client.toString() !== clientId.toString()) {
        throw new Error('You can only pay for your own bookings');
    }

    if (booking.paymentStatus === 'Paid') {
        throw new Error('Booking is already paid');
    }

    const rawDigits = String(paymentDetails.cardNumber || '').replace(/\D/g, '');
    if (rawDigits.length < 12) {
        throw new Error('Invalid card number');
    }

    booking.paymentStatus = 'Paid';
    booking.paymentReference = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    booking.paidAt = new Date();
    await booking.save();

    return booking;
};
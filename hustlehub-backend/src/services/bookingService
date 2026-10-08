const Booking = require('../models/bookingModel');
const Transaction = require('../models/transactionModel');
const Gig = require('../models/gigModel');

exports.createBooking = async (gigId, clientId) => {
    const gig = await Gig.findById(gigId);
    if (!gig) {
        throw new Error('Gig not found');
    }

    if (gig.owner.toString() === clientId.toString()) {
        throw new Error('You cannot book your own gig');
    }

    const newBooking = new Booking({
        gig: gig._id,
        client: clientId,
        freelancer: gig.owner, 
        status: 'Confirmed'    
    });
    
    const newTransaction = new Transaction({
        client: clientId,
        freelancer: gig.owner,
        gig: gig._id,
        amount: gig.price    
    });

    await newBooking.save();
    await newTransaction.save();

    return { booking: newBooking, transaction: newTransaction };
};
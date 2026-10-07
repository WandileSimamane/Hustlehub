const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Declined'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gig: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
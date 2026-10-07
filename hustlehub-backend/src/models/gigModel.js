// src/models/gigModel.js
const mongoose = require('mongoose');

const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Tutoring', 'Other'];

const gigSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 3, maxlength: 300 },
    description: { type: String, required: [true, 'Description is required'], trim: true, minlength: 10, maxlength: 6000 },
    category: { type: String, required: [true, 'Category is required'], enum: CATEGORIES },
    price: { type: Number, required: [true, 'Price is required'], min: [1, 'Price must be at least 1'] },
    deliveryDays: { type: Number, required: [true, 'Delivery time is required'], min: 1, max: 90 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

const Gig = mongoose.model('Gig', gigSchema);
Gig.CATEGORIES = CATEGORIES;

module.exports = Gig;

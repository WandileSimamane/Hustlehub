const mongoose = require('mongoose');

//Schema for a user account with a unique email and a role
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['Client', 'Freelancer', 'Admin'],
        default: 'Client'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
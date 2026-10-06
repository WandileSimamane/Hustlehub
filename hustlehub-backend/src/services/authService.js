// services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.registerUser = async (userData) => {
    const { name, email, password, role } = userData;

    // Check for duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User with this email already exists.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'Client'
    });

    await newUser.save();

    return { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role };
};

exports.loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password.');
    }

    const payload = {
        id: user._id,
        role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { 
        token, 
        user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    };
};
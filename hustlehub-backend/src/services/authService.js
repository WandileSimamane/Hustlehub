const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Registers a new user, returns 409 if the email is already taken
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

// Logs a user in with Account Lockout protection (locks after 5 failed attempts)
exports.loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password.');
    }

    // Check if the account is currently locked
    const now = Date.now();
    if (user.lockUntil && user.lockUntil > now) {
        const minutesLeft = Math.ceil((user.lockUntil - now) / 60000);
        throw new Error(`Account is locked due to multiple failed login attempts. Try again in ${minutesLeft} minute(s).`);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        // Increment failed attempts
        user.loginAttempts += 1;

        // Lock account for 15 minutes if attempts reach 5
        if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(now + 15 * 60 * 1000);
            user.loginAttempts = 0; // Reset counter for next cycle
            await user.save();
            throw new Error('Account locked due to 5 failed login attempts. Please try again after 15 minutes.');
        }

        await user.save();
        throw new Error('Invalid email or password.');
    }

    // Successful login: reset failed attempts and lockout timers
    if (user.loginAttempts > 0 || user.lockUntil) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
    }

    const payload = {
        id: user._id,
        role: user.role
    };

    // Bulletproof fallback secret
    const secret = process.env.JWT_SECRET || 'c4635fd54ffe87052eb60caac7f3a36aec27caf42b9c79126a081a3e05b56586b3dc88c8fd38db8ae67e456d76fcd28fc7ca5a1d3d6662050f7358c5f15fa405';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    return { 
        token, 
        user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    };
};
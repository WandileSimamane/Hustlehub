const users = require('../models/userModel');

// POST /register
exports.registerUser = (req, res) => {
    const { name, email, password } = req.body;

    // Edge Case: Check for missing fields
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields (name, email, password).' });
    }

    // Edge Case: Check for duplicate user registration
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Create user object and save to in-memory array
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password // Note: Hashing will be attached by Security Specialist
    };

    users.push(newUser);

    res.status(201).json({
        message: 'User registered successfully.',
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
};

// POST /login
exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    // Edge Case: Check for missing fields
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Find user and verify password
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.status(200).json({
        message: 'Login successful.',
        user: { id: user.id, name: user.name, email: user.email }
    });
};
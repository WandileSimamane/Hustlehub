const users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
exports.registerUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Edge Case: Duplicate email registration
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: 'User with this email already exists.',
        });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            role: role || 'Client' 
        };

        users.push(newUser); 

        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        // Pass error to global error handler
        next(error); 
    }
};

// POST /api/auth/login
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const payload = {
            id: user.id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token: token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

/*Disclosure of AI Usage in the Assessment: 
- Section which generative AI was used: POE Part 1
- Name of AI tool used: Gemini AI 
- Purpose/Intention behind use: I used Gemini AI as a support tool to help fix coding errors, assist with building the API. 
- Date in which generative AI was used: 1 September 2026 
- Link to the generative AI: https://share.gemini.google/3E6IZnpAoC31
*/
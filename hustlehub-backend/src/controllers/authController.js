// controllers/authController.js
const authService = require('../services/authService');

exports.registerUser = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body);
        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user
        });
    } catch (error) {
        if (error.message === 'User with this email already exists.') {
            return res.status(409).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        
        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token: result.token,
            user: result.user
        });
    } catch (error) {
        if (error.message === 'Invalid email or password.') {
            return res.status(401).json({ success: false, message: error.message });
        }
        next(error);
    }
};
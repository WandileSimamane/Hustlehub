const authService = require('../services/authService');
const logger = require('../utils/logger'); // Inject logger

// Registers a new user, returns 409 if the email is already taken
exports.registerUser = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body);
        
        // Log successful registration
        logger.info('New user registered', { userId: user._id, role: user.role });
        
        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user
        });
    } catch (error) {
        if (error.message === 'User with this email already exists.') {
            logger.warn('Registration failed: Email already in use', { email: req.body.email });
            return res.status(409).json({ success: false, message: error.message });
        }
        logger.error('Registration server error', { error: error.message });
        next(error);
    }
};

// Logs a user in and returns a token, returns 401 for wrong credentials
exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        
        // Log successful login
        logger.info('User logged in', { userId: result.user._id, role: result.user.role });
        
        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token: result.token,
            user: result.user
        });
    } catch (error) {
        if (error.message === 'Invalid email or password.') {
            logger.warn('Failed login attempt', { email: req.body.email });
            return res.status(401).json({ success: false, message: error.message });
        }
        logger.error('Login server error', { error: error.message });
        next(error);
    }
};
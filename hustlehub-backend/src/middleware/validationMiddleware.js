const { body, validationResult } = require('express-validator');

//Validation rules for user registration
exports.registerRules = [ 
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('role').optional().isIn(['Client', 'Freelancer', 'Admin']).withMessage('Invalid role selection')
];
//Validation rules for user login
exports.loginRules = [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
];
//Returns a 400 with errors if validation failed, otherwise continues
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};
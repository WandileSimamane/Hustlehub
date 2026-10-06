const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateAuth } = require('../middleware/validationMiddleware');

// Define register and login POST endpoints with validation middleware
router.post('/register', validateAuth, registerUser);
router.post('/login', validateAuth, loginUser);

// Protected route demonstrating the middleware in action
router.get('/protected-test', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'You have successfully accessed a protected route.',
        user: req.user
    });
});

module.exports = router;

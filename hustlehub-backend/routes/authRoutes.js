const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// Define register and login POST endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

const { registerUser, loginUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateAuth } = require('../middleware/validationMiddleware');

router.post('/register', validateAuth, registerUser);
router.post('/login', validateAuth, loginUser);

// Example protected route demonstrating the middleware in action
router.get('/protected-test', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'You have successfully accessed a protected route.',
        user: req.user // This contains the ID and Role decoded from the JWT
    });
});

module.exports = router;
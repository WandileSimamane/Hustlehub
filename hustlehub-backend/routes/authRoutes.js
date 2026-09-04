const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Example protected route demonstrating the middleware in action
router.get('/protected-test', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'You have successfully accessed a protected route.',
        user: req.user // This contains the ID and Role decoded from the JWT
    });
});

module.exports = router;
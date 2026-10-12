const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { registerRules, loginRules, validate } = require('../middleware/validationMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

//Public auth routes: register and login with rate limiting
router.post('/register', registerRules, validate, registerUser);
router.post('/login', loginLimiter, loginRules, validate, loginUser);

router.get('/protected-test', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'You have successfully accessed a protected route.',
        user: req.user
    });
});

module.exports = router;
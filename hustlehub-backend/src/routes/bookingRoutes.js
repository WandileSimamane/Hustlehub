const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { bookingLimiter } = require('../middleware/rateLimiter');

// Client creates a booking
router.post('/', verifyToken, authorizeRoles('Client'), bookingLimiter, bookingController.createBooking);

// Client pays for a booking via mock payment gateway
router.post('/:id/pay', verifyToken, authorizeRoles('Client'), bookingLimiter, bookingController.payForBooking);

// View bookings
router.get('/', verifyToken, bookingController.getBookings);

// Freelancer accepts/rejects a booking
router.patch('/:id/status', verifyToken, authorizeRoles('Freelancer', 'Admin'), bookingController.updateBookingStatus);

module.exports = router;
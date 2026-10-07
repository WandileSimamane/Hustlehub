const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

// Client creates a booking
router.post('/', verifyToken, authorizeRoles('Client'), bookingController.createBooking);

// View bookings
router.get('/', verifyToken, bookingController.getBookings);

// Freelancer accepts/rejects a booking
router.patch('/:id/status', verifyToken, authorizeRoles('Freelancer', 'Admin'), bookingController.updateBookingStatus);

module.exports = router; // <-- This line must be present at the very end!
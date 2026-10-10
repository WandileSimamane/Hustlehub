const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

// verifyToken must run first: authorizeRoles reads req.user.role from the verified JWT.
// Only Freelancers can see income data.
router.use(verifyToken, authorizeRoles('Freelancer'));

router.get('/summary', ctrl.getSummary);
router.get('/transactions', ctrl.getTransactions);
router.get('/bookings', ctrl.getBookings);

module.exports = router;
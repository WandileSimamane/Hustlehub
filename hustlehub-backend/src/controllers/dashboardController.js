const dashboardService = require('../services/dashboardService');

const handle = (fn) => async (req, res) => {
  try {
    // req.user is set by verifyToken from the verified JWT payload ({ id, role })
    const userId = req.user && (req.user.id || req.user._id);
    const data = await fn(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Dashboard error:', err.message); // log internally only
    return res.status(500).json({ success: false, message: 'Unable to load dashboard data.' });
  }
};

exports.getSummary = handle(dashboardService.getIncomeSummary);
exports.getTransactions = handle(dashboardService.getTransactions);
exports.getBookings = handle(dashboardService.getReceivedBookings);
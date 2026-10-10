const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Booking = require('../models/bookingModel');

// Rejects anything that isn't a valid ObjectId before it reaches the database
const toObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error('Invalid user id');
  }
  return new mongoose.Types.ObjectId(id);
};

// Total historical income + monthly breakdown, via aggregation
exports.getIncomeSummary = async (freelancerId) => {
  const match = { $match: { freelancer: toObjectId(freelancerId) } };

  const [totals] = await Transaction.aggregate([
    match,
    {
      $group: {
        _id: null,
        totalIncome: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        averageTransaction: { $avg: '$amount' },
      },
    },
  ]);

  const monthly = await Transaction.aggregate([
    match,
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        income: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return {
    totalIncome: totals ? totals.totalIncome : 0,
    transactionCount: totals ? totals.transactionCount : 0,
    averageTransaction: totals ? Math.round(totals.averageTransaction * 100) / 100 : 0,
    monthly: monthly.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      income: m.income,
      count: m.count,
    })),
  };
};

exports.getTransactions = (freelancerId) =>
  Transaction.find({ freelancer: toObjectId(freelancerId) })
    .populate('client', 'name')
    .populate('booking', '_id')
    .sort({ createdAt: -1 })
    .lean();

exports.getReceivedBookings = (freelancerId) =>
  Booking.find({ freelancer: toObjectId(freelancerId) })
    .populate('gig', 'title price')
    .populate('client', 'name')
    .sort({ createdAt: -1 })
    .lean();
// src/services/dashboardService.js
const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Booking = require('../models/bookingModel');
const { estimateTax, round2 } = require('./taxService');

// Rejects anything that isn't a valid ObjectId before it reaches the database
const toObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error('Invalid user id');
  }
  return new mongoose.Types.ObjectId(id);
};

// Total historical income + estimated tax + monthly breakdown, via aggregation
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

  // Tax estimate is based on confirmed income only (a Transaction exists only after confirmation)
  const gross = round2(totals ? totals.totalIncome : 0);
  const tax = estimateTax(gross);

  return {
    ...tax, // taxYear, grossIncome, estimatedTax, netIncome, effectiveRate
    totalIncome: tax.grossIncome,
    transactionCount: totals ? totals.transactionCount : 0,
    averageTransaction: totals ? round2(totals.averageTransaction) : 0,
    monthly: monthly.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      income: round2(m.income),
      count: m.count,
    })),
  };
};

// Get all transactions for a freelancer, with client and booking details
exports.getTransactions = (freelancerId) =>
  Transaction.find({ freelancer: toObjectId(freelancerId) })
    .populate('client', 'name')
    .populate('booking', '_id')
    .sort({ createdAt: -1 })
    .lean();

// Get all bookings received by a freelancer, with gig and client details
exports.getReceivedBookings = (freelancerId) =>
  Booking.find({ freelancer: toObjectId(freelancerId) })
    .populate('gig', 'title price')
    .populate('client', 'name')
    .sort({ createdAt: -1 })
    .lean();
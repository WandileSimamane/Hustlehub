// src/controllers/gigController.js
const gigService = require('../services/gigService');

// Sets the status code, then passes the error to the shared errorHandler
const fail = (res, next, error) => {
    res.status(error.name === 'ValidationError' ? 400 : (error.statusCode || 500));
    next(error);
};

exports.createGig = async (req, res, next) => {
    try {
        const gig = await gigService.createGig(req.user.id, req.body);
        return res.status(201).json({ success: true, message: 'Gig created successfully.', gig });
    } catch (error) {
        fail(res, next, error);
    }
};

exports.getGigs = async (req, res, next) => {
    try {
        const gigs = await gigService.getAllGigs({ category: req.query.category });
        return res.status(200).json({ success: true, count: gigs.length, gigs });
    } catch (error) {
        fail(res, next, error);
    }
};

exports.getMyGigs = async (req, res, next) => {
    try {
        const gigs = await gigService.getGigsByOwner(req.user.id);
        return res.status(200).json({ success: true, count: gigs.length, gigs });
    } catch (error) {
        fail(res, next, error);
    }
};

exports.getGig = async (req, res, next) => {
    try {
        const gig = await gigService.getGigById(req.params.id);
        return res.status(200).json({ success: true, gig });
    } catch (error) {
        fail(res, next, error);
    }
};

exports.updateGig = async (req, res, next) => {
    try {
        const gig = await gigService.updateGig(req.params.id, req.user, req.body);
        return res.status(200).json({ success: true, message: 'Gig updated successfully.', gig });
    } catch (error) {
        fail(res, next, error);
    }
};

exports.deleteGig = async (req, res, next) => {
    try {
        await gigService.deleteGig(req.params.id, req.user);
        return res.status(200).json({ success: true, message: 'Gig deleted successfully.' });
    } catch (error) {
        fail(res, next, error);
    }
};

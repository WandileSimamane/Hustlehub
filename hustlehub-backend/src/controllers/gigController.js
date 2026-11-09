/*
 * Title: Express Routing
 * Author: OpenJS Foundation
 * Date: Apr 19, 2024
 * Availability: https://expressjs.com/en/guide/routing.html
 * Accessed: November 9, 2026
 */
const gigService = require('../services/gigService');

// Sets the status code, then passes the error to the shared errorHandler
const fail = (res, next, error) => {
    res.status(error.name === 'ValidationError' ? 400 : (error.statusCode || 500));
    next(error);
};

// Creates a new gig owned by the logged-in user
exports.createGig = async (req, res, next) => {
    try {
        const gig = await gigService.createGig(req.user.id, req.body);
        return res.status(201).json({ success: true, message: 'Gig created successfully.', gig });
    } catch (error) {
        fail(res, next, error);
    }
};

// Returns all gigs, optionally filtered by category
exports.getGigs = async (req, res, next) => {
    try {
        const gigs = await gigService.getAllGigs({ category: req.query.category });
        return res.status(200).json({ success: true, count: gigs.length, gigs });
    } catch (error) {
        fail(res, next, error);
    }
};

// Returns only the gigs owned by the logged-in user
exports.getMyGigs = async (req, res, next) => {
    try {
        const gigs = await gigService.getGigsByOwner(req.user.id);
        return res.status(200).json({ success: true, count: gigs.length, gigs });
    } catch (error) {
        fail(res, next, error);
    }
};

// Returns a single gig by its ID
exports.getGig = async (req, res, next) => {
    try {
        const gig = await gigService.getGigById(req.params.id);
        return res.status(200).json({ success: true, gig });
    } catch (error) {
        fail(res, next, error);
    }
};

// Updates a gig, with the service checking the user's permission
exports.updateGig = async (req, res, next) => {
    try {
        const gig = await gigService.updateGig(req.params.id, req.user, req.body);
        return res.status(200).json({ success: true, message: 'Gig updated successfully.', gig });
    } catch (error) {
        fail(res, next, error);
    }
};

// Toggles a gig between published and unpublished, with the service checking permission
exports.deleteGig = async (req, res, next) => {
    try {
        const gig = await gigService.unpublishGig(req.params.id, req.user);
        return res.status(200).json({ 
            success: true, 
            message: `Gig successfully ${gig.status}`,
            gig 
        });
    } catch (error) {
        fail(res, next, error);
    }
};
;
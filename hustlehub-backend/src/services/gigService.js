/*
 * Title: Mongoose: Queries
 * Author: Automattic
 * Date: Oct 31, 2023
 * Availability: https://mongoosejs.com/docs/queries.html
 * Accessed: November 9, 2026
 */
const mongoose = require('mongoose');
const Gig = require('../models/gigModel');

// Only these fields can be set by a client (blocks mass assignment, e.g. sending "owner")
// "status" is intentionally excluded here so it can only be changed via the explicit unpublish route
const ALLOWED_FIELDS = ['title', 'description', 'category', 'price', 'deliveryDays'];

const httpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const pickFields = (data = {}) =>
    ALLOWED_FIELDS.reduce((picked, key) => {
        if (data[key] !== undefined) picked[key] = data[key];
        return picked;
    }, {});

const assertValidId = (id) => {
    if (!mongoose.isValidObjectId(String(id))) throw httpError(400, 'Invalid gig ID.');
};

exports.createGig = async (ownerId, data) => {
    return Gig.create({ ...pickFields(data), owner: String(ownerId), status: 'published' });
};

exports.getAllGigs = async (params = {}) => {
    const filter = {};
    const categoryInput = params && params.category ? String(params.category) : null;
    if (categoryInput && Gig.CATEGORIES.includes(categoryInput)) {
        filter.category = categoryInput;
    }
    // only the owner's name is returned, never email or password hash
    return Gig.find(filter).populate('owner', 'name').sort({ createdAt: -1 });
};

exports.getGigsByOwner = async (ownerId) => {
    // Freelancers still need to see ALL their gigs (published and unpublished) in their manager view
    
    //Explicitly cast ownerId to string to block NoSQL objects
    return Gig.find({ owner: String(ownerId) }).sort({ createdAt: -1 });
};

exports.getGigById = async (id) => {
    assertValidId(id);
    const gig = await Gig.findById(String(id)).populate('owner', 'name');
    
    if (!gig) throw httpError(404, 'Gig not found.');
    return gig;
};

exports.updateGig = async (id, user, data) => {
    assertValidId(id);

    //Explicitly cast id to string
    const gig = await Gig.findById(String(id));
    if (!gig) throw httpError(404, 'Gig not found.');

    const isOwner = gig.owner && gig.owner.toString() === String(user.id);
    const isAdmin = user.role === 'Admin';
    if (!isOwner && !isAdmin) {
        throw httpError(403, 'You can only edit your own gigs.');
    }

    // pickFields never includes "owner", so an edit can't change who owns the gig
    gig.set(pickFields(data));
    await gig.save();
    return gig;
};

// Renamed from deleteGig to unpublishGig for clarity
exports.unpublishGig = async (id, user) => {
    assertValidId(id);
    //Explicitly cast id to string
    const gig = await Gig.findById(String(id));
    if (!gig) throw httpError(404, 'Gig not found.');

    const isOwner = gig.owner && gig.owner.toString() === String(user.id);
    const isAdmin = user.role === 'Admin';
    if (!isOwner && !isAdmin) {
        throw httpError(403, 'You can only unpublish your own gigs.');
    }

    // Toggle the status instead of deleting the document
    gig.status = gig.status === 'published' ? 'unpublished' : 'published';
    await gig.save();
    
    return gig;
};
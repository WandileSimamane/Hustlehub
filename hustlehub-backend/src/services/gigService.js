// src/services/gigService.js
const mongoose = require('mongoose');
const Gig = require('../models/gigModel');

// Only these fields can be set by a client (blocks mass assignment, e.g. sending "owner")
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
    if (!mongoose.isValidObjectId(id)) throw httpError(400, 'Invalid gig ID.');
};

exports.createGig = async (ownerId, data) => {
    // owner always comes from the verified JWT, never from the request body
    return Gig.create({ ...pickFields(data), owner: ownerId });
};

exports.getAllGigs = async ({ category } = {}) => {
    const filter = {};
    if (typeof category === 'string' && Gig.CATEGORIES.includes(category)) {
        filter.category = category;
    }
    // only the owner's name is returned, never email or password hash
    return Gig.find(filter).populate('owner', 'name').sort({ createdAt: -1 });
};

exports.getGigsByOwner = async (ownerId) => {
    return Gig.find({ owner: ownerId }).sort({ createdAt: -1 });
};

exports.getGigById = async (id) => {
    assertValidId(id);
    const gig = await Gig.findById(id).populate('owner', 'name');
    if (!gig) throw httpError(404, 'Gig not found.');
    return gig;
};

exports.updateGig = async (id, user, data) => {
    assertValidId(id);
    const gig = await Gig.findById(id);
    if (!gig) throw httpError(404, 'Gig not found.');

    // Only the freelancer who created the gig can edit it
    if (gig.owner.toString() !== user.id) {
        throw httpError(403, 'You can only edit your own gigs.');
    }

    gig.set(pickFields(data));
    await gig.save();
    return gig;
};

exports.deleteGig = async (id, user) => {
    assertValidId(id);
    const gig = await Gig.findById(id);
    if (!gig) throw httpError(404, 'Gig not found.');

    // Owner can delete their own gig; Admin can delete any gig
    const isOwner = gig.owner.toString() === user.id;
    const isAdmin = user.role === 'Admin';
    if (!isOwner && !isAdmin) {
        throw httpError(403, 'You can only delete your own gigs.');
    }

    await gig.deleteOne();
};

const { body } = require('express-validator');
const Gig = require('../models/gigModel');
const { validate } = require('./validationMiddleware');

const buildRules = (isUpdate) => {
    //on update every field is optional, on create every field is required
    const field = (name) => (isUpdate ? body(name).optional() : body(name));

//Validation rules for creating or updating a gig
    return [
        field('title')
            .isString().withMessage('Title must be text')
            .trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3 to 100 characters')
            .escape(),
        field('description')
            .isString().withMessage('Description must be text')
            .trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10 to 2000 characters')
            .escape(),
        field('category')
            .isIn(Gig.CATEGORIES).withMessage('Category must be one of: ' + Gig.CATEGORIES.join(', ')),
        field('price')
            .isFloat({ min: 1 }).withMessage('Price must be a number of at least 1')
            .toFloat(),
        field('deliveryDays')
            .isInt({ min: 1, max: 90 }).withMessage('Delivery time must be 1 to 90 days')
            .toInt(),
        validate
    ];
};

exports.createGigRules = buildRules(false);
exports.updateGigRules = buildRules(true);

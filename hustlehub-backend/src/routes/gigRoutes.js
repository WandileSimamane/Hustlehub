// src/routes/gigRoutes.js
const express = require('express');
const router = express.Router();

const gigController = require('../controllers/gigController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { createGigRules, updateGigRules } = require('../middleware/gigValidation');

// Public: anyone can browse gigs
router.get('/', gigController.getGigs);

// Freelancer only (must be declared before '/:id')
router.get('/mine', verifyToken, authorizeRoles('Freelancer'), gigController.getMyGigs);

router.get('/:id', gigController.getGig);

// Freelancer only: create
router.post('/', verifyToken, authorizeRoles('Freelancer'), createGigRules, gigController.createGig);

// Freelancer only, and the service also checks they own the gig
router.put('/:id', verifyToken, authorizeRoles('Freelancer'), updateGigRules, gigController.updateGig);

// Freelancer (own gigs) or Admin (any gig); the service decides which
router.delete('/:id', verifyToken, authorizeRoles('Freelancer', 'Admin'), gigController.deleteGig);

module.exports = router;

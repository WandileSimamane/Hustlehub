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

// Freelancer or Admin: create
router.post(
  '/',
  verifyToken,
  authorizeRoles('Freelancer', 'Admin'),
  createGigRules,
  gigController.createGig
);

// Freelancer (own gigs) or Admin (any gig); the service decides which
router.put(
  '/:id',
  verifyToken,
  authorizeRoles('Freelancer', 'Admin'),
  updateGigRules,
  gigController.updateGig
);

// Freelancer (own gigs) or Admin (any gig); the service decides which
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('Freelancer', 'Admin'),
  gigController.deleteGig
);

module.exports = router;
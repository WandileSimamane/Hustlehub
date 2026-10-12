const express = require('express');
const router = express.Router();

const gigController = require('../controllers/gigController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { createGigRules, updateGigRules } = require('../middleware/gigValidation');

//Public route to get all gigs or a specific gig by ID
router.get('/', gigController.getGigs);

//Protected routes for gig management
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

// Freelancer or Admin: update a gig
router.put(
  '/:id',
  verifyToken,
  authorizeRoles('Freelancer', 'Admin'),
  updateGigRules,
  gigController.updateGig
);

// Freelancer or Admin: delete a gig
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('Freelancer', 'Admin'),
  gigController.deleteGig
);

module.exports = router;
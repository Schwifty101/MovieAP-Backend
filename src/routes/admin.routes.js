const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// Route to get site statistics
router.get('/statistics', authenticate, isAdmin, adminController.getSiteStatistics);

// Route to get trending genres
router.get('/trending-genres', authenticate, isAdmin, adminController.getTrendingGenres);

// Route to get most searched actors
router.get('/most-searched-actors', authenticate, isAdmin, adminController.getMostSearchedActors);

// Route to get user engagement patterns
router.get('/user-engagement', authenticate, isAdmin, adminController.getUserEngagementPatterns);

module.exports = router;

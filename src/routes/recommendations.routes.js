const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Route to get personalized recommendations
router.get('/recommendation', authenticate, recommendationController.getRecommendations);

// Route to get s for a specific movie
router.get('/movies/:movieId/similar', authenticate, recommendationController.getSimilarTitles);

// Route to get trending movies
router.get('/trending', recommendationController.getTrendingMovies);

// Route to get top-rated movies
router.get('/top-rated', recommendationController.getTopRatedMovies);

module.exports = router;

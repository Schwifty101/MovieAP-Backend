const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// Route definitions for movie review functionality
// All routes are prefixed with /api/reviews

/**
 * POST /api/reviews
 * Create a new movie review
 * Requires authentication
 * @body {Object} reviewData - The review data including movie, rating and comment
 */
router.post('/', authenticate, reviewController.createReview);

// Get all reviews
router.get('/',  reviewController.getReviews);

/**
 * GET /api/reviews/movie/:movieId
 * Get all reviews for a specific movie
 * Public route - no authentication required
 * @param {string} movieId - The ID of the movie to get reviews for
 */
router.get('/movie/:movieId', reviewController.getMovieReviews);

/**
 * PUT /api/reviews/:id
 * Update an existing review
 * Requires authentication - only review author can update
 * @param {string} id - The ID of the review to update
 * @body {Object} updateData - The updated review data
 */
router.put('/:id', authenticate, isAdmin, reviewController.updateReview);

/**
 * DELETE /api/reviews/:id
 * Delete an existing review
 * Requires authentication - only review author can delete
 * @param {string} id - The ID of the review to delete
 */
router.delete('/:id', authenticate, isAdmin, reviewController.deleteReview);


module.exports = router;
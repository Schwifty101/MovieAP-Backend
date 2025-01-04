const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussion.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/discussions
 * Create a new discussion thread for a movie
 * @body {Object} discussionData - Discussion details including title, content, movieId
 */
router.post('/:movieId', discussionController.createDiscussion);

/**
 * GET /api/discussions/movie/:movieId
 * Get all discussions for a specific movie
 * @param {string} movieId - ID of movie to get discussions for
 * @query {Object} filters - Optional filters for discussions (e.g. sort, pagination)
 */
router.get('/movie/:movieId', discussionController.getMovieDiscussions);

/**
 * POST /api/discussions/:id/comments
 * Add a comment to an existing discussion thread
 * @param {string} id - Discussion ID to add comment to
 * @body {Object} commentData - Comment details including content
 */
router.post('/:id/comments', discussionController.addComment);

module.exports = router;
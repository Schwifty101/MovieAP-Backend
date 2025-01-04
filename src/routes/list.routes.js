const express = require('express');
const router = express.Router();
const listController = require('../controllers/list.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/lists
 * Create a new movie list
 * @body {Object} listData - List details including name, description, movies, isPublic
 */
router.post('/', listController.createList);

/**
 * GET /api/lists
 * Get all accessible movie lists (public lists and user's private lists)
 * @query {Object} filters - Optional filters for lists
 */
router.get('/', listController.getLists);

/**
 * PUT /api/lists/:id
 * Update an existing list
 * Only list creator can update
 * @param {string} id - List ID to update
 * @body {Object} updateData - Updated list data
 */
router.put('/:id', listController.updateList);

/**
 * DELETE /api/lists/:id
 * Delete an existing list
 * Only list creator can delete
 * @param {string} id - List ID to delete
 */
router.delete('/:id', listController.deleteList);

/**
 * POST /api/lists/:id/follow
 * Follow/unfollow a public list
 * @param {string} id - List ID to follow/unfollow
 */
router.post('/:id/follow', listController.followList);

/**
 * POST /api/lists/:id/movies
 * Add a movie to a specific list
 * Only the list creator can add movies
 * @param {string} id - List ID to add a movie to
 * @body {Object} movieData - Movie details to add (e.g., movieId)
 */
router.post('/:id/movies/:movieId', listController.addMovieToList);

/**
 * DELETE /api/lists/:id/movies/:movieId
 * Remove a movie from a specific list
 * Only the list creator can remove movies
 * @param {string} id - List ID to remove a movie from
 * @param {string} movieId - Movie ID to remove
 */
router.delete('/:id/movies/:movieId', listController.removeMovieFromList);

module.exports = router;
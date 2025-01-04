/**
 * @fileoverview Profile routes handling user profile management and preferences
 * Contains routes for viewing, updating and deleting user profiles,
 * managing user preferences, and handling wishlist operations.
 */

const express = require('express');
const {
  viewUserProfile,
  updateUserProfile, 
  deleteUserProfile,
  updateUserPreferences,
  viewUserPreferences,
  addToWishlist,
  removeFromWishlist,
  viewWishlist
} = require('../controllers/profile.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route GET /profile/view
 * @desc Retrieve the authenticated user's profile information
 * @access Private - Requires authentication
 */
router.get('/view', authenticate, viewUserProfile);

/**
 * @route PUT /profile/update
 * @desc Update authenticated user's basic profile information (username, email)
 * @access Private - Requires authentication
 */
router.put('/update', authenticate, updateUserProfile);

/**
 * @route DELETE /profile/delete
 * @desc Permanently delete authenticated user's profile from the system
 * @access Private - Requires authentication
 */
router.delete('/delete', authenticate, deleteUserProfile);

/**
 * @route GET /profile/preferences
 * @desc Retrieve user's content preferences including favorite genres, actors, etc.
 * @access Private - Requires authentication
 */
router.get('/preferences', authenticate, viewUserPreferences);

/**
 * @route PUT /profile/preferences
 * @desc Update user's content preferences like favorite genres, actors, directors
 * @access Private - Requires authentication
 */
router.put('/preferences', authenticate, updateUserPreferences);

/**
 * @route GET /profile/wishlist
 * @desc Retrieve the list of movies in user's wishlist
 * @access Private - Requires authentication
 */
router.get('/wishlist', authenticate, viewWishlist);

/**
 * @route POST /profile/wishlist/:movieId
 * @desc Add a specific movie to user's wishlist
 * @param {string} movieId - The ID of the movie to add
 * @access Private - Requires authentication
 */
router.post('/wishlist/:movieId', authenticate, addToWishlist);

/**
 * @route DELETE /profile/wishlist/:movieId
 * @desc Remove a specific movie from user's wishlist
 * @param {string} movieId - The ID of the movie to remove
 * @access Private - Requires authentication
 */
router.delete('/wishlist/:movieId', authenticate, removeFromWishlist);

module.exports = router;

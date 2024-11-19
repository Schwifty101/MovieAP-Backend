const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the current user's profile
 *     description: Fetch the profile of the logged-in user, including their wishlist (without password information).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: User's unique identifier
 *                         username:
 *                           type: string
 *                           description: Username of the user
 *                         preferences:
 *                           type: object
 *                           description: User's preferences (e.g., favorite genres)
 *                         wishlist:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Bad request or user not found
 */
router.get('/profile', protect, validate, userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update the current user's profile
 *     description: Update the user's profile information (excluding password).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user information to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               description: The new username for the user
 *             preferences:
 *               type: object
 *               description: User's updated preferences (e.g., favorite genres)
 *     responses:
 *       200:
 *         description: Successfully updated user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or cannot update password
 */
router.patch('/profile', protect, validate, userController.updateProfile);

/**
 * @swagger
 * /users/wishlist:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the current user's wishlist
 *     description: Fetch all movies in the current user's wishlist.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched user's wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     wishlist:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Error fetching wishlist
 */
router.get('/wishlist', protect, validate, userController.getWishlist);

/**
 * @swagger
 * /users/wishlist/{movieId}:
 *   post:
 *     tags:
 *       - Users
 *     summary: Add a movie to the user's wishlist
 *     description: Add a specified movie to the current user's wishlist by movie ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to add to the wishlist
 *     responses:
 *       200:
 *         description: Successfully added movie to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Movie added to wishlist
 *       400:
 *         description: Error adding movie to wishlist or movie not found
 */
router.post('/wishlist/:movieId', protect, userController.addToWishlist);

/**
 * @swagger
 * /users/wishlist/{movieId}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Remove a movie from the user's wishlist
 *     description: Remove a specified movie from the current user's wishlist by movie ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to remove from the wishlist
 *     responses:
 *       200:
 *         description: Successfully removed movie from wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Movie removed from wishlist
 *       400:
 *         description: Error removing movie from wishlist or movie not found
 */
router.delete('/wishlist/:movieId', protect, userController.removeFromWishlist);

module.exports = router;
const express = require('express');
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/reviews/:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Create a new review
 *     description: Allows an authenticated user to post a review for a specific movie. Users can only review a movie once.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: ID of the movie being reviewed
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 5
 *                 description: Rating given to the movie
 *               review:
 *                 type: string
 *                 description: Review content
 *     responses:
 *       201:
 *         description: Review created successfully
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
 *                     review:
 *                       $ref: '#/components/schemas/Review'
 *       400:
 *         description: User already reviewed the movie or invalid request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', protect, reviewController.createReview);

/**
 * @swagger
 * /api/v1/reviews/movie/{movieId}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get all reviews for a movie
 *     description: Fetch a paginated list of reviews for a specific movie, sorted by likes and creation date.
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reviews per page
 *     responses:
 *       200:
 *         description: Successfully fetched reviews
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
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 1
 *                         pages:
 *                           type: integer
 *                           example: 5
 *                         total:
 *                           type: integer
 *                           example: 50
 *       400:
 *         description: Invalid request or processing error
 *       404:
 *         description: Movie not found
 */
router.get('/movie/:movieId', reviewController.getMovieReviews);

/**
 * @swagger
 * /api/v1/reviews/reviews/{reviewId}:
 *   patch:
 *     tags:
 *       - Reviews
 *     summary: Update a review
 *     description: Allows a user to edit their review and/or rating for a movie.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 format: float
 *                 description: Updated rating for the movie
 *               review:
 *                 type: string
 *                 description: Updated review text
 *     responses:
 *       200:
 *         description: Successfully updated the review
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
 *                     review:
 *                       $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error or processing error
 *       404:
 *         description: Review not found or user unauthorized
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/:reviewId', protect, reviewController.updateReview);

module.exports = router;
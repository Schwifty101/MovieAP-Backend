const express = require('express');
const recommendationController = require('../controllers/recommendation.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/recommendations/personal:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Get personalized movie recommendations
 *     description: Fetch a list of movies tailored to the user's preferences and viewing history.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched personalized recommendations
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
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid request or processing error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/personal', protect, recommendationController.getPersonalizedRecommendations);

/**
 * @swagger
 * /api/v1/recommendations/similar/{movieId}:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Get similar movies
 *     description: Retrieve a list of movies similar to the specified movie, based on genres or director.
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the movie to find similar movies for
 *     responses:
 *       200:
 *         description: Successfully fetched similar movies
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
 *                     similarMovies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid request or processing error
 *       404:
 *         description: Movie not found
 */
router.get('/similar/:movieId', recommendationController.getSimilarMovies);

/**
 * @swagger
 * /api/v1/recommendations/trending:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Get trending movies
 *     description: Retrieve a list of movies trending over the last month, based on review count and average ratings.
 *     responses:
 *       200:
 *         description: Successfully fetched trending movies
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
 *                     trendingMovies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid request or processing error
 */
router.get('/trending', recommendationController.getTrendingMovies);

module.exports = router;
const express = require('express');
const movieController = require('../controllers/movie.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /movies/:
 *   get:
 *     tags:
 *       - Movies
 *     summary: Get all movies
 *     description: Fetch a paginated list of all movies, with optional pagination parameters.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of movies per page
 *     responses:
 *       200:
 *         description: Successfully fetched movies
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
 *                     movies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         total:
 *                           type: integer
 *       400:
 *         description: Invalid request
 */
router.get('/', movieController.getAllMovies);

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     tags:
 *       - Movies
 *     summary: Get a specific movie
 *     description: Retrieve details of a specific movie, including its director and cast details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to fetch
 *     responses:
 *       200:
 *         description: Successfully fetched the movie
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
 *                     movie:
 *                       $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 *       400:
 *         description: Invalid request
 */
router.get('/:id', movieController.getMovie)

/**
 * @swagger
 * /movies/{id}:
 *   patch:
 *     tags:
 *       - Movies
 *     summary: Update a movie
 *     description: Admin-only route to update details of a specific movie.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             description: Movie fields to update
 *     responses:
 *       200:
 *         description: Successfully updated the movie
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
 *                     movie:
 *                       $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Movie not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/:id', protect, restrictTo('admin'), movieController.updateMovie);

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     tags:
 *       - Movies
 *     summary: Delete a movie
 *     description: Admin-only route to delete a specific movie.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to delete
 *     responses:
 *       204:
 *         description: Successfully deleted the movie
 *       404:
 *         description: Movie not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/:id', protect, restrictTo('admin'), movieController.deleteMovie);

module.exports = router;
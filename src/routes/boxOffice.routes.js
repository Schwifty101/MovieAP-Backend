const express = require('express');
const boxOfficeController = require('../controllers/boxOffice.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /boxOffice/movies/{movieId}:
 *   post:
 *     tags:
 *       - BoxOffice
 *     summary: Add box office data for a movie
 *     description: Admin can add box office data for a specific movie.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gross:
 *                 type: number
 *                 description: Total gross earnings of the movie
 *               openingWeekend:
 *                 type: number
 *                 description: Opening weekend earnings of the movie
 *               screens:
 *                 type: integer
 *                 description: Number of screens the movie was shown on
 *             required:
 *               - gross
 *               - openingWeekend
 *     responses:
 *       201:
 *         description: Box office data added successfully
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
 *                     boxOffice:
 *                       $ref: '#/components/schemas/BoxOffice'
 *       400:
 *         description: Invalid request data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Movie not found
 */

router.post('/movies/:movieId', protect, restrictTo('admin'), boxOfficeController.addBoxOfficeData);

/**
 * @swagger
 * /boxOffice/movies/{movieId}:
 *   get:
 *     tags:
 *       - BoxOffice
 *     summary: Get box office data for a movie
 *     description: Retrieve box office data for a specific movie.
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie
 *     responses:
 *       200:
 *         description: Box office data retrieved successfully
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
 *                     boxOffice:
 *                       $ref: '#/components/schemas/BoxOffice'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Box office data or movie not found
 */

router.get('/movies/:movieId', boxOfficeController.getMovieBoxOffice);

module.exports = router;
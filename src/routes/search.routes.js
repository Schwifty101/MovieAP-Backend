const express = require('express');
const searchController = require('../controllers/search.controller');

const router = express.Router();

/**
 * @swagger
 * /search/movies:
 *   get:
 *     tags:
 *       - Search
 *     summary: Search for movies based on various filters
 *     description: Allows users to search for movies based on multiple query parameters such as title, genre, year, rating, etc.
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term to match against movie titles or synopsis
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter movies by genre
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter movies by release year
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *           format: float
 *         description: Filter movies by minimum average rating
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter movies by language
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter movies by country of origin
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
 *         description: Number of movies per page
 *     responses:
 *       200:
 *         description: Successfully fetched search results
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
 *                           example: 1
 *                         pages:
 *                           type: integer
 *                           example: 5
 *                         total:
 *                           type: integer
 *                           example: 50
 *       400:
 *         description: Bad request, invalid query parameters
 */
router.get('/movies', searchController.searchMovies);

/**
 * @swagger
 * /search/top/{genre}:
 *   get:
 *     tags:
 *       - Search
 *     summary: Get top rated movies for a specific genre
 *     description: Fetch the top 10 movies of a specific genre, sorted by average rating and total ratings.
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: The genre of the movies to be fetched (e.g., "Action", "Comedy")
 *     responses:
 *       200:
 *         description: Successfully fetched top-rated movies for the given genre
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
 *       400:
 *         description: Bad request, invalid genre or query error
 *       404:
 *         description: Genre not found
 */
router.get('/top/:genre', searchController.getTopMoviesByGenre);

module.exports = router;
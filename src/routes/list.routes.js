const express = require('express');
const listController = require('../controllers/list.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /lists/:
 *   post:
 *     tags:
 *       - Lists
 *     summary: Create a new list
 *     description: Authenticated users can create a custom list of movies.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the list
 *               description:
 *                 type: string
 *                 description: Description of the list
 *               movies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of movie IDs to include in the list
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the list is public or private
 *             required:
 *               - name
 *               - movies
 *     responses:
 *       201:
 *         description: List created successfully
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
 *                     list:
 *                       $ref: '#/components/schemas/List'
 *       400:
 *         description: Invalid request data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.post('/', protect, listController.createList);

/**
 * @swagger
 * /lists/user/{userId}:
 *   get:
 *     tags:
 *       - Lists
 *     summary: Get lists for a specific user
 *     description: Retrieve lists created by a specific user or public lists they have shared. Supports pagination.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose lists are being retrieved
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Pagination page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of lists per page
 *     responses:
 *       200:
 *         description: Lists retrieved successfully
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
 *                     lists:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/List'
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
router.get('/user/:userId', listController.getUserLists);

/**
 * @swagger
 * /lists/{listId}/follow:
 *   post:
 *     tags:
 *       - Lists
 *     summary: Follow a list
 *     description: Authenticated users can follow a specific list.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the list to follow
 *     responses:
 *       200:
 *         description: List followed successfully
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
 *                   example: List followed successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: List not found
 */
router.post('/:listId/follow', protect, listController.followList);

module.exports = router;
const express = require('express');
const discussionController = require('../controllers/discussion.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/discussions/:
 *   post:
 *     tags:
 *       - Discussions
 *     summary: Create a new discussion
 *     description: Authenticated users can create a new discussion.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the discussion
 *               content:
 *                 type: string
 *                 description: Content of the discussion
 *               category:
 *                 type: string
 *                 description: Category of the discussion
 *               relatedMovie:
 *                 type: string
 *                 description: ID of a related movie (optional)
 *               relatedPerson:
 *                 type: string
 *                 description: ID of a related person (optional)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for the discussion
 *             required:
 *               - title
 *               - content
 *     responses:
 *       201:
 *         description: Discussion created successfully
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
 *                     discussion:
 *                       $ref: '#/components/schemas/Discussion'
 *       400:
 *         description: Invalid request data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.post('/', protect, discussionController.createDiscussion);

/**
 * @swagger
 * /api/v1/discussions/:
 *   get:
 *     tags:
 *       - Discussions
 *     summary: Get a list of discussions
 *     description: Retrieve discussions based on optional filters such as category, movie ID, or person ID. Supports pagination.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by discussion category
 *       - in: query
 *         name: movieId
 *         schema:
 *           type: string
 *         description: Filter by related movie ID
 *       - in: query
 *         name: personId
 *         schema:
 *           type: string
 *         description: Filter by related person ID
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
 *         description: Number of discussions per page
 *     responses:
 *       200:
 *         description: Discussions retrieved successfully
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
 *                     discussions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Discussion'
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
router.get('/', discussionController.getDiscussions);

/**
 * @swagger
 * /api/v1/discussions/{discussionId}/comments:
 *   post:
 *     tags:
 *       - Discussions
 *     summary: Add a comment to a discussion
 *     description: Authenticated users can add comments to an existing discussion.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the discussion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content of the comment
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Comment added successfully
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
 *                     discussion:
 *                       $ref: '#/components/schemas/Discussion'
 *       400:
 *         description: Invalid request data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Discussion not found
 */

router.post('/:discussionId/comments', protect, discussionController.addComment);

module.exports = router;
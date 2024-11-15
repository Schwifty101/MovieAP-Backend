const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get dashboard statistics
 *     description: Retrieve various admin metrics like total users, reviews, and popular genres.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                     analytics:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                         newUsers:
 *                           type: integer
 *                         totalReviews:
 *                           type: integer
 *                         newReviews:
 *                           type: integer
 *                         popularGenres:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               genre:
 *                                 type: string
 *                               count:
 *                                 type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/dashboard', adminController.getDashboardStats);

/**
 * @swagger
 * /api/v1/admin/moderate:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Moderate content
 *     description: Admin can hide/unhide reviews or lock/unlock discussions.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contentId:
 *                 type: string
 *                 description: The ID of the content to moderate
 *               contentType:
 *                 type: string
 *                 enum: [review, discussion]
 *                 description: The type of content to moderate
 *               action:
 *                 type: string
 *                 enum: [hide, unhide, lock, unlock]
 *                 description: The moderation action to perform
 *     responses:
 *       200:
 *         description: Content moderated successfully
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
 *                     result:
 *                       type: object
 *                       description: The updated content
 *       400:
 *         description: Invalid input data or action
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Content not found
 */

router.post('/moderate', adminController.moderateContent);

module.exports = router;
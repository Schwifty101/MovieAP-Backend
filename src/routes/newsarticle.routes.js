// routes/newsarticle.routes.js
const express = require('express');
const router = express.Router();
const newsArticleController = require('../controllers/newsarticle.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// Route to add a new article
router.post('/add', authenticate, newsArticleController.addArticle);

// Route to get articles by category (e.g., "Movies", "Actors")
router.get('/category/:category', newsArticleController.getArticlesByCategory);

// Route to get the latest 10 articles
router.get('/recent', newsArticleController.getRecentArticles);

// Update an article
router.put('/articles/:id', authenticate, isAdmin, newsArticleController.updateArticle);

// Delete an article
router.delete('/articles/:id', authenticate, isAdmin, newsArticleController.deleteArticle);

module.exports = router;

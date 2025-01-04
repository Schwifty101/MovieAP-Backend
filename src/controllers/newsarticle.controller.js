// controllers/newsArticleController.js
const NewsArticle = require('../models/newsarticle.model');

// Add a new article
exports.addArticle = async (req, res) => {
  const { title, content, category, publicationDate, source } = req.body;
  const authorId = req.user.id; // Assuming req.user.id is available from the authentication middleware

  try {
    const article = new NewsArticle({
      title,
      content,
      category,
      author: authorId,
      publicationDate,
      source,
    });

    await article.save();
    res.status(201).json({ message: 'Article added successfully', article });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add article', error });
  }
};

// Get articles by category
exports.getArticlesByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const articles = await NewsArticle.find({ category }).sort({ publicationDate: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve articles', error });
  }
};

// Get recent articles
exports.getRecentArticles = async (req, res) => {
  try {
    const recentArticles = await NewsArticle.find().sort({ publicationDate: -1 }).limit(10);
    res.json(recentArticles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve recent articles', error });
  }
};

// Update an article
exports.updateArticle = async (req, res) => {
  const { id } = req.params; // Article ID from the request parameters
  const { title, content, category, publicationDate, source } = req.body;
  const authorId = req.user.id; // Assuming req.user.id is available from the authentication middleware

  try {
    const article = await NewsArticle.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if the user is the author or an admin
    if (article.author.toString() !== authorId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    // Convert publicationDate to Date object if it's a string
    const date = new Date(publicationDate);

    // Update article fields
    article.title = title || article.title;
    article.content = content || article.content;
    article.category = category || article.category;
    article.publicationDate = date || article.publicationDate;
    article.source = source || article.source;

    await article.save();
    res.json({ message: 'Article updated successfully', article });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update article', error });
  }
};

// Delete an article
exports.deleteArticle = async (req, res) => {
  const { id } = req.params; // Article ID from the request parameters
  const authorId = req.user.id; // Assuming req.user.id is available from the authentication middleware

  try {
    const article = await NewsArticle.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if the user is the author or an admin
    if (article.author.toString() !== authorId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    await article.remove();
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete article', error });
  }
};

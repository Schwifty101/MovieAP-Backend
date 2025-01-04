// models/newsarticle.model.js
const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Movies', 'Actors', 'Projects', 'Industry Updates'],
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  publicationDate: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('NewsArticle', newsArticleSchema);

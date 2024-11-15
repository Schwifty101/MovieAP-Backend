const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['movie', 'actor', 'genre', 'general']
  },
  relatedMovie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  },
  relatedPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    likes: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isLocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Discussion', discussionSchema);
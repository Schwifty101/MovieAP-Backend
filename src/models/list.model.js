const mongoose = require('mongoose');

/**
 * Mongoose schema for movie lists
 * Allows users to create and share curated collections of movies
 * Lists can be public or private and other users can follow public lists
 */
const listSchema = new mongoose.Schema({
  // Name of the list (required)
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Optional description of the list's theme or purpose
  description: {
    type: String,
    trim: true
  },
  // Reference to the user who created the list
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Array of movie references contained in the list
  movies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  // Controls list visibility - public lists can be viewed by anyone
  isPublic: {
    type: Boolean,
    default: true
  },
  // Array of users following this list (only applicable for public lists)
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Timestamps for list creation and updates
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('List', listSchema);
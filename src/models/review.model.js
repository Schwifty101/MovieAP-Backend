const mongoose = require('mongoose');

/**
 * Mongoose schema for movie reviews
 * Stores user reviews and ratings for movies in the application
 */
const reviewSchema = new mongoose.Schema({
  // Reference to the user who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to the movie being reviewed
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie', 
    required: true
  },
  // User's rating from 1-5 stars
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // User's written review/comment
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000 // Limit comment length to 1000 characters
  },
  // Timestamps for review creation and updates
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index on user and movie fields to ensure a user can only review a movie once
// The {unique: true} option prevents duplicate reviews from the same user for the same movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
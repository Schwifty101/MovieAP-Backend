const mongoose = require('mongoose');

/**
 * Mongoose schema for movie discussions
 * Enables users to create and participate in discussions about specific movies
 * Includes support for threaded comments and tracks creation timestamps
 */
const discussionSchema = new mongoose.Schema({
  // Title of the discussion thread (required)
  title: {
    type: String,
    required: true,
    trim: true // Removes whitespace from both ends
  },
  // Main content/body of the discussion post (required)
  content: {
    type: String,
    required: true
  },
  // Reference to the movie this discussion is about
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie', // References the Movie model
    required: true
  },
  // Reference to the user who created the discussion
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: true
  },
  // Array of comment objects on this discussion
  comments: [{
    // Reference to the user who wrote the comment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Content of the comment (required)
    content: {
      type: String,
      required: true
    },
    // Timestamp when comment was created
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Timestamp when discussion was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the Discussion model
module.exports = mongoose.model('Discussion', discussionSchema);
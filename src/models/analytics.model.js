const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  metrics: {
    totalUsers: Number,
    activeUsers: Number,
    newUsers: Number,
    totalReviews: Number,
    newReviews: Number,
    popularGenres: [{
      genre: String,
      count: Number
    }],
    popularMovies: [{
      movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
      },
      views: Number,
      reviews: Number
    }],
    userEngagement: {
      reviews: Number,
      comments: Number,
      lists: Number,
      discussions: Number
    }
  }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
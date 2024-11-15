const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  genre: [{
    type: String,
    required: true
  }],
  director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true
  },
  cast: [{
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person'
    },
    role: String
  }],
  releaseDate: {
    type: Date,
    required: true
  },
  runtime: {
    type: Number,
    required: true
  },
  synopsis: {
    type: String,
    required: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  ageRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17']
  },
  trivia: [{
    type: String
  }],
  goofs: [{
    type: String
  }],
  soundtrack: [{
    title: String,
    artist: String
  }],
  coverImage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Movie', movieSchema);
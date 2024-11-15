const mongoose = require('mongoose');

const boxOfficeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  openingWeekend: {
    domestic: Number,
    international: Number,
    date: Date
  },
  totalEarnings: {
    domestic: Number,
    international: Number,
    worldwide: Number
  },
  budget: {
    production: Number,
    marketing: Number
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BoxOffice', boxOfficeSchema);
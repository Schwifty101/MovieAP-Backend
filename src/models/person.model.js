const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  biography: {
    type: String
  },
  birthDate: {
    type: Date
  },
  nationality: {
    type: String
  },
  photo: {
    type: String
  },
  awards: [{
    name: String,
    year: Number,
    category: String
  }],
  filmography: [{
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    role: String,
    year: Number
  }]
});

module.exports = mongoose.model('Person', personSchema);
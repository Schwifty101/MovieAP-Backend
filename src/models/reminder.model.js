const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  notified: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Reminder', reminderSchema);

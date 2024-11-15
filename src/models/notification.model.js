const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['new_release', 'trailer', 'reminder', 'news'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  relatedMovie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
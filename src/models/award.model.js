const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientType',
    required: true
  },
  recipientType: {
    type: String,
    required: true,
    enum: ['Movie', 'Person']
  },
  isNomination: {
    type: Boolean,
    default: false
  },
  ceremony: {
    type: String,
    required: true,
    enum: ['Academy Awards', 'Golden Globes', 'BAFTA', 'Emmy Awards', 'Other']
  }
});

module.exports = mongoose.model('Award', awardSchema);
const mongoose = require('mongoose');
const confessionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxLength: 500
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  author: {
    type: String,
    default: null
  },
  userId: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  likedBy: {
    type: [String], // Array of user IDs who liked the confession
    default: []
  },
  dislikedBy: {
    type: [String], // Array of user IDs who disliked the confession
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Confession', confessionSchema);
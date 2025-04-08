const mongoose = require('mongoose');
const replySchema = new mongoose.Schema({
  confessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Confession',
    required: true
  },
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
  timestamp: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Reply', replySchema);
 
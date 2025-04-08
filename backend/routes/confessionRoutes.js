const express = require('express');
const router = express.Router();
const {
  createConfession,
  getAllConfessions,
  likeConfession,
  dislikeConfession,
  addReply,
  getReplies
} = require('../controllers/confessionController');
// Confession routes
router.post('/', createConfession);
router.get('/', getAllConfessions);
router.post('/:id/like', likeConfession); // Ensure frontend sends { userId }
router.post('/:id/dislike', dislikeConfession); // Ensure frontend sends { userId }
router.post('/:id/replies', addReply);
router.get('/:id/replies', getReplies);
module.exports = router;
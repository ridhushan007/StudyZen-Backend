const Confession = require('../models/Confession');
const Reply = require('../models/Reply');
const analyzeText = require('../services/moderator');

// Create a new confession
const createConfession = async (req, res, next) => {
  try {
    const { text, isAnonymous, author, userId } = req.body;

    if (!text) return res.status(400).json({ message: 'Confession text is required' });
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    // Moderate the confession text
    const { isToxic, isInsult, isThreat, isExplicit, isSevereToxic, isHateSpeech } = await analyzeText(text);

    if (isToxic || isInsult || isThreat || isExplicit || isSevereToxic || isHateSpeech) {
      return res.status(400).json({ message: 'Inappropriate content detected. Please modify your confession.' });
    }

    const confession = new Confession({
      text,
      isAnonymous,
      author: isAnonymous ? null : author,
      userId,
      likedBy: [],
      dislikedBy: [],
      likes: 0,
      dislikes: 0
    });

    const savedConfession = await confession.save();

    const replies = await Reply.find({ confessionId: savedConfession._id }).sort({ timestamp: -1 });

    const confessionWithReplies = {
      ...savedConfession.toObject(),
      replies
    };

    req.io.emit('newConfession', confessionWithReplies);
    return res.status(201).json(confessionWithReplies);
  } catch (error) {
    console.error('Error creating confession:', error);
    next({ status: 500, message: 'Failed to create confession' });
  }
};

// Get all confessions with their replies
const getAllConfessions = async (req, res, next) => {
  try {
    // Get all confessions sorted by timestamp (newest first)
    const confessions = await Confession.find().sort({ timestamp: -1 }).limit(50);
    // Get all replies
    const confessionIds = confessions.map(c => c._id);
    const allReplies = await Reply.find({ confessionId: { $in: confessionIds } }).sort({ timestamp: 1 });
    // Group replies by confession ID
    const repliesByConfession = {};
    allReplies.forEach(reply => {
      const confId = reply.confessionId.toString();
      if (!repliesByConfession[confId]) {
        repliesByConfession[confId] = [];
      }
      repliesByConfession[confId].push(reply);
    });
    // Add replies to each confession
    const confessionsWithReplies = confessions.map(confession => {
      const confId = confession._id.toString();
      return {
        ...confession.toObject(),
        replies: repliesByConfession[confId] || []
      };
    });
    return res.status(200).json(confessionsWithReplies);
  } catch (error) {
    console.error('Error fetching confessions:', error);
    next({ status: 500, message: 'Failed to retrieve confessions' });
  }
};
// Like a confession
const likeConfession = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const confession = await Confession.findById(req.params.id);
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }
    // Check if user already liked this confession
    if (confession.likedBy.includes(userId)) {
      // User is unliking the confession
      confession.likedBy = confession.likedBy.filter(id => id !== userId);
      confession.likes = Math.max(0, confession.likes - 1);
    } else {
      // User is liking the confession
      // If user previously disliked, remove the dislike
      if (confession.dislikedBy.includes(userId)) {
        confession.dislikedBy = confession.dislikedBy.filter(id => id !== userId);
        confession.dislikes = Math.max(0, confession.dislikes - 1);
      }
      // Add the like
      confession.likedBy.push(userId);
      confession.likes += 1;
    }
    const updatedConfession = await confession.save();
    // Get replies for this confession
    const replies = await Reply.find({ confessionId: updatedConfession._id }).sort({ timestamp: -1 });
    // Create full response object with replies
    const confessionWithReplies = {
      ...updatedConfession.toObject(),
      replies: replies
    };
    // Emit event to all connected clients
    req.io.emit('confessionUpdated', confessionWithReplies);
    return res.status(200).json(confessionWithReplies);
  } catch (error) {
    console.error('Error liking confession:', error);
    next({ status: 500, message: 'Failed to like confession' });
  }
};
// Dislike a confession
const dislikeConfession = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const confession = await Confession.findById(req.params.id);
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }
    // Check if user already disliked this confession
    if (confession.dislikedBy.includes(userId)) {
      // User is removing their dislike
      confession.dislikedBy = confession.dislikedBy.filter(id => id !== userId);
      confession.dislikes = Math.max(0, confession.dislikes - 1);
    } else {
      // User is disliking the confession
      // If user previously liked, remove the like
      if (confession.likedBy.includes(userId)) {
        confession.likedBy = confession.likedBy.filter(id => id !== userId);
        confession.likes = Math.max(0, confession.likes - 1);
      }
      // Add the dislike
      confession.dislikedBy.push(userId);
      confession.dislikes += 1;
    }
    const updatedConfession = await confession.save();
    // Get replies for this confession
    const replies = await Reply.find({ confessionId: updatedConfession._id }).sort({ timestamp: -1 });
    // Create full response object with replies
    const confessionWithReplies = {
      ...updatedConfession.toObject(),
      replies: replies
    };
    // Emit event to all connected clients
    req.io.emit('confessionUpdated', confessionWithReplies);
    return res.status(200).json(confessionWithReplies);
  } catch (error) {
    console.error('Error disliking confession:', error);
    next({ status: 500, message: 'Failed to dislike confession' });
  }
};
// Add a reply to a confession
const addReply = async (req, res, next) => {
  try {
    const { text, isAnonymous, author, userId } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' });
    }
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const confession = await Confession.findById(req.params.id);
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    // Moderate the reply text
    const { isToxic, isInsult, isThreat, isExplicit, isSevereToxic, isHateSpeech } = await analyzeText(text);

    if (isToxic || isInsult || isThreat || isExplicit || isSevereToxic || isHateSpeech) {
      return res.status(400).json({ message: 'Reply contains inappropriate content. Please modify your reply.' });
    }

    // Save the reply if it passes moderation
    const reply = new Reply({
      confessionId: req.params.id,
      text,
      isAnonymous,
      author: isAnonymous ? null : author,
      userId
    });

    const savedReply = await reply.save();

    // Emit event to all connected clients
    req.io.emit('newReply', {
      confessionId: req.params.id,
      reply: savedReply
    });

    return res.status(201).json(savedReply);
  } catch (error) {
    console.error('Error adding reply:', error);
    next({ status: 500, message: 'Failed to add reply' });
  }
};

// Get replies for a confession
const getReplies = async (req, res, next) => {
  try {
    const replies = await Reply.find({ confessionId: req.params.id }).sort({ timestamp: -1 });
    return res.status(200).json(replies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    next({ status: 500, message: 'Failed to retrieve replies' });
  }
};
module.exports = {
  createConfession,
  getAllConfessions,
  likeConfession,
  dislikeConfession,
  addReply,
  getReplies
};
 
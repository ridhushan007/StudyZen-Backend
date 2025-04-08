const mongoose = require('mongoose');

const QuizSubmissionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  user: { type: String, required: true }, 
  answers: [{ type: String }],
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

// Check if the model is already defined to prevent overwriting during hot reload
const QuizSubmission = mongoose.models.QuizSubmission || 
  mongoose.model('QuizSubmission', QuizSubmissionSchema);

module.exports = QuizSubmission;
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, required: true }
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  timeLimit: { type: Number, required: true },
  questions: [QuestionSchema],
  createdBy: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

// Check if the model is already defined to prevent overwriting during hot reload
const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);

module.exports = mongoose.model('Quiz', QuizSchema);
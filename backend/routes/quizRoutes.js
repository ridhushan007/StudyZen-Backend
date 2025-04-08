const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Quiz routes
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);
router.post('/', quizController.createQuiz);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);
router.post('/submit', quizController.submitQuiz);

module.exports = router;
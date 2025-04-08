const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');

router.get('/', journalController.getJournalEntries);
router.post('/', journalController.createJournalEntry);
router.delete('/:id', journalController.deleteJournalEntry);
router.post('/:id/recommendations', journalController.generateRecommendations); // New route

module.exports = router;
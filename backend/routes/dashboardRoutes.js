const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getStats);
router.get('/activities', dashboardController.getActivities);
router.get('/progress', dashboardController.getProgress);

module.exports = router;
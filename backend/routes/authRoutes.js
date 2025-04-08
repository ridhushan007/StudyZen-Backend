// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User registration
router.post('/register', authController.signup);

// User login
router.post('/login', authController.login);

// Request password reset
router.post('/forgot-password', authController.forgotPassword);

// Reset password using token and new password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
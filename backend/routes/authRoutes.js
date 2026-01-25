const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with strict rate limiting
// Note: Public registration is disabled - only admins can create accounts
router.post('/login', authLimiter, authController.login);
router.post('/first-time-login', authLimiter, authController.firstTimeLogin);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.put('/update-password', protect, authController.updatePassword);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;

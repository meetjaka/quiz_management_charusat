const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { checkQuizAssignment } = require('../middleware/quizAssignment');

// All routes require student authentication
router.use(protect);
router.use(authorize('student'));

// ============================================
// ASSIGNED QUIZZES
// ============================================
router.get('/quizzes', studentController.getMyAssignedQuizzes);

// Routes that require quiz assignment validation
router.get('/quizzes/:id', checkQuizAssignment, studentController.getQuizDetails);

// ============================================
// QUIZ ATTEMPTS
// ============================================
router.post('/quizzes/:id/start', checkQuizAssignment, studentController.startQuizAttempt);
router.put('/attempts/:attemptId/answer', studentController.saveAnswer);
router.post('/attempts/:attemptId/submit', studentController.submitQuizAttempt);

// ============================================
// RESULTS
// ============================================
router.get('/results', studentController.getAllMyResults);
router.get('/quizzes/:quizId/results', studentController.getMyQuizResults);
router.get('/attempts/:attemptId/details', studentController.getAttemptDetails);

// ============================================
// PERFORMANCE ANALYTICS
// ============================================
router.get('/analytics', studentController.getMyAnalytics);

// ============================================
// PROFILE MANAGEMENT
// ============================================
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

module.exports = router;

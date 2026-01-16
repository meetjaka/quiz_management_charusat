const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// ============================================
// USER MANAGEMENT
// ============================================
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// ============================================
// QUIZ VIEWING (Read-Only)
// ============================================
router.get('/quizzes', adminController.getAllQuizzes);
router.get('/quizzes/:id', adminController.getQuizById);

// ============================================
// ANALYTICS
// ============================================
router.get('/analytics/system', adminController.getSystemAnalytics);
router.get('/analytics/departments', adminController.getDepartmentAnalytics);
router.get('/analytics/coordinators', adminController.getCoordinatorAnalytics);

// ============================================
// DATA EXPORT
// ============================================
router.get('/export/users', adminController.exportUsers);
router.get('/export/quiz-results/:quizId', adminController.exportQuizResults);

module.exports = router;

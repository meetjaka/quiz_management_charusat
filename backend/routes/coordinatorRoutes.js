const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinatorController');
const { protect, authorize } = require('../middleware/auth');
const { checkQuizOwnership } = require('../middleware/quizOwnership');
const { upload } = require('../utils/bulkUpload');

// All routes require coordinator authentication
router.use(protect);
router.use(authorize('coordinator'));

// ============================================
// QUIZ MANAGEMENT (Own Quizzes Only)
// ============================================
router.get('/quizzes', coordinatorController.getMyQuizzes);
router.post('/quizzes', coordinatorController.createQuiz);

// Excel upload route for creating quiz from Excel file
router.post('/quizzes/upload-excel', upload.single('file'), coordinatorController.uploadQuizExcel);

// Routes that require quiz ownership validation
router.get('/quizzes/:id', checkQuizOwnership, coordinatorController.getMyQuizById);
router.put('/quizzes/:id', checkQuizOwnership, coordinatorController.updateQuiz);
router.delete('/quizzes/:id', checkQuizOwnership, coordinatorController.deleteQuiz);

// ============================================
// QUESTION MANAGEMENT
// ============================================
router.get('/quizzes/:id/questions', checkQuizOwnership, coordinatorController.getQuestions);
router.post('/quizzes/:id/questions', checkQuizOwnership, coordinatorController.addQuestion);
router.post('/quizzes/:id/questions/bulk', checkQuizOwnership, coordinatorController.addBulkQuestions);
router.put('/quizzes/:id/questions/:questionId', checkQuizOwnership, coordinatorController.updateQuestion);
router.delete('/quizzes/:id/questions/:questionId', checkQuizOwnership, coordinatorController.deleteQuestion);

// Bulk upload questions
router.post('/questions/bulk-upload', upload.single('file'), coordinatorController.bulkUploadQuestions);
router.get('/questions/download-template', coordinatorController.downloadQuestionTemplate);

// ============================================
// QUIZ ASSIGNMENT
// ============================================
router.post('/quizzes/:id/assign', checkQuizOwnership, coordinatorController.assignQuizToStudents);
router.get('/quizzes/:id/assigned-students', checkQuizOwnership, coordinatorController.getAssignedStudents);
router.delete('/quizzes/:id/assigned-students/:studentId', checkQuizOwnership, coordinatorController.removeStudentAssignment);

// ============================================
// RESULTS & ANALYTICS (Own Quizzes Only)
// ============================================
router.get('/quizzes/:id/results', checkQuizOwnership, coordinatorController.getQuizResults);
router.get('/quizzes/:id/analytics', checkQuizOwnership, coordinatorController.getQuizAnalytics);
router.get('/analytics', coordinatorController.getMyAnalytics);

// ============================================
// QUESTION BANK
// ============================================
router.get('/question-bank', coordinatorController.getQuestionBank);
router.post('/question-bank', coordinatorController.addToQuestionBank);
router.delete('/question-bank/:questionId', coordinatorController.deleteFromQuestionBank);

// ============================================
// STUDENT LIST
// ============================================
router.get('/students', coordinatorController.getAllStudents);

module.exports = router;

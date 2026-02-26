const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const {
  submissionLimiter,
  answerSaveLimiter,
} = require("../middleware/rateLimiter");
const { protect, authorize } = require("../middleware/auth");
const { checkQuizAssignment } = require("../middleware/quizAssignment");
const quizSubmissionOptimizer = require("../utils/quizSubmissionOptimizer");

// All routes require student authentication
router.use(protect);
router.use(authorize("student"));

// ============================================
// ASSIGNED QUIZZES
// ============================================
router.get("/quizzes", studentController.getMyAssignedQuizzes);

// Routes that require quiz assignment validation
router.get(
  "/quizzes/:id",
  checkQuizAssignment,
  studentController.getQuizDetails,
);

// ============================================
// QUIZ ATTEMPTS
// ============================================
router.post(
  "/quizzes/:id/start",
  checkQuizAssignment,
  studentController.startQuizAttempt,
);

// OPTIMIZED SUBMISSION ENDPOINT - Use submissionLimiter for rate limiting
router.put(
  "/attempts/:attemptId/answer",
  answerSaveLimiter,
  quizSubmissionOptimizer.saveAnswerOptimized,
);

router.post(
  "/attempts/:attemptId/submit",
  submissionLimiter,
  quizSubmissionOptimizer.submitQuizAttemptOptimized,
);

router.post(
  "/attempts/:attemptId/tab-switch",
  studentController.reportTabSwitch,
);

// ============================================
// RESULTS
// ============================================
router.get("/results", studentController.getAllMyResults);
router.get("/quizzes/:quizId/results", studentController.getMyQuizResults);
router.get("/attempts/:attemptId/details", studentController.getAttemptDetails);

// ============================================
// PERFORMANCE ANALYTICS
// ============================================
router.get("/analytics", quizSubmissionOptimizer.getMyAnalyticsOptimized);

// ============================================
// PROFILE MANAGEMENT
// ============================================
router.get("/profile", studentController.getProfile);
router.put("/profile", studentController.updateProfile);

module.exports = router;

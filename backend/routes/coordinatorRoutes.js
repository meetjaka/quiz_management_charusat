const express = require("express");
const router = express.Router();
const {
  protect,
  isCoordinatorOrAdmin,
} = require("../middleware/authMiddleware");

const {
  getAssignedQuizzes,
  getQuizDetails,
  updateQuizMetadata,
  getQuizResults,
  getQuizAttempts,
  exportQuizResults,
  getQuizAnalytics,
} = require("../controllers/coordinatorController");

// Apply authentication and authorization to all routes
router.use(protect);
router.use(isCoordinatorOrAdmin);

// Get assigned quizzes
router.get("/quizzes", getAssignedQuizzes);

// Get quiz details
router.get("/quizzes/:id", getQuizDetails);

// Update quiz metadata (time, duration only)
router.put("/quizzes/:id/metadata", updateQuizMetadata);

// Get quiz results
router.get("/quizzes/:id/results", getQuizResults);

// Get quiz attempts
router.get("/quizzes/:id/attempts", getQuizAttempts);

// Export quiz results to Excel
router.get("/quizzes/:id/export", exportQuizResults);

// Get quiz analytics
router.get("/quizzes/:id/analytics", getQuizAnalytics);

module.exports = router;

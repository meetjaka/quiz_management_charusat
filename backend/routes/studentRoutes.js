const express = require("express");
const router = express.Router();
const { protect, isStudent } = require("../middleware/authMiddleware");
const { quizLimiter } = require("../middleware/rateLimiter");

const {
  getAvailableQuizzes,
  getQuizDetails,
  startQuizAttempt,
  submitAnswer,
  submitQuizAttempt,
  reportTabSwitch,
  getMyAttempts,
  getMyResults,
  getResultById,
} = require("../controllers/studentController");

// Apply authentication and authorization to all routes
router.use(protect);
router.use(isStudent);

// Get available quizzes for student
router.get("/quizzes/available", getAvailableQuizzes);

// Get quiz details before starting
router.get("/quizzes/:id/details", getQuizDetails);

// Start quiz attempt
router.post("/quizzes/:id/start", quizLimiter, startQuizAttempt);

// Submit answer for a question
router.put("/attempts/:attemptId/answer", submitAnswer);

// Submit quiz attempt
router.post("/attempts/:attemptId/submit", submitQuizAttempt);

// Report tab switch during quiz
router.post("/attempts/:attemptId/tab-switch", reportTabSwitch);

// Get my quiz attempts
router.get("/attempts", getMyAttempts);

// Get my results
router.get("/results", getMyResults);

// Get specific result details
router.get("/results/:id", getResultById);

module.exports = router;

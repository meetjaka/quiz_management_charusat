const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");
const { auditMiddleware } = require("../middleware/auditMiddleware");

// User management controllers
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkUploadStudents,
  toggleUserStatus,
  upload,
} = require("../controllers/adminUserController");

// Quiz management controllers
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  createQuizFromExcel,
  updateQuiz,
  deleteQuiz,
  assignCoordinators,
  toggleQuizActive,
  toggleQuizPublish,
  invalidateAttempt,
  addQuestion,
} = require("../controllers/adminQuizController");

// Analytics controllers
const {
  getDashboardAnalytics,
  getQuizAnalytics,
  getStudentAnalytics,
  getSystemAnalytics,
} = require("../controllers/adminAnalyticsController");

// Apply authentication and authorization to all routes
router.use(protect);
router.use(isAdmin);

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users with filters
router.get("/users", getUsers);

// Get single user
router.get("/users/:id", getUserById);

// Create single user
router.post("/users", auditMiddleware("CREATE_USER", "User"), createUser);

// Update user
router.put("/users/:id", auditMiddleware("UPDATE_USER", "User"), updateUser);

// Delete user
router.delete("/users/:id", auditMiddleware("DELETE_USER", "User"), deleteUser);

// Bulk upload students from Excel
router.post(
  "/users/bulk-upload",
  upload.single("file"),
  auditMiddleware("UPLOAD_EXCEL", "User"),
  bulkUploadStudents
);

// Toggle user active status
router.patch("/users/:id/toggle-status", toggleUserStatus);

// ==================== QUIZ MANAGEMENT ROUTES ====================

// Get all quizzes with filters
router.get("/quizzes", getQuizzes);

// Get single quiz with questions
router.get("/quizzes/:id", getQuizById);

// Create quiz manually
router.post("/quizzes", auditMiddleware("CREATE_QUIZ", "Quiz"), createQuiz);

// Create quiz from Excel upload
router.post(
  "/quizzes/upload-excel",
  upload.single("file"),
  auditMiddleware("UPLOAD_EXCEL", "Quiz"),
  createQuizFromExcel
);

// Add question to quiz
router.post("/quizzes/add-question", addQuestion);

// Update quiz
router.put("/quizzes/:id", auditMiddleware("UPDATE_QUIZ", "Quiz"), updateQuiz);

// Delete quiz
router.delete(
  "/quizzes/:id",
  auditMiddleware("DELETE_QUIZ", "Quiz"),
  deleteQuiz
);

// Assign coordinators to quiz
router.put("/quizzes/:id/assign-coordinators", assignCoordinators);

// Toggle quiz active status
router.patch("/quizzes/:id/toggle-active", toggleQuizActive);

// Toggle quiz published status
router.patch("/quizzes/:id/toggle-publish", toggleQuizPublish);

// Invalidate student quiz attempt
router.post(
  "/quizzes/:quizId/invalidate-attempt/:attemptId",
  auditMiddleware("INVALIDATE_ATTEMPT", "QuizAttempt"),
  invalidateAttempt
);

// ==================== ANALYTICS ROUTES ====================

// Get dashboard analytics
router.get("/analytics/dashboard", getDashboardAnalytics);

// Get quiz-specific analytics
router.get("/analytics/quiz/:id", getQuizAnalytics);

// Get student performance analytics
router.get("/analytics/student/:id", getStudentAnalytics);

// Get system-wide analytics
router.get("/analytics/system", getSystemAnalytics);

module.exports = router;

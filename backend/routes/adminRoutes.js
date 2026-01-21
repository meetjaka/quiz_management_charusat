const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../utils/bulkUpload");

// All routes require admin authentication
router.use(protect);
router.use(authorize("admin"));

// ============================================
// USER MANAGEMENT
// ============================================
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// ============================================
// QUIZ MANAGEMENT
// ============================================
router.get("/quizzes", adminController.getAllQuizzes);
router.get("/quizzes/:id", adminController.getQuizById);
router.post("/quizzes", adminController.createQuiz);
router.post(
  "/quizzes/upload-excel",
  upload.single("file"),
  adminController.uploadQuizExcel,
);
router.post("/quizzes/add-question", adminController.addQuestionToQuiz);
router.put("/quizzes/:id", adminController.updateQuiz);
router.delete("/quizzes/:id", adminController.deleteQuiz);

// ============================================
// ANALYTICS
// ============================================
router.get("/analytics/system", adminController.getSystemAnalytics);
router.get("/analytics/departments", adminController.getDepartmentAnalytics);
router.get("/analytics/coordinators", adminController.getCoordinatorAnalytics);

// ============================================
// DATA EXPORT
// ============================================
router.get("/export/users", adminController.exportUsers);
router.get("/export/quiz-results/:quizId", adminController.exportQuizResults);

module.exports = router;

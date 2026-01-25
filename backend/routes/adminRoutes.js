const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../utils/bulkUpload");

// Test endpoint without auth
router.get("/test-template", async (req, res) => {
  try {
    const xlsx = require('xlsx');
    console.log('🧪 Test template endpoint called');
    
    const sampleData = [
      { email: "test@charusat.edu.in", password: "test123" }
    ];
    
    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Users");
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=test-template.xlsx');
    res.send(buffer);
    
    console.log('✅ Test template sent successfully');
  } catch (error) {
    console.error('❌ Test template error:', error);
    res.status(500).json({ error: error.message });
  }
});

// All routes require admin authentication
router.use(protect);
router.use(authorize("admin"));

// ============================================
// USER MANAGEMENT
// ============================================
router.get("/users", adminController.getAllUsers);
// Specific routes must come before parameterized routes
router.get("/users/download-template", adminController.downloadUserTemplate);
router.post("/users/bulk-create", upload.single("file"), adminController.bulkCreateUsers);
router.delete("/users/bulk", adminController.bulkDeleteUsers);
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

// ============================================
// SYSTEM FIXES (Temporary)
// ============================================
router.post("/fix-admin-first-login", adminController.fixAdminFirstLogin);

module.exports = router;

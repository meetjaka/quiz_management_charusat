const Quiz = require("../models/QuizNew");
const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");
const Result = require("../models/Result");
const User = require("../models/UserNew");
const { parseQuizExcel } = require("../utils/excelParser");
const { createAuditLog } = require("../middleware/auditMiddleware");
const { validateQuiz } = require("../utils/validators");
const fs = require("fs");

const getQuizzes = async (req, res) => {
  try {
    const { department, semester, subject, batch, isActive, isPublished } =
      req.query;

    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;
    if (batch) filter.batch = batch;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";

    const quizzes = await Quiz.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedCoordinators", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz with questions
// @route   GET /api/admin/quizzes/:id
// @access  Admin
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedCoordinators", "name email");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await Question.find({ quizId: quiz._id }).sort({
      order: 1,
    });

    res.json({
      success: true,
      data: {
        quiz,
        questions,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create quiz manually
// @route   POST /api/admin/quizzes
// @access  Admin
const createQuiz = async (req, res) => {
  try {
    const { error } = validateQuiz(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const quizData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const quiz = await Quiz.create(quizData);

    await createAuditLog({
      userId: req.user._id,
      action: "CREATE_QUIZ",
      resource: "Quiz",
      resourceId: quiz._id,
      details: { title: quiz.title, department: quiz.department },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create quiz from Excel upload
// @route   POST /api/admin/quizzes/upload-excel
// @access  Admin
const createQuizFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an Excel file" });
    }

    const {
      title,
      description,
      department,
      semester,
      subject,
      batch,
      startTime,
      endTime,
      duration,
      passingMarks,
    } = req.body;

    // Validate required quiz metadata
    if (
      !title ||
      !department ||
      !semester ||
      !subject ||
      !startTime ||
      !endTime ||
      !duration
    ) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: "Please provide all required quiz details",
      });
    }

    const filePath = req.file.path;
    const questions = parseQuizExcel(filePath);

    if (questions.length === 0) {
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json({ message: "No valid questions found in Excel file" });
    }

    // Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    // Create quiz
    const quiz = await Quiz.create({
      title,
      description,
      department,
      semester,
      subject,
      batch,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: parseInt(duration),
      totalMarks,
      passingMarks: passingMarks
        ? parseInt(passingMarks)
        : Math.floor(totalMarks * 0.4),
      createdBy: req.user._id,
      totalQuestions: questions.length,
    });

    // Create questions
    const questionDocs = questions.map((q) => ({
      ...q,
      quizId: quiz._id,
    }));

    await Question.insertMany(questionDocs);

    // Delete uploaded file
    fs.unlinkSync(filePath);

    await createAuditLog({
      userId: req.user._id,
      action: "UPLOAD_EXCEL",
      resource: "Quiz",
      resourceId: quiz._id,
      details: {
        title: quiz.title,
        questionsCount: questions.length,
        totalMarks,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully from Excel",
      data: {
        quiz,
        questionsCount: questions.length,
      },
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update quiz
// @route   PUT /api/admin/quizzes/:id
// @access  Admin
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      userId: req.user._id,
      action: "UPDATE_QUIZ",
      resource: "Quiz",
      resourceId: updatedQuiz._id,
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.json({
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete quiz and its questions
// @route   DELETE /api/admin/quizzes/:id
// @access  Admin
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check if quiz has attempts
    const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
    if (attemptCount > 0) {
      return res.status(400).json({
        message: `Cannot delete quiz with ${attemptCount} attempts. Consider deactivating instead.`,
      });
    }

    // Delete associated questions
    await Question.deleteMany({ quizId: quiz._id });

    // Delete quiz
    await Quiz.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user._id,
      action: "DELETE_QUIZ",
      resource: "Quiz",
      resourceId: quiz._id,
      details: { title: quiz.title },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.json({
      success: true,
      message: "Quiz and associated questions deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign coordinators to quiz
// @route   PUT /api/admin/quizzes/:id/assign-coordinators
// @access  Admin
const assignCoordinators = async (req, res) => {
  try {
    const { coordinatorIds } = req.body;

    if (!Array.isArray(coordinatorIds)) {
      return res
        .status(400)
        .json({ message: "coordinatorIds must be an array" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Verify all IDs are coordinators
    const coordinators = await User.find({
      _id: { $in: coordinatorIds },
      role: "coordinator",
    });

    if (coordinators.length !== coordinatorIds.length) {
      return res
        .status(400)
        .json({ message: "Some IDs are not valid coordinators" });
    }

    quiz.assignedCoordinators = coordinatorIds;
    await quiz.save();

    res.json({
      success: true,
      message: "Coordinators assigned successfully",
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle quiz active status
// @route   PATCH /api/admin/quizzes/:id/toggle-active
// @access  Admin
const toggleQuizActive = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();

    res.json({
      success: true,
      message: `Quiz ${
        quiz.isActive ? "activated" : "deactivated"
      } successfully`,
      data: { isActive: quiz.isActive },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle quiz published status
// @route   PATCH /api/admin/quizzes/:id/toggle-publish
// @access  Admin
const toggleQuizPublish = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    res.json({
      success: true,
      message: `Quiz ${
        quiz.isPublished ? "published" : "unpublished"
      } successfully`,
      data: { isPublished: quiz.isPublished },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Invalidate student quiz attempt
// @route   POST /api/admin/quizzes/:quizId/invalidate-attempt/:attemptId
// @access  Admin
const invalidateAttempt = async (req, res) => {
  try {
    const { quizId, attemptId } = req.params;
    const { reason } = req.body;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      quizId,
    });

    if (!attempt) {
      return res.status(404).json({ message: "Quiz attempt not found" });
    }

    attempt.status = "invalidated";
    if (reason) {
      attempt.warnings.push({
        type: `Invalidated by admin: ${reason}`,
        timestamp: new Date(),
      });
    }
    await attempt.save();

    // Delete associated result if exists
    await Result.findOneAndDelete({ attemptId: attempt._id });

    await createAuditLog({
      userId: req.user._id,
      action: "INVALIDATE_ATTEMPT",
      resource: "QuizAttempt",
      resourceId: attempt._id,
      details: { quizId, studentId: attempt.studentId, reason },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.json({
      success: true,
      message: "Quiz attempt invalidated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};

const Quiz = require("../models/QuizNew");
const QuizAttempt = require("../models/QuizAttempt");
const Result = require("../models/Result");
const User = require("../models/UserNew");
const { exportToExcel } = require("../utils/excelParser");
const path = require("path");

// @desc    Get assigned quizzes for coordinator
// @route   GET /api/coordinator/quizzes
// @access  Coordinator
const getAssignedQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      assignedCoordinators: req.user._id,
    })
      .populate("createdBy", "name email")
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

// @desc    Get quiz details with questions
// @route   GET /api/coordinator/quizzes/:id
// @access  Coordinator
const getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      assignedCoordinators: req.user._id,
    }).populate("createdBy", "name email");

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found or not assigned to you",
      });
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update quiz metadata (time, duration only)
// @route   PUT /api/coordinator/quizzes/:id/metadata
// @access  Coordinator
const updateQuizMetadata = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      assignedCoordinators: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found or not assigned to you",
      });
    }

    // Only allow specific fields to be updated
    const allowedUpdates = ["startTime", "endTime", "duration"];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message:
          "No valid fields to update. Allowed: startTime, endTime, duration",
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Quiz metadata updated successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz results
// @route   GET /api/coordinator/quizzes/:id/results
// @access  Coordinator
const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      assignedCoordinators: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found or not assigned to you",
      });
    }

    const results = await Result.find({ quizId: quiz._id })
      .populate("studentId", "name email enrollmentNumber department semester")
      .sort({ totalScore: -1 });

    // Calculate ranks
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz attempts
// @route   GET /api/coordinator/quizzes/:id/attempts
// @access  Coordinator
const getQuizAttempts = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      assignedCoordinators: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found or not assigned to you",
      });
    }

    const attempts = await QuizAttempt.find({ quizId: quiz._id })
      .populate("studentId", "name email enrollmentNumber department")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export quiz results to Excel
// @route   GET /api/coordinator/quizzes/:id/export
// @access  Coordinator
const exportQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      assignedCoordinators: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found or not assigned to you",
      });
    }

    const results = await Result.find({ quizId: quiz._id })
      .populate("studentId", "name email enrollmentNumber department semester")
      .sort({ totalScore: -1 });

    // Prepare data for Excel export
    const exportData = results.map((result, index) => ({
      Rank: index + 1,
      Name: result.studentId.name,
      "Enrollment Number": result.studentId.enrollmentNumber,
      Email: result.studentId.email,
      Department: result.studentId.department,
      Semester: result.studentId.semester,
      "Total Score": result.totalScore,
      "Max Score": result.maxScore,
      Percentage: result.percentage.toFixed(2),
      Status: result.isPassed ? "Passed" : "Failed",
      "Correct Answers": result.correctAnswers,
      "Incorrect Answers": result.incorrectAnswers,
      Unanswered: result.unanswered,
      "Time Taken (seconds)": result.timeTaken,
      "Submitted At": result.submittedAt.toLocaleString(),
    }));

    const filename = path.join(
      __dirname,
      "../uploads",
      `quiz-results-${quiz._id}-${Date.now()}.xlsx`
    );

    exportToExcel(exportData, filename);

    res.download(filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
      }
      // Delete file after download
      const fs = require("fs");
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz analytics
// @route   GET /api/coordinator/quizzes/:id/analytics
// @access  Coordinator
const getQuizAnalytics = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      assignedCoordinators: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found or not assigned to you",
      });
    }

    const totalAttempts = await QuizAttempt.countDocuments({
      quizId: quiz._id,
    });
    const completedAttempts = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      status: "submitted",
    });

    const results = await Result.find({ quizId: quiz._id });
    const passedCount = results.filter((r) => r.isPassed).length;
    const failedCount = results.filter((r) => !r.isPassed).length;

    const scores = results.map((r) => r.totalScore);
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    res.json({
      success: true,
      data: {
        quiz: {
          title: quiz.title,
          totalMarks: quiz.totalMarks,
          passingMarks: quiz.passingMarks,
        },
        attempts: {
          total: totalAttempts,
          completed: completedAttempts,
        },
        results: {
          passed: passedCount,
          failed: failedCount,
        },
        averageScore: averageScore.toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAssignedQuizzes,
  getQuizDetails,
  updateQuizMetadata,
  getQuizResults,
  getQuizAttempts,
  exportQuizResults,
  getQuizAnalytics,
};

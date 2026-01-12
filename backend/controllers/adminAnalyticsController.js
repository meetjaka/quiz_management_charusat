const Quiz = require("../models/QuizNew");
const QuizAttempt = require("../models/QuizAttempt");
const Result = require("../models/Result");
const User = require("../models/UserNew");

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics/dashboard
// @access  Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    // Total counts
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCoordinators = await User.countDocuments({
      role: "coordinator",
    });
    const totalQuizzes = await Quiz.countDocuments();
    const activeQuizzes = await Quiz.countDocuments({
      isActive: true,
      isPublished: true,
    });
    const totalAttempts = await QuizAttempt.countDocuments();

    // Recent activity
    const recentQuizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name email");

    const recentAttempts = await QuizAttempt.find({ status: "submitted" })
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate("studentId", "name email enrollmentNumber")
      .populate("quizId", "title");

    // Department-wise statistics
    const departmentStats = await User.aggregate([
      { $match: { role: "student" } },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalCoordinators,
          totalQuizzes,
          activeQuizzes,
          totalAttempts,
        },
        recentQuizzes,
        recentAttempts,
        departmentStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz analytics
// @route   GET /api/admin/analytics/quiz/:id
// @access  Admin
const getQuizAnalytics = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const totalAttempts = await QuizAttempt.countDocuments({
      quizId: quiz._id,
    });
    const completedAttempts = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      status: "submitted",
    });
    const inProgressAttempts = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      status: "in-progress",
    });

    // Get results
    const results = await Result.find({ quizId: quiz._id }).populate(
      "studentId",
      "name email enrollmentNumber department"
    );

    const passedCount = results.filter((r) => r.isPassed).length;
    const failedCount = results.filter((r) => !r.isPassed).length;

    // Calculate statistics
    const scores = results.map((r) => r.totalScore);
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Top performers
    const topPerformers = results
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    // Score distribution
    const scoreRanges = [
      { range: "0-20%", count: 0 },
      { range: "21-40%", count: 0 },
      { range: "41-60%", count: 0 },
      { range: "61-80%", count: 0 },
      { range: "81-100%", count: 0 },
    ];

    results.forEach((result) => {
      const percentage = result.percentage;
      if (percentage <= 20) scoreRanges[0].count++;
      else if (percentage <= 40) scoreRanges[1].count++;
      else if (percentage <= 60) scoreRanges[2].count++;
      else if (percentage <= 80) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });

    res.json({
      success: true,
      data: {
        quiz: {
          title: quiz.title,
          department: quiz.department,
          semester: quiz.semester,
          subject: quiz.subject,
          totalMarks: quiz.totalMarks,
          passingMarks: quiz.passingMarks,
        },
        attempts: {
          total: totalAttempts,
          completed: completedAttempts,
          inProgress: inProgressAttempts,
          attemptRate: ((completedAttempts / totalAttempts) * 100).toFixed(2),
        },
        results: {
          passed: passedCount,
          failed: failedCount,
          passPercentage:
            results.length > 0
              ? ((passedCount / results.length) * 100).toFixed(2)
              : 0,
        },
        scores: {
          average: averageScore.toFixed(2),
          highest: highestScore,
          lowest: lowestScore,
        },
        topPerformers,
        scoreDistribution: scoreRanges,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student performance analytics
// @route   GET /api/admin/analytics/student/:id
// @access  Admin
const getStudentAnalytics = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const attempts = await QuizAttempt.find({
      studentId: student._id,
    }).populate("quizId", "title subject totalMarks");

    const results = await Result.find({ studentId: student._id }).populate(
      "quizId",
      "title subject department semester"
    );

    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(
      (a) => a.status === "submitted"
    ).length;
    const passedQuizzes = results.filter((r) => r.isPassed).length;
    const failedQuizzes = results.filter((r) => !r.isPassed).length;

    const averageScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
        : 0;

    res.json({
      success: true,
      data: {
        student: {
          name: student.name,
          email: student.email,
          enrollmentNumber: student.enrollmentNumber,
          department: student.department,
          semester: student.semester,
        },
        overview: {
          totalAttempts,
          completedAttempts,
          passedQuizzes,
          failedQuizzes,
          averageScore: averageScore.toFixed(2),
        },
        attempts,
        results,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system-wide statistics
// @route   GET /api/admin/analytics/system
// @access  Admin
const getSystemAnalytics = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const quizzes = await Quiz.countDocuments();
    const attempts = await QuizAttempt.countDocuments();
    const results = await Result.countDocuments();

    // Role distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Quiz by department
    const quizzesByDepartment = await Quiz.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent activity timeline
    const recentActivity = await QuizAttempt.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("studentId", "name")
      .populate("quizId", "title")
      .select("createdAt status");

    res.json({
      success: true,
      data: {
        totals: {
          users,
          quizzes,
          attempts,
          results,
        },
        roleDistribution,
        quizzesByDepartment,
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardAnalytics,
  getQuizAnalytics,
  getStudentAnalytics,
  getSystemAnalytics,
};

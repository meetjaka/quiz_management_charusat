const Quiz = require("../models/QuizNew");
const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");
const Result = require("../models/Result");
const { createAuditLog } = require("../middleware/auditMiddleware");

// @desc    Get available quizzes for student
// @route   GET /api/student/quizzes/available
// @access  Student
const getAvailableQuizzes = async (req, res) => {
  try {
    const student = req.user;
    const currentTime = new Date();

    const quizzes = await Quiz.find({
      isActive: true,
      isPublished: true,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime },
      department: student.department,
      semester: student.semester,
      $or: [
        { batch: student.batch },
        { batch: { $exists: false } },
        { batch: null },
        { batch: "" },
      ],
    })
      .select("-__v")
      .sort({ startTime: 1 });

    // Check which quizzes student has already attempted
    const quizIds = quizzes.map((q) => q._id);
    const attempts = await QuizAttempt.find({
      studentId: student._id,
      quizId: { $in: quizIds },
    }).select("quizId status");

    const quizzesWithAttemptStatus = quizzes.map((quiz) => {
      const attempt = attempts.find(
        (a) => a.quizId.toString() === quiz._id.toString()
      );
      return {
        ...quiz.toObject(),
        hasAttempted: !!attempt,
        attemptStatus: attempt?.status || null,
      };
    });

    res.json({
      success: true,
      count: quizzesWithAttemptStatus.length,
      data: quizzesWithAttemptStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz details before starting
// @route   GET /api/student/quizzes/:id/details
// @access  Student
const getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check if quiz is available
    const currentTime = new Date();
    if (currentTime < quiz.startTime) {
      return res.status(400).json({ message: "Quiz has not started yet" });
    }

    if (currentTime > quiz.endTime) {
      return res.status(400).json({ message: "Quiz has ended" });
    }

    if (!quiz.isActive || !quiz.isPublished) {
      return res.status(400).json({ message: "Quiz is not available" });
    }

    // Check if student has already attempted
    const existingAttempt = await QuizAttempt.findOne({
      quizId: quiz._id,
      studentId: req.user._id,
    });

    if (existingAttempt) {
      return res.status(400).json({
        message: "You have already attempted this quiz",
        attemptStatus: existingAttempt.status,
      });
    }

    res.json({
      success: true,
      data: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        duration: quiz.duration,
        totalQuestions: quiz.totalQuestions,
        totalMarks: quiz.totalMarks,
        passingMarks: quiz.passingMarks,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start quiz attempt
// @route   POST /api/student/quizzes/:id/start
// @access  Student
const startQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Validate quiz availability
    const currentTime = new Date();
    if (currentTime < quiz.startTime || currentTime > quiz.endTime) {
      return res
        .status(400)
        .json({ message: "Quiz is not available at this time" });
    }

    if (!quiz.isActive || !quiz.isPublished) {
      return res.status(400).json({ message: "Quiz is not available" });
    }

    // Check for existing attempt
    const existingAttempt = await QuizAttempt.findOne({
      quizId: quiz._id,
      studentId: req.user._id,
    });

    if (existingAttempt) {
      return res
        .status(400)
        .json({ message: "You have already attempted this quiz" });
    }

    // Get questions
    const questions = await Question.find({ quizId: quiz._id })
      .select("-correctAnswer")
      .sort({ order: 1 });

    // Create attempt
    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      studentId: req.user._id,
      startedAt: new Date(),
      answers: questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: null,
        isCorrect: false,
        marksAwarded: 0,
      })),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    await createAuditLog({
      userId: req.user._id,
      action: "START_QUIZ",
      resource: "QuizAttempt",
      resourceId: attempt._id,
      details: { quizId: quiz._id, quizTitle: quiz.title },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.status(201).json({
      success: true,
      message: "Quiz attempt started",
      data: {
        attemptId: attempt._id,
        quiz: {
          title: quiz.title,
          duration: quiz.duration,
          totalMarks: quiz.totalMarks,
        },
        questions,
        startedAt: attempt.startedAt,
        timeLimit: quiz.duration * 60, // in seconds
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit answer for a question
// @route   PUT /api/student/attempts/:attemptId/answer
// @access  Student
const submitAnswer = async (req, res) => {
  try {
    const { questionId, selectedAnswer } = req.body;

    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      studentId: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({ message: "Quiz attempt not found" });
    }

    if (attempt.status !== "in-progress") {
      return res.status(400).json({ message: "Cannot modify submitted quiz" });
    }

    // Find the answer in the attempt
    const answerIndex = attempt.answers.findIndex(
      (a) => a.questionId.toString() === questionId
    );

    if (answerIndex === -1) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    // Update the answer
    attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
    await attempt.save();

    res.json({
      success: true,
      message: "Answer saved",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/student/attempts/:attemptId/submit
// @access  Student
const submitQuizAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      studentId: req.user._id,
    }).populate("quizId");

    if (!attempt) {
      return res.status(404).json({ message: "Quiz attempt not found" });
    }

    if (attempt.status !== "in-progress") {
      return res.status(400).json({ message: "Quiz already submitted" });
    }

    // Get questions with correct answers
    const questions = await Question.find({ quizId: attempt.quizId._id });
    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    // Calculate score
    let totalScore = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    attempt.answers.forEach((answer) => {
      const question = questionMap[answer.questionId.toString()];
      if (question) {
        if (!answer.selectedAnswer) {
          unanswered++;
        } else if (answer.selectedAnswer === question.correctAnswer) {
          answer.isCorrect = true;
          answer.marksAwarded = question.marks;
          totalScore += question.marks;
          correctAnswers++;
        } else {
          answer.isCorrect = false;
          incorrectAnswers++;
        }
      }
    });

    // Update attempt
    attempt.submittedAt = new Date();
    attempt.totalScore = totalScore;
    attempt.percentage = (totalScore / attempt.quizId.totalMarks) * 100;
    attempt.isPassed = totalScore >= attempt.quizId.passingMarks;
    attempt.status = req.body.isAutoSubmit ? "auto-submitted" : "submitted";
    await attempt.save();

    // Create result
    const result = await Result.create({
      quizId: attempt.quizId._id,
      studentId: req.user._id,
      attemptId: attempt._id,
      totalScore,
      maxScore: attempt.quizId.totalMarks,
      percentage: attempt.percentage,
      isPassed: attempt.isPassed,
      passingMarks: attempt.quizId.passingMarks,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      timeTaken: attempt.timeTaken,
      submittedAt: attempt.submittedAt,
    });

    // Update quiz total attempts
    await Quiz.findByIdAndUpdate(attempt.quizId._id, {
      $inc: { totalAttempts: 1 },
    });

    await createAuditLog({
      userId: req.user._id,
      action: "SUBMIT_QUIZ",
      resource: "QuizAttempt",
      resourceId: attempt._id,
      details: {
        quizId: attempt.quizId._id,
        score: totalScore,
        isPassed: attempt.isPassed,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        totalScore,
        maxScore: attempt.quizId.totalMarks,
        percentage: attempt.percentage.toFixed(2),
        isPassed: attempt.isPassed,
        correctAnswers,
        incorrectAnswers,
        unanswered,
        resultId: result._id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report tab switch during quiz
// @route   POST /api/student/attempts/:attemptId/tab-switch
// @access  Student
const reportTabSwitch = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      studentId: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({ message: "Quiz attempt not found" });
    }

    attempt.tabSwitchCount += 1;
    attempt.warnings.push({
      type: `Tab switch detected at ${new Date().toISOString()}`,
      timestamp: new Date(),
    });
    await attempt.save();

    res.json({
      success: true,
      message: "Tab switch recorded",
      warningCount: attempt.tabSwitchCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's quiz attempts
// @route   GET /api/student/attempts
// @access  Student
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ studentId: req.user._id })
      .populate("quizId", "title subject totalMarks passingMarks")
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

// @desc    Get student's results
// @route   GET /api/student/results
// @access  Student
const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user._id })
      .populate("quizId", "title subject department semester")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific result details
// @route   GET /api/student/results/:id
// @access  Student
const getResultById = async (req, res) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      studentId: req.user._id,
    }).populate("quizId", "title subject totalMarks passingMarks");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const attempt = await QuizAttempt.findById(result.attemptId);

    res.json({
      success: true,
      data: {
        result,
        attempt: {
          timeTaken: attempt.timeTaken,
          submittedAt: attempt.submittedAt,
          tabSwitchCount: attempt.tabSwitchCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableQuizzes,
  getQuizDetails,
  startQuizAttempt,
  submitAnswer,
  submitQuizAttempt,
  reportTabSwitch,
  getMyAttempts,
  getMyResults,
  getResultById,
};

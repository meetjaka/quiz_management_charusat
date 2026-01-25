const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAssignment = require('../models/QuizAssignment');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { sendQuizResultEmail } = require('../utils/emailService');

// ============================================
// ASSIGNED QUIZZES
// ============================================

// Get all quizzes assigned to this student
exports.getMyAssignedQuizzes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Get assigned quiz IDs
    const assignments = await QuizAssignment.find({ studentId: req.user._id })
      .select('quizId assignedAt');
    
    const quizIds = assignments.map(a => a.quizId);
    
    if (quizIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        data: []
      });
    }
    
    const query = { _id: { $in: quizIds } };
    
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const quizzes = await Quiz.find(query)
      .populate('coordinatorId', 'fullName department')
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Quiz.countDocuments(query);
    
    // Add attempt count and status for each quiz
    const quizzesWithStatus = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await QuizAttempt.find({
          quizId: quiz._id,
          studentId: req.user._id
        }).sort({ attemptNumber: -1 });
        
        const attemptCount = attempts.length;
        const lastAttempt = attempts[0];
        
        const now = new Date();
        const isAvailable = now >= quiz.startTime && now <= quiz.endTime;
        const canAttempt = isAvailable && 
                          quiz.status === 'published' && 
                          attemptCount < quiz.maxAttempts;
        
        return {
          ...quiz.toObject(),
          myStats: {
            attemptCount,
            maxAttempts: quiz.maxAttempts,
            canAttempt,
            isAvailable,
            lastAttempt: lastAttempt ? {
              attemptNumber: lastAttempt.attemptNumber,
              score: lastAttempt.totalScore,
              percentage: lastAttempt.percentage,
              status: lastAttempt.status,
              submittedAt: lastAttempt.submittedAt
            } : null
          }
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: quizzesWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned quizzes',
      error: error.message
    });
  }
};

// Get quiz details (must be assigned)
exports.getQuizDetails = async (req, res) => {
  try {
    // Quiz and assignment already verified by middleware
    const quiz = req.quiz;
    
    // Get attempt history
    const attempts = await QuizAttempt.find({
      quizId: quiz._id,
      studentId: req.user._id
    }).sort({ attemptNumber: -1 });
    
    const attemptCount = attempts.length;
    const canAttempt = attemptCount < quiz.maxAttempts && quiz.status === 'published';
    
    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          totalMarks: quiz.totalMarks,
          passingMarks: quiz.passingMarks,
          durationMinutes: quiz.durationMinutes,
          startTime: quiz.startTime,
          endTime: quiz.endTime,
          maxAttempts: quiz.maxAttempts,
          status: quiz.status,
          coordinator: quiz.coordinatorId
        },
        myStats: {
          attemptCount,
          canAttempt,
          attempts: attempts.map(a => ({
            attemptNumber: a.attemptNumber,
            score: a.totalScore,
            percentage: a.percentage,
            status: a.status,
            startedAt: a.startedAt,
            submittedAt: a.submittedAt
          }))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz details',
      error: error.message
    });
  }
};

// ============================================
// QUIZ ATTEMPTS
// ============================================

// Start quiz attempt
exports.startQuizAttempt = async (req, res) => {
  try {
    const quiz = req.quiz;
    
    // Check if quiz is published
    if (quiz.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Quiz is not available'
      });
    }
    
    // Check time window
    const now = new Date();
    if (now < quiz.startTime || now > quiz.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Quiz is not available at this time'
      });
    }
    
    // Check attempt count
    const attemptCount = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      studentId: req.user._id
    });
    
    if (attemptCount >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts (${quiz.maxAttempts}) reached`
      });
    }
    
    // Check for in-progress attempt
    const inProgressAttempt = await QuizAttempt.findOne({
      quizId: quiz._id,
      studentId: req.user._id,
      status: 'in_progress'
    });
    
    if (inProgressAttempt) {
      // Return existing attempt
      const questions = await Question.find({ quizId: quiz._id })
        .select('-correctAnswer')
        .sort({ orderNumber: 1 });
      
      return res.status(200).json({
        success: true,
        message: 'Resuming existing attempt',
        data: {
          attempt: inProgressAttempt,
          questions: quiz.shuffleQuestions ? shuffleArray(questions) : questions
        }
      });
    }
    
    // Create new attempt
    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      studentId: req.user._id,
      startedAt: new Date(),
      status: 'in_progress',
      attemptNumber: attemptCount + 1,
      answers: []
    });
    
    // Get questions (hide correct answers)
    let questions = await Question.find({ quizId: quiz._id })
      .select('-correctAnswer')
      .sort({ orderNumber: 1 });
    
    // Shuffle if needed
    if (quiz.shuffleQuestions) {
      questions = shuffleArray(questions);
    }
    
    if (quiz.shuffleOptions) {
      questions = questions.map(q => ({
        ...q.toObject(),
        options: shuffleArray(q.options)
      }));
    }
    
    res.status(201).json({
      success: true,
      message: 'Quiz attempt started',
      data: {
        attempt,
        questions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting quiz attempt',
      error: error.message
    });
  }
};

// Save answer during attempt
exports.saveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOptionId, textAnswer } = req.body;
    
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      studentId: req.user._id,
      status: 'in_progress'
    });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active attempt not found'
      });
    }
    
    // Check if time expired
    const quiz = await Quiz.findById(attempt.quizId);
    const elapsedMinutes = (new Date() - attempt.startedAt) / (1000 * 60);
    
    if (elapsedMinutes > quiz.durationMinutes) {
      // Auto-submit
      return res.status(400).json({
        success: false,
        message: 'Time expired. Quiz will be auto-submitted.'
      });
    }
    
    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex].selectedOptionId = selectedOptionId;
      attempt.answers[existingAnswerIndex].textAnswer = textAnswer;
    } else {
      attempt.answers.push({
        questionId,
        selectedOptionId,
        textAnswer
      });
    }
    
    await attempt.save();
    
    res.status(200).json({
      success: true,
      message: 'Answer saved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving answer',
      error: error.message
    });
  }
};

// Submit quiz attempt
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      studentId: req.user._id,
      status: 'in_progress'
    });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active attempt not found'
      });
    }
    
    const quiz = await Quiz.findById(attempt.quizId);
    
    // Get all questions with correct answers
    const questions = await Question.find({ quizId: quiz._id });
    
    // Calculate score
    let totalScore = 0;
    
    for (const answer of attempt.answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());
      
      if (!question) continue;
      
      let isCorrect = false;
      
      if (question.questionType === 'mcq') {
        const selectedOption = question.options.id(answer.selectedOptionId);
        isCorrect = selectedOption && selectedOption.isCorrect;
      } else if (question.questionType === 'true_false') {
        const selectedOption = question.options.id(answer.selectedOptionId);
        isCorrect = selectedOption && selectedOption.isCorrect;
      } else if (question.questionType === 'short_answer') {
        // For short answer, coordinator needs to manually grade
        isCorrect = null;
      }
      
      answer.isCorrect = isCorrect;
      answer.marksObtained = isCorrect === true ? question.marks : 0;
      
      if (isCorrect === true) {
        totalScore += question.marks;
      }
    }
    
    attempt.totalScore = totalScore;
    attempt.percentage = (totalScore / quiz.totalMarks) * 100;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';
    
    await attempt.save();
    
    // Send result email notification
    try {
      const student = await User.findById(req.user._id);
      await sendQuizResultEmail(
        student.email,
        student.fullName,
        quiz.title,
        totalScore,
        quiz.totalMarks,
        attempt.percentage,
        totalScore >= quiz.passingMarks
      );
    } catch (emailError) {
      console.error('Failed to send result email:', emailError);
      // Continue even if email fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        totalScore,
        totalMarks: quiz.totalMarks,
        percentage: attempt.percentage,
        passed: totalScore >= quiz.passingMarks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message
    });
  }
};

// ============================================
// RESULTS
// ============================================

// Get my results for a specific quiz
exports.getMyQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Verify quiz is assigned
    const assignment = await QuizAssignment.findOne({
      quizId,
      studentId: req.user._id
    });
    
    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Quiz not assigned to you'
      });
    }
    
    const quiz = await Quiz.findById(quizId)
      .populate('coordinatorId', 'fullName department');
    
    const attempts = await QuizAttempt.find({
      quizId,
      studentId: req.user._id,
      status: 'submitted'
    }).sort({ attemptNumber: 1 });
    
    res.status(200).json({
      success: true,
      data: {
        quiz: {
          title: quiz.title,
          totalMarks: quiz.totalMarks,
          passingMarks: quiz.passingMarks,
          coordinator: quiz.coordinatorId
        },
        attempts: attempts.map(a => ({
          attemptNumber: a.attemptNumber,
          score: a.totalScore,
          percentage: a.percentage,
          passed: a.totalScore >= quiz.passingMarks,
          submittedAt: a.submittedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

// Get detailed result for specific attempt
exports.getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      studentId: req.user._id,
      status: 'submitted'
    });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }
    
    const quiz = await Quiz.findById(attempt.quizId);
    const questions = await Question.find({ quizId: quiz._id });
    
    // Build detailed answers with questions
    const detailedAnswers = attempt.answers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());
      
      return {
        question: {
          id: question._id,
          text: question.questionText,
          type: question.questionType,
          marks: question.marks,
          options: question.options
        },
        yourAnswer: {
          selectedOptionId: answer.selectedOptionId,
          textAnswer: answer.textAnswer
        },
        result: {
          isCorrect: answer.isCorrect,
          marksObtained: answer.marksObtained
        }
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        attempt: {
          attemptNumber: attempt.attemptNumber,
          totalScore: attempt.totalScore,
          percentage: attempt.percentage,
          submittedAt: attempt.submittedAt
        },
        quiz: {
          title: quiz.title,
          totalMarks: quiz.totalMarks,
          passingMarks: quiz.passingMarks
        },
        answers: detailedAnswers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attempt details',
      error: error.message
    });
  }
};

// Get all my results across all quizzes
exports.getAllMyResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      studentId: req.user._id,
      status: 'submitted'
    })
      .populate({
        path: 'quizId',
        select: 'title totalMarks passingMarks',
        populate: {
          path: 'coordinatorId',
          select: 'fullName department'
        }
      })
      .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

// ============================================
// PERFORMANCE ANALYTICS
// ============================================

// Get my performance analytics
exports.getMyAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    // Total assignments
    const totalAssignments = await QuizAssignment.countDocuments({ studentId });
    
    // Total attempts
    const totalAttempts = await QuizAttempt.countDocuments({ 
      studentId,
      status: 'submitted'
    });
    
    // Score statistics
    const scoreStats = await QuizAttempt.aggregate([
      { $match: { studentId: studentId, status: 'submitted' } },
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: '$percentage' },
          maxPercentage: { $max: '$percentage' },
          minPercentage: { $min: '$percentage' }
        }
      }
    ]);
    
    // Pass/fail count
    const attempts = await QuizAttempt.find({
      studentId,
      status: 'submitted'
    }).populate('quizId', 'passingMarks');
    
    let passCount = 0;
    let failCount = 0;
    
    attempts.forEach(attempt => {
      if (attempt.totalScore >= attempt.quizId.passingMarks) {
        passCount++;
      } else {
        failCount++;
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        assignments: {
          total: totalAssignments
        },
        attempts: {
          total: totalAttempts,
          passed: passCount,
          failed: failCount,
          passRate: totalAttempts > 0 ? ((passCount / totalAttempts) * 100).toFixed(2) : 0
        },
        scores: scoreStats[0] || {
          avgPercentage: 0,
          maxPercentage: 0,
          minPercentage: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Shuffle array helper
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// PROFILE MANAGEMENT
// ============================================

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile: ' + error.message
    });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['fullName', 'phone', 'department', 'semester', 'enrollmentNumber', 'bio'];
    const updates = {};
    
    // Only allow certain fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating profile: ' + error.message
    });
  }
};

module.exports = exports;

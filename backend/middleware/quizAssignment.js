const QuizAssignment = require('../models/QuizAssignment');
const Quiz = require('../models/Quiz');

// Check if quiz is assigned to student
exports.checkQuizAssignment = async (req, res, next) => {
  try {
    const quizId = req.params.id || req.params.quizId;
    
    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if quiz is assigned to this student
    const assignment = await QuizAssignment.findOne({
      quizId: quizId,
      studentId: req.user._id
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'This quiz is not assigned to you'
      });
    }

    // Check if quiz is within time window
    const now = new Date();
    if (now < quiz.startTime) {
      return res.status(403).json({
        success: false,
        message: 'Quiz has not started yet',
        startTime: quiz.startTime
      });
    }

    if (now > quiz.endTime) {
      return res.status(403).json({
        success: false,
        message: 'Quiz has ended',
        endTime: quiz.endTime
      });
    }

    // Attach quiz and assignment to request
    req.quiz = quiz;
    req.assignment = assignment;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking quiz assignment',
      error: error.message
    });
  }
};

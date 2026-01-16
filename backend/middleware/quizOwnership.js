const Quiz = require('../models/Quiz');

// Check if coordinator owns the quiz
exports.checkQuizOwnership = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id || req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if the logged-in coordinator is the owner
    if (quiz.coordinatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this quiz'
      });
    }

    // Attach quiz to request for use in controller
    req.quiz = quiz;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking quiz ownership',
      error: error.message
    });
  }
};

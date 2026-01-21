const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedOptionId: {
    type: mongoose.Schema.Types.ObjectId
  },
  textAnswer: {
    type: String,
    trim: true
  },
  isCorrect: {
    type: Boolean
  },
  marksObtained: {
    type: Number,
    default: 0
  }
});

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  totalScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'evaluated'],
    default: 'in_progress'
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  answers: [answerSchema]
}, {
  timestamps: true
});

// Index for queries
quizAttemptSchema.index({ quizId: 1, studentId: 1 });
quizAttemptSchema.index({ status: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);

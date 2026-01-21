const mongoose = require('mongoose');

const quizAssignmentSchema = new mongoose.Schema({
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
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one student can't be assigned same quiz multiple times
quizAssignmentSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('QuizAssignment', quizAssignmentSchema);

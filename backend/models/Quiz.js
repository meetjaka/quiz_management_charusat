const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  coordinatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  passingMarks: {
    type: Number,
    required: true,
    min: 0
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  shuffleOptions: {
    type: Boolean,
    default: false
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1
  },
  showAnswersAfterSubmit: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
quizSchema.index({ coordinatorId: 1, status: 1 });
quizSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('Quiz', quizSchema);

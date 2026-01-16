const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
  coordinatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer'],
    required: true
  },
  subject: {
    type: String,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search and filter
questionBankSchema.index({ coordinatorId: 1, subject: 1, topic: 1 });
questionBankSchema.index({ tags: 1 });

module.exports = mongoose.model('QuestionBank', questionBankSchema);

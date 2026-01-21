const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    enum: ['mcq', 'mcq_multiple', 'true_false', 'short_answer'],
    required: true
  },
  marks: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  orderNumber: {
    type: Number,
    required: true
  },
  options: [optionSchema], // For MCQ and True/False
  correctAnswer: {
    type: String, // For short answer questions
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster retrieval
questionSchema.index({ quizId: 1, orderNumber: 1 });

module.exports = mongoose.model('Question', questionSchema);

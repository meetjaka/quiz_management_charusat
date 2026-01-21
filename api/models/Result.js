const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      required: true,
      unique: true,
    },

    // Score Details
    totalScore: {
      type: Number,
      required: true,
      default: 0,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
    },

    // Pass/Fail
    isPassed: {
      type: Boolean,
      required: true,
      default: false,
    },
    passingMarks: {
      type: Number,
      required: true,
    },

    // Statistics
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    unanswered: {
      type: Number,
      default: 0,
    },

    // Time
    timeTaken: {
      type: Number, // in seconds
      required: true,
    },
    submittedAt: {
      type: Date,
      required: true,
    },

    // Ranking (to be calculated)
    rank: {
      type: Number,
    },

    // Remarks
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for leaderboard and analytics
resultSchema.index({ quizId: 1, totalScore: -1 });
resultSchema.index({ studentId: 1, createdAt: -1 });
resultSchema.index({ isPassed: 1 });

module.exports = mongoose.model("Result", resultSchema);

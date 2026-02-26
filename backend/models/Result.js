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
  },
);

// ============================================
// OPTIMIZED INDEXES FOR RESULTS/ANALYTICS
// ============================================

// 1. Fast result lookup for dashboard
resultSchema.index(
  { quizId: 1, studentId: 1 },
  { name: "idx_quiz_student_result" },
);

// 2. Leaderboard ranking queries
resultSchema.index(
  { quizId: 1, totalScore: -1, submittedAt: -1 },
  { name: "idx_leaderboard" },
);

// 3. Student analytics
resultSchema.index(
  { studentId: 1, createdAt: -1 },
  { name: "idx_student_analytics" },
);

// 4. Pass/Fail statistics
resultSchema.index({ quizId: 1, isPassed: 1 }, { name: "idx_quiz_pass_stats" });

// 5. Time-based analytics
resultSchema.index(
  { submittedAt: 1, quizId: 1 },
  { name: "idx_time_analytics" },
);

// TTL index - optional: auto-delete old results after 1 year for storage optimization
// Uncomment if needed: resultSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model("Result", resultSchema);

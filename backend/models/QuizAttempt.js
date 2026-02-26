const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  selectedOptionId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  textAnswer: {
    type: String,
    trim: true,
  },
  isCorrect: {
    type: Boolean,
  },
  marksObtained: {
    type: Number,
    default: 0,
  },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "evaluated"],
      default: "in_progress",
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    answers: [answerSchema],
  },
  {
    timestamps: true,
  },
);

// ============================================
// CRITICAL INDEXES FOR 10K+ CONCURRENT SUBMISSIONS
// ============================================

// 1. Primary compound index for submission lookup (most critical)
quizAttemptSchema.index(
  { quizId: 1, studentId: 1, status: 1 },
  { name: "idx_submission_lookup" },
);

// 2. Prevent duplicate in-progress attempts
quizAttemptSchema.index(
  { quizId: 1, studentId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "in_progress" },
    name: "idx_prevent_dup_inprogress",
  },
);

// 3. Fast lookup for analytics/results
quizAttemptSchema.index(
  { quizId: 1, status: 1, submittedAt: 1 },
  { name: "idx_quiz_results" },
);

// 4. Student results retrieval
quizAttemptSchema.index(
  { studentId: 1, status: 1, submittedAt: -1 },
  { name: "idx_student_results" },
);

// 5. Time-based queries (auto-submission checks)
quizAttemptSchema.index(
  { status: 1, startedAt: 1 },
  { name: "idx_pending_submissions" },
);

// 6. Leaderboard queries
quizAttemptSchema.index(
  { quizId: 1, totalScore: -1, submittedAt: 1 },
  { name: "idx_leaderboard" },
);

// 7. Ensure fast document lookup by ID (default _id index is always there)
quizAttemptSchema.index(
  { _id: 1, studentId: 1 },
  { name: "idx_attempt_student" },
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);

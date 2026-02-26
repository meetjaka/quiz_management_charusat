const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    coordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    passingMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    showAnswersAfterSubmit: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================
// OPTIMIZED INDEXES FOR QUIZ QUERIES
// ============================================

// 1. Coordinator dashboard quizzes
quizSchema.index(
  { coordinatorId: 1, status: 1 },
  { name: "idx_coordinator_quizzes" },
);

// 2. Active quiz window queries (critical for submission)
quizSchema.index(
  { status: 1, startTime: 1, endTime: 1, isActive: 1 },
  { name: "idx_active_quizzes" },
);

// 3. Fast status lookup
quizSchema.index({ status: 1 }, { name: "idx_quiz_status" });

// 4. Published quizzes for students
quizSchema.index(
  { status: 1, startTime: -1 },
  { name: "idx_published_quizzes" },
);

// 5. Time-based queries
quizSchema.index({ startTime: 1, endTime: 1 }, { name: "idx_time_window" });

module.exports = mongoose.model("Quiz", quizSchema);

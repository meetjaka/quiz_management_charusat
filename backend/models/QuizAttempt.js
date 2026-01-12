const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
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

    // Attempt Details
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    timeTaken: {
      type: Number, // in seconds
    },

    // Answers
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswer: {
          type: String,
          enum: ["A", "B", "C", "D", null],
        },
        isCorrect: {
          type: Boolean,
        },
        marksAwarded: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Results
    totalScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },

    // Status
    status: {
      type: String,
      enum: ["in-progress", "submitted", "auto-submitted", "invalidated"],
      default: "in-progress",
    },

    // Proctoring flags
    tabSwitchCount: {
      type: Number,
      default: 0,
    },
    warnings: [
      {
        type: String,
        timestamp: Date,
      },
    ],

    // IP and device info
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent multiple attempts
quizAttemptSchema.index({ quizId: 1, studentId: 1 }, { unique: true });
quizAttemptSchema.index({ status: 1 });

// Calculate time taken on submission
quizAttemptSchema.pre("save", function (next) {
  if (this.submittedAt && this.startedAt) {
    this.timeTaken = Math.floor((this.submittedAt - this.startedAt) / 1000);
  }
  next();
});

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);

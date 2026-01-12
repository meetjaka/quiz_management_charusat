const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Assignment Details
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    batch: {
      type: String,
      trim: true,
    },

    // Quiz Configuration
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: [1, "Total marks must be at least 1"],
    },
    passingMarks: {
      type: Number,
      required: [true, "Passing marks is required"],
      min: [0, "Passing marks cannot be negative"],
    },

    // Visibility & Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },

    // Statistics
    totalQuestions: {
      type: Number,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },

    // Coordinator assignment (optional)
    assignedCoordinators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
quizSchema.index({ department: 1, semester: 1, subject: 1 });
quizSchema.index({ startTime: 1, endTime: 1 });
quizSchema.index({ isActive: 1, isPublished: 1 });
quizSchema.index({ createdBy: 1 });

// Validate end time is after start time
quizSchema.pre("save", function (next) {
  if (this.endTime <= this.startTime) {
    next(new Error("End time must be after start time"));
  }
  if (this.passingMarks > this.totalMarks) {
    next(new Error("Passing marks cannot exceed total marks"));
  }
  next();
});

module.exports = mongoose.model("Quiz", quizSchema);

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      A: { type: String, required: true, trim: true },
      B: { type: String, required: true, trim: true },
      C: { type: String, required: true, trim: true },
      D: { type: String, required: true, trim: true },
    },
    correctAnswer: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: [true, "Correct answer is required"],
    },
    marks: {
      type: Number,
      required: [true, "Marks are required"],
      min: [1, "Marks must be at least 1"],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
questionSchema.index({ quizId: 1, order: 1 });

module.exports = mongoose.model("Question", questionSchema);

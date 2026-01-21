const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "CREATE_USER",
        "UPDATE_USER",
        "DELETE_USER",
        "CREATE_QUIZ",
        "UPDATE_QUIZ",
        "DELETE_QUIZ",
        "START_QUIZ",
        "SUBMIT_QUIZ",
        "UPLOAD_EXCEL",
        "DOWNLOAD_REPORT",
        "INVALIDATE_ATTEMPT",
        "VIEW_RESULTS",
        "SYSTEM_SETTING",
      ],
    },
    resource: {
      type: String, // e.g., 'User', 'Quiz', 'QuizAttempt'
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

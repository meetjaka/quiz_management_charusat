const AuditLog = require("../models/AuditLog");

// Create audit log entry
const createAuditLog = async (logData) => {
  try {
    await AuditLog.create(logData);
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

// Middleware to log actions
const auditMiddleware = (action, resource = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function
    res.send = function (data) {
      const logData = {
        userId: req.user?._id,
        action,
        resource,
        resourceId: req.params.id || req.body._id,
        details: {
          method: req.method,
          path: req.path,
          params: req.params,
          body: sanitizeBody(req.body),
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("user-agent"),
        status:
          res.statusCode >= 200 && res.statusCode < 400 ? "success" : "failure",
      };

      createAuditLog(logData);

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

// Remove sensitive data from body
const sanitizeBody = (body) => {
  const sanitized = { ...body };
  if (sanitized.password) sanitized.password = "***";
  if (sanitized.token) sanitized.token = "***";
  return sanitized;
};

module.exports = { auditMiddleware, createAuditLog };

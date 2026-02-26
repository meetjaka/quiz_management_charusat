const rateLimit = require("express-rate-limit");

const isProd = process.env.NODE_ENV === "production";

/**
 * ============================================
 * PRODUCTION-READY RATE LIMITERS
 * Optimized for 10,000+ concurrent users
 * ============================================
 */

// ========== GENERAL API LIMITER ==========
// More lenient for read-heavy operations
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 1000 : 10000, // 1000 requests per window in prod
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limit for health checks
  skip: (req) => req.path === "/api/health",
  // Use trust proxy for accurate IP in production
  trustProxy: isProd ? true : false,
  // Store: Consider using Redis in production for distributed rate limiting
  // store: new RedisStore({ client: redisClient })
});

// ========== AUTH LIMITER ==========
// Strict for security against brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 5 : 200, // 5 attempts per window in prod
  message: "Too many login attempts, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false, // Count failed attempts
  trustProxy: isProd ? true : false,
});

// ========== QUIZ ATTEMPT LIMITER ==========
// Moderate limit - prevent abuse but allow legitimate attempts
const quizAttemptLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProd ? 100 : 1000, // 100 quiz operations per hour in prod
  message: "Too many quiz attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: isProd ? true : false,
  // Allow bursts by using sliding window
  keyGenerator: (req) => {
    // Key by quiz + student for better granularity
    return `${req.user?._id || req.ip}:quiz:${req.params.id || req.params.quizId}`;
  },
});

// ========== SUBMISSION LIMITER ==========
// Critical endpoint - allow high-frequency for 10k concurrent students
// But prevent DDoS with per-student limits
const submissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute sliding window
  max: isProd ? 60 : 1000, // 60 submissions per minute per student in prod
  message: "Too many submissions, please wait before submitting again.",
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: isProd ? true : false,
  // Per-student limit, not per-IP
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
  // Skip counting for repeated rapid requests (allow resend)
  skip: (req) => req.method === "GET",
});

// ========== ANSWER SAVE LIMITER ==========
// Very lenient - students need to save frequently during quiz
const answerSaveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isProd ? 300 : 10000, // 300 saves per minute per student in prod (5 per second)
  message: "Saving too frequently, please wait.",
  standardHeaders: false, // Don't include headers
  legacyHeaders: false,
  trustProxy: isProd ? true : false,
  keyGenerator: (req) => {
    return `${req.user?._id?.toString() || req.ip}:save`;
  },
  // Don't include rate limit info in response to avoid confusion
  skip: (req) => {
    // Only rate limit for actual saves, not retrievals
    return req.method === "GET";
  },
});

// ========== ADMIN OPERATIONS LIMITER ==========
// Protect admin operations
const adminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isProd ? 200 : 2000, // 200 operations per window in prod
  message: "Too many admin operations, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: isProd ? true : false,
});

// ========== BULK UPLOAD LIMITER ==========
// Prevent abuse of bulk operations
const bulkUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProd ? 10 : 100, // 10 uploads per hour in prod
  message: "Too many bulk uploads, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: isProd ? true : false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  quizAttemptLimiter,
  submissionLimiter,
  answerSaveLimiter,
  adminLimiter,
  bulkUploadLimiter,
};

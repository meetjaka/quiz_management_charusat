const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const {
  apiLimiter,
  authLimiter,
  adminLimiter,
} = require("./middleware/rateLimiter");
const User = require("./models/User");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// CORS with production settings
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parser - increased limit for bulk uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ============================================
// HEALTH CHECK (No rate limiting)
// ============================================
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date(),
    mongodb: "Connected",
    environment: process.env.NODE_ENV,
  });
});

// Favicon
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ============================================
// SEED DEFAULT ADMIN
// ============================================
(async () => {
  try {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      const defaultAdminEmail =
        process.env.DEFAULT_ADMIN_EMAIL || "admin@charusat.edu.in";
      const defaultAdminPassword =
        process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123";
      const adminExists = await User.findOne({ email: defaultAdminEmail });
      if (!adminExists) {
        await User.create({
          fullName: "System Administrator",
          email: defaultAdminEmail,
          password: defaultAdminPassword,
          role: "admin",
          isActive: true,
          isFirstLogin: false,
        });
        console.log(`✅ Seeded admin user: ${defaultAdminEmail}`);
        console.log(`   Password: ${defaultAdminPassword}`);
      }
    }
  } catch (err) {
    console.error("❌ Admin seeding error:", err.message);
  }
})();

// ============================================
// APPLY RATE LIMITING BY ENDPOINT
// ============================================

// Auth routes - strict rate limiting
app.use("/api/auth", authLimiter);

// Admin routes - moderate rate limiting
app.use("/api/admin", adminLimiter);

// General API limiter for other routes (more lenient)
app.use("/api/", apiLimiter);

// ============================================
// ROUTE HANDLERS
// ============================================

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));
// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));
// Group routes
app.use("/api/groups", require("./routes/groupRoutes"));
// Coordinator routes
app.use("/api/coordinator", require("./routes/coordinatorRoutes"));
// Student routes (has its own rate limiters)
app.use("/api/student", require("./routes/studentRoutes"));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Quiz Management System - Production    ║
║         ✅ Server Running                ║
╚════════════════════════════════════════════╝
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV}
  MongoDB Connection Pool: 10-50
  Rate Limiting: Enabled
  CORS Origin: ${process.env.FRONTEND_URL || "http://localhost:3000"}
  `);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on("SIGTERM", () => {
  console.log("\n⚠️  SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n⚠️  SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

// Unhandled rejection
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  // Don't exit - let server keep running
});

module.exports = app;

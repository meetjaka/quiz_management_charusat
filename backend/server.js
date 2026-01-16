const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const User = require("./models/User");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use("/api/", apiLimiter);

// Seed default admin user if none exists
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
          isActive: true
        });
        console.log(`✅ Seeded admin user: ${defaultAdminEmail}`);
        console.log(`   Password: ${defaultAdminPassword}`);
      }
    }
  } catch (err) {
    console.error("❌ Admin seeding error:", err.message);
  }
})();

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date(),
    mongodb: "Connected",
  });
});

// Handle favicon requests to prevent 404/403 errors
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));
// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));
// Coordinator routes
app.use("/api/coordinator", require("./routes/coordinatorRoutes"));
// Student routes
app.use("/api/student", require("./routes/studentRoutes"));
// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

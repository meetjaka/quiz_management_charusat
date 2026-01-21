const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const mongoose = require("mongoose");

// Initialize app first
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB connection with caching for serverless
let cachedDb = null;
let isConnecting = false;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return connectToDatabase();
  }

  try {
    isConnecting = true;

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedDb = connection;
    isConnecting = false;
    console.log("✅ MongoDB connected successfully");
    return cachedDb;
  } catch (error) {
    isConnecting = false;
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}

// Seed admin user
let adminSeeded = false;
async function seedAdmin() {
  if (adminSeeded) return;

  try {
    const User = require("../backend/models/User");
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
        });
        console.log(`✅ Admin seeded: ${defaultAdminEmail}`);
      }
    }
    adminSeeded = true;
  } catch (err) {
    console.error("❌ Admin seed error:", err.message);
  }
}

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    await connectToDatabase();
    res.json({
      message: "Server is running",
      timestamp: new Date(),
      mongodb:
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      error: "Database connection failed",
      message: error.message,
    });
  }
});

// Middleware to ensure DB connection for all API routes
app.use("/api/*", async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({
      error: "Database connection failed",
      message: error.message,
    });
  }
});

// Auth routes
app.use(
  "/api/auth",
  async (req, res, next) => {
    await seedAdmin();
    next();
  },
  require("../backend/routes/authRoutes"),
);

// Admin routes
app.use("/api/admin", require("../backend/routes/adminRoutes"));

// Coordinator routes
app.use("/api/coordinator", require("../backend/routes/coordinatorRoutes"));

// Student routes
app.use("/api/student", require("../backend/routes/studentRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Export for Vercel serverless
module.exports = app;
module.exports.handler = serverless(app);

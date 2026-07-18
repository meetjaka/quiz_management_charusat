const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI.",
      );
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Connection Pooling for High Concurrency
      maxPoolSize: 50, // Max connections in pool (default 10 - too low for 10k concurrent)
      minPoolSize: 10, // Min connections to maintain
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      // Query Optimization
      retryWrites: true, // Enable retries for transient failures
      retryReads: true,
      // Performance
      family: 4, // IPv4 (IPv6 can be slower in some environments)
      // Connection timeout settings
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Pool Size: 10-50 connections`);
    console.log(`   Retry Policy: Enabled`);

    // Monitor connection pool
    mongoose.connection.on("disconnected", () => {
      console.error("⚠️ MongoDB disconnected - will retry");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

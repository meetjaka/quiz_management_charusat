const User = require("../models/UserNew");
const Quiz = require("../models/QuizNew");
const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");
const Result = require("../models/Result");
const { parseStudentsExcel, parseQuizExcel } = require("../utils/excelParser");
const { createAuditLog } = require("../middleware/auditMiddleware");
const { validateUser, validateQuiz } = require("../utils/validators");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".xlsx" && ext !== ".xls") {
      return cb(new Error("Only Excel files are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const { role, department, semester, batch, isActive, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (batch) filter.batch = batch;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { enrollmentNumber: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create single user
// @route   POST /api/admin/users
// @access  Admin
const createUser = async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, enrollmentNumber } = req.body;

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email }, enrollmentNumber ? { enrollmentNumber } : {}].filter(
        (obj) => Object.keys(obj).length > 0
      ),
    });

    if (userExists) {
      return res.status(400).json({
        message: "User with this email or enrollment number already exists",
      });
    }

    const user = await User.create(req.body);

    await createAuditLog({
      userId: req.user._id,
      action: "CREATE_USER",
      resource: "User",
      resourceId: user._id,
      details: { createdUser: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow password update through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");

    await createAuditLog({
      userId: req.user._id,
      action: "UPDATE_USER",
      resource: "User",
      resourceId: updatedUser._id,
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user._id,
      action: "DELETE_USER",
      resource: "User",
      resourceId: user._id,
      details: { deletedUser: user.email },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk upload students from Excel
// @route   POST /api/admin/users/bulk-upload
// @access  Admin
const bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an Excel file" });
    }

    const filePath = req.file.path;
    const students = parseStudentsExcel(filePath);

    const results = {
      success: [],
      failed: [],
    };

    for (const studentData of students) {
      try {
        const existingUser = await User.findOne({
          $or: [
            { email: studentData.email },
            studentData.enrollmentNumber
              ? { enrollmentNumber: studentData.enrollmentNumber }
              : {},
          ].filter((obj) => Object.keys(obj).length > 0),
        });

        if (existingUser) {
          results.failed.push({
            email: studentData.email,
            reason: "User already exists",
          });
          continue;
        }

        const user = await User.create(studentData);
        results.success.push(user.email);
      } catch (error) {
        results.failed.push({
          email: studentData.email,
          reason: error.message,
        });
      }
    }

    // Delete uploaded file
    fs.unlinkSync(filePath);

    await createAuditLog({
      userId: req.user._id,
      action: "UPLOAD_EXCEL",
      resource: "User",
      details: {
        totalRecords: students.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.json({
      success: true,
      message: "Bulk upload completed",
      data: results,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkUploadStudents,
  toggleUserStatus,
  upload,
};

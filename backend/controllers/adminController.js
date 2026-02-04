const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");
const QuizAssignment = require("../models/QuizAssignment");
const Group = require("../models/Group");
const xlsx = require("xlsx");
const { parseQuizExcel, parseBulkUsersExcel } = require("../utils/excelParser");
const fs = require("fs");

// ============================================
// USER MANAGEMENT
// ============================================

// Get all users with filtering and pagination
exports.getAllUsers = async (req, res) => {
  try {
    const {
      role,
      department,
      isActive,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === "true";

    // Search by name, email, or studentId
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password")
      .populate("groups", "name groupType description")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get additional stats based on role
    let stats = {};

    if (user.role === "coordinator") {
      const quizCount = await Quiz.countDocuments({ coordinatorId: user._id });
      stats.totalQuizzes = quizCount;
    }

    if (user.role === "student") {
      const attemptCount = await QuizAttempt.countDocuments({
        studentId: user._id,
      });
      const assignmentCount = await QuizAssignment.countDocuments({
        studentId: user._id,
      });
      stats.totalAttempts = attemptCount;
      stats.assignedQuizzes = assignmentCount;
    }

    res.status(200).json({
      success: true,
      data: user,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields (only email, password, and role)
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, and role",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user with minimal information
    // User will complete profile on first-time login
    const user = await User.create({
      email,
      password,
      role,
      fullName: email.split("@")[0], // Temporary name from email
      isFirstLogin: true,
      createdBy: req.user._id,
    });

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// Bulk create users from Excel
exports.bulkCreateUsers = async (req, res) => {
  try {
    console.log("🚀 Starting bulk user creation...");
    console.log("📁 Request file:", req.file);
    console.log("👤 Request user:", req.user ? req.user.email : "No user");
    console.log("📋 Request body:", req.body);

    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file",
      });
    }

    console.log("📋 File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    // Get group ID from request body (optional)
    const groupId = req.body.groupId;
    let selectedGroup = null;

    if (groupId) {
      const Group = require("../models/Group");
      selectedGroup = await Group.findById(groupId);
      if (!selectedGroup) {
        return res.status(400).json({
          success: false,
          message: "Selected group not found",
        });
      }
      console.log("📊 Selected group:", selectedGroup.name);
    }

    // Parse Excel file
    let users;
    try {
      console.log("🔄 A. Starting bulk users Excel parsing...");
      users = parseBulkUsersExcel(req.file.path);
      console.log("✅ B. Parsed users count:", users.length);
    } catch (parseError) {
      console.error("❌ Parse error:", parseError);
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: parseError.message,
      });
    }

    if (!users || users.length === 0) {
      console.log("⚠️ No users found in Excel");
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "No users found in Excel file",
      });
    }

    // Check for duplicate emails in the file
    const emailsInFile = users.map((u) => u.email);
    const duplicateEmails = emailsInFile.filter(
      (email, index) => emailsInFile.indexOf(email) !== index,
    );
    if (duplicateEmails.length > 0) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: `Duplicate emails found in file: ${duplicateEmails.join(", ")}`,
      });
    }

    // Check for existing users in database
    const existingUsers = await User.find({
      $or: [
        { email: { $in: emailsInFile } },
        {
          studentId: {
            $in: users.filter((u) => u.studentId).map((u) => u.studentId),
          },
        },
      ],
    }).select("email studentId");

    if (existingUsers.length > 0) {
      const existingEmails = existingUsers.map((u) => u.email);
      const existingStudentIds = existingUsers
        .filter((u) => u.studentId)
        .map((u) => u.studentId);

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: `Users already exist with emails: ${existingEmails.join(", ")}${existingStudentIds.length ? ` or student IDs: ${existingStudentIds.join(", ")}` : ""}`,
      });
    }

    // Add creator reference and group assignment
    const usersToCreate = users.map((user) => ({
      ...user,
      createdBy: req.user._id,
      groups: selectedGroup ? [selectedGroup._id] : [],
      primaryGroup: selectedGroup ? selectedGroup._id : null,
    }));

    // Create users in bulk using User.create() to trigger pre-save hooks for password hashing
    console.log("📦 C. Creating users in database...");
    // Use User.create() instead of insertMany() to ensure password hashing
    const createdUsers = await User.create(usersToCreate);
    console.log("✅ D. Users created:", createdUsers.length);

    // Add users to the selected group
    if (selectedGroup) {
      console.log("👥 E. Adding users to group:", selectedGroup.name);
      for (const user of createdUsers) {
        selectedGroup.addMember(user._id, req.user._id);
      }
      await selectedGroup.save();
      console.log("✅ F. Users added to group successfully");
    }

    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Prepare response data (without passwords)
    const responseUsers = createdUsers.map((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdUsers.length} users`,
      info: "Users without passwords in Excel have been assigned default password: 'Password@123'",
      data: {
        totalCreated: createdUsers.length,
        users: responseUsers,
        summary: {
          students: createdUsers.filter((u) => u.role === "student").length,
          coordinators: createdUsers.filter((u) => u.role === "coordinator")
            .length,
        },
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Bulk user creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating users in bulk: " + error.message,
    });
  }
};

// Generate sample Excel template for bulk user creation
exports.downloadUserTemplate = async (req, res) => {
  try {
    console.log("📋 Download template request received");

    const sampleData = [
      {
        email: "john.doe@charusat.edu.in",
        password: "Password@123",
        note: "If password is blank, default will be 'Password@123'",
      },
      {
        email: "jane.smith@charusat.edu.in",
        password: "CustomPass123",
        note: "You can set custom passwords too",
      },
      {
        email: "mike.wilson@charusat.edu.in",
        password: "",
        note: "Blank password = default 'Password@123'",
      },
    ];

    // Create Excel file
    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Users");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bulk_users_template.xlsx",
    );

    console.log("✅ Sending Excel template");
    res.send(buffer);
  } catch (error) {
    console.error("❌ Template download error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating template: " + error.message,
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { fullName, role, studentId, department, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (studentId !== undefined) user.studentId = studentId;
    if (department !== undefined) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// ============================================
// QUIZ VIEWING (Read-Only for Admin)
// ============================================

// Get all quizzes (admin can view all, but not edit)
exports.getAllQuizzes = async (req, res) => {
  try {
    const {
      status,
      coordinatorId,
      department,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (coordinatorId) query.coordinatorId = coordinatorId;

    const skip = (page - 1) * limit;

    const quizzes = await Quiz.find(query)
      .populate("coordinatorId", "fullName email department")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Quiz.countDocuments(query);

    // Get question counts for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionCount = await Question.countDocuments({
          quizId: quiz._id,
        });
        return {
          ...quiz.toObject(),
          stats: {
            totalQuestions: questionCount,
          },
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: quizzes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: quizzesWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quizzes",
      error: error.message,
    });
  }
};

// Get quiz by ID (read-only)
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "coordinatorId",
      "fullName email department",
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Get questions for this quiz
    const questions = await Question.find({ quizId: quiz._id }).sort({
      orderNumber: 1,
    });

    // Get assignment and attempt counts
    const assignmentCount = await QuizAssignment.countDocuments({
      quizId: quiz._id,
    });
    const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });

    res.status(200).json({
      success: true,
      data: {
        quiz,
        questions,
      },
      stats: {
        assignedTo: assignmentCount,
        totalAttempts: attemptCount,
        totalQuestions: questions.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quiz",
      error: error.message,
    });
  }
};

// ============================================
// ANALYTICS
// ============================================

// Get system-wide analytics
exports.getSystemAnalytics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalCoordinators = await User.countDocuments({
      role: "coordinator",
    });
    const totalStudents = await User.countDocuments({ role: "student" });
    const activeUsers = await User.countDocuments({ isActive: true });

    // Quiz statistics
    const totalQuizzes = await Quiz.countDocuments();
    const publishedQuizzes = await Quiz.countDocuments({ status: "published" });
    const draftQuizzes = await Quiz.countDocuments({ status: "draft" });
    const closedQuizzes = await Quiz.countDocuments({ status: "closed" });

    // Active quizzes (published quizzes that are currently within their time window)
    const now = new Date();
    const activeQuizzes = await Quiz.countDocuments({
      status: "published",
      $or: [
        { startTime: { $lte: now }, endTime: { $gte: now } },
        { startTime: { $exists: false }, endTime: { $exists: false } },
        { startTime: null, endTime: null },
      ],
    });

    // Assignment statistics
    const totalAssignments = await QuizAssignment.countDocuments();

    // Attempt statistics
    const totalAttempts = await QuizAttempt.countDocuments();
    const submittedAttempts = await QuizAttempt.countDocuments({
      status: "submitted",
    });
    const inProgressAttempts = await QuizAttempt.countDocuments({
      status: "in_progress",
    });

    // Average scores
    const attemptStats = await QuizAttempt.aggregate([
      { $match: { status: "submitted" } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$totalScore" },
          avgPercentage: { $avg: "$percentage" },
        },
      },
    ]);

    // Recent quiz attempts (last 10)
    const recentAttempts = await QuizAttempt.find()
      .populate("studentId", "fullName email studentId")
      .populate("quizId", "title")
      .sort({ submittedAt: -1 })
      .limit(10);

    // Recent quizzes (last 5)
    const recentQuizzes = await Quiz.find()
      .populate("coordinatorId", "fullName")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title durationMinutes isActive status coordinatorId createdAt");

    // Department statistics
    const departmentStats = await User.aggregate([
      { $match: { role: "student" } },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents: totalStudents,
          totalCoordinators: totalCoordinators,
          totalQuizzes: totalQuizzes,
          activeQuizzes: activeQuizzes,
          totalAttempts: totalAttempts,
          totalAdmins: totalAdmins,
          totalUsers: totalUsers,
          activeUsers: activeUsers,
          publishedQuizzes: publishedQuizzes,
          draftQuizzes: draftQuizzes,
          closedQuizzes: closedQuizzes,
          submittedAttempts: submittedAttempts,
          inProgressAttempts: inProgressAttempts,
          averageScore: attemptStats[0]?.avgScore || 0,
          averagePercentage: attemptStats[0]?.avgPercentage || 0,
        },
        recentAttempts: recentAttempts,
        recentQuizzes: recentQuizzes,
        departmentStats: departmentStats,
        // Keep the old structure for backwards compatibility
        users: {
          total: totalUsers,
          admins: totalAdmins,
          coordinators: totalCoordinators,
          students: totalStudents,
          active: activeUsers,
        },
        quizzes: {
          total: totalQuizzes,
          published: publishedQuizzes,
          draft: draftQuizzes,
          closed: closedQuizzes,
          active: activeQuizzes,
        },
        assignments: {
          total: totalAssignments,
        },
        attempts: {
          total: totalAttempts,
          submitted: submittedAttempts,
          inProgress: inProgressAttempts,
          averageScore: attemptStats[0]?.avgScore || 0,
          averagePercentage: attemptStats[0]?.avgPercentage || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching system analytics",
      error: error.message,
    });
  }
};

// Get department-wise analytics
exports.getDepartmentAnalytics = async (req, res) => {
  try {
    const departmentStats = await User.aggregate([
      {
        $group: {
          _id: "$department",
          totalUsers: { $sum: 1 },
          coordinators: {
            $sum: { $cond: [{ $eq: ["$role", "coordinator"] }, 1, 0] },
          },
          students: {
            $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] },
          },
        },
      },
      { $sort: { totalUsers: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: departmentStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching department analytics",
      error: error.message,
    });
  }
};

// Get coordinator performance analytics
exports.getCoordinatorAnalytics = async (req, res) => {
  try {
    const coordinators = await User.find({ role: "coordinator" }).select(
      "fullName email department",
    );

    const analyticsPromises = coordinators.map(async (coordinator) => {
      const totalQuizzes = await Quiz.countDocuments({
        coordinatorId: coordinator._id,
      });
      const publishedQuizzes = await Quiz.countDocuments({
        coordinatorId: coordinator._id,
        status: "published",
      });

      const quizIds = await Quiz.find({
        coordinatorId: coordinator._id,
      }).select("_id");
      const quizIdArray = quizIds.map((q) => q._id);

      const totalAssignments = await QuizAssignment.countDocuments({
        quizId: { $in: quizIdArray },
      });
      const totalAttempts = await QuizAttempt.countDocuments({
        quizId: { $in: quizIdArray },
      });

      return {
        coordinator: {
          id: coordinator._id,
          name: coordinator.fullName,
          email: coordinator.email,
          department: coordinator.department,
        },
        stats: {
          totalQuizzes,
          publishedQuizzes,
          totalAssignments,
          totalAttempts,
        },
      };
    });

    const analytics = await Promise.all(analyticsPromises);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching coordinator analytics",
      error: error.message,
    });
  }
};

// ============================================
// DATA EXPORT
// ============================================

// Export users to Excel
exports.exportUsers = async (req, res) => {
  try {
    const { role, department } = req.query;

    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    // Format data for Excel
    const data = users.map((user) => ({
      "Full Name": user.fullName,
      Email: user.email,
      Role: user.role,
      "Student ID": user.studentId || "N/A",
      Department: user.department || "N/A",
      Active: user.isActive ? "Yes" : "No",
      "Created At": new Date(user.createdAt).toLocaleDateString(),
    }));

    // Create workbook
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Users");

    // Generate buffer
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error exporting users",
      error: error.message,
    });
  }
};

// Export quiz results to Excel
exports.exportQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const attempts = await QuizAttempt.find({ quizId })
      .populate("studentId", "fullName email studentId department")
      .sort({ submittedAt: -1 });

    // Format data for Excel
    const data = attempts.map((attempt) => ({
      "Student Name": attempt.studentId.fullName,
      "Student ID": attempt.studentId.studentId,
      Email: attempt.studentId.email,
      Department: attempt.studentId.department || "N/A",
      Score: attempt.totalScore,
      "Total Marks": quiz.totalMarks,
      Percentage: attempt.percentage.toFixed(2) + "%",
      Status: attempt.status,
      "Attempt Number": attempt.attemptNumber,
      "Started At": attempt.startedAt
        ? new Date(attempt.startedAt).toLocaleString()
        : "N/A",
      "Submitted At": attempt.submittedAt
        ? new Date(attempt.submittedAt).toLocaleString()
        : "N/A",
    }));

    // Create workbook
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Quiz Results");

    // Generate buffer
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${quiz.title.replace(/\\s+/g, "_")}_results.xlsx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error exporting quiz results",
      error: error.message,
    });
  }
};

// ============================================
// QUIZ MANAGEMENT (Admin can create/edit)
// ============================================

// Create quiz manually
exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      duration,
      totalMarks,
      passingMarks,
      status,
    } = req.body;

    // Validate required fields
    if (!title || !duration || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (title, duration, startTime, endTime)",
      });
    }

    // Validate dates
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Create quiz
    const quiz = await Quiz.create({
      title,
      description,
      startTime,
      endTime,
      durationMinutes: parseInt(duration),
      totalMarks: parseInt(totalMarks) || 0,
      passingMarks: parseInt(passingMarks) || 0,
      status: status || "draft",
      coordinatorId: req.user._id, // Admin as creator
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating quiz",
      error: error.message,
    });
  }
};

// Upload quiz with Excel file
exports.uploadQuizExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file",
      });
    }

    const { title, description, startTime, endTime, duration, passingMarks } =
      req.body;

    // Validate required fields
    if (!title || !duration || !startTime || !endTime) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (title, duration, startTime, endTime)",
      });
    }

    // Validate dates
    if (new Date(startTime) >= new Date(endTime)) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Parse Excel file
    let questions;
    try {
      console.log("🔄 A. Starting Excel parsing...");
      questions = parseQuizExcel(req.file.path);
      console.log("✅ B. Parsed questions count:", questions.length);
      if (questions.length > 0) {
        console.log(
          "📝 C. First question structure:",
          JSON.stringify(questions[0], null, 2),
        );
      }
    } catch (parseError) {
      console.error("❌ Parse error:", parseError);
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: parseError.message,
      });
    }

    if (!questions || questions.length === 0) {
      console.log("⚠️ No questions found in Excel");
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "No questions found in Excel file",
      });
    }

    // Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const calculatedPassingMarks = passingMarks || Math.floor(totalMarks * 0.4);

    // Create quiz
    console.log("📦 D. Creating quiz document...");
    const quiz = await Quiz.create({
      title,
      description,
      startTime,
      endTime,
      durationMinutes: parseInt(duration),
      totalMarks,
      passingMarks: parseInt(calculatedPassingMarks),
      status: "draft",
      coordinatorId: req.user._id,
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
    });
    console.log("✅ E. Quiz created with ID:", quiz._id);

    // Create questions separately - questions already have correct structure from parser
    console.log("🔨 F. Creating questions for quiz...");
    const questionPromises = questions.map((q, index) => {
      console.log(
        `   → Question ${index + 1}: ${q.questionText.substring(0, 50)}...`,
      );

      // Add quizId to each question
      return Question.create({
        quizId: quiz._id,
        questionText: q.questionText,
        questionType: q.questionType,
        marks: q.marks,
        orderNumber: q.orderNumber,
        options: q.options, // Already in correct format: [{text, isCorrect}, ...]
      });
    });

    const createdQuestions = await Promise.all(questionPromises);
    console.log(
      "✅ G. Questions created successfully:",
      createdQuestions.length,
    );
    console.log("🎉 H. First created question ID:", createdQuestions[0]?._id);

    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.log("📤 Sending success response...");
    res.status(201).json({
      success: true,
      message: `Quiz created successfully with ${createdQuestions.length} questions`,
      data: {
        quiz,
        questionsCount: createdQuestions.length,
        questionIds: createdQuestions.map((q) => q._id),
      },
    });
  } catch (error) {
    console.error("❌ Upload quiz error:", error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Error uploading quiz",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Add question to quiz
exports.addQuestionToQuiz = async (req, res) => {
  try {
    const { quizId, questionText, options, correctAnswer, marks } = req.body;

    // Validate required fields
    if (!quizId || !questionText || !options || !correctAnswer || !marks) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Get current question count for order number
    const questionCount = await Question.countDocuments({ quizId });

    // Create question
    const question = await Question.create({
      quizId,
      questionText,
      questionType: "mcq",
      marks: parseInt(marks),
      orderNumber: questionCount + 1,
      options: [
        { text: options.A, isCorrect: correctAnswer === "A" },
        { text: options.B, isCorrect: correctAnswer === "B" },
        { text: options.C, isCorrect: correctAnswer === "C" },
        { text: options.D, isCorrect: correctAnswer === "D" },
      ],
    });

    // Update quiz total marks
    const allQuestions = await Question.find({ quizId });
    quiz.totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);
    await quiz.save();

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding question",
      error: error.message,
    });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const {
      title,
      description,
      startTime,
      endTime,
      duration,
      passingMarks,
      status,
    } = req.body;

    // Update fields
    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (startTime) quiz.startTime = startTime;
    if (endTime) quiz.endTime = endTime;
    if (duration) quiz.durationMinutes = parseInt(duration);
    if (passingMarks) quiz.passingMarks = parseInt(passingMarks);
    if (status) quiz.status = status;

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating quiz",
      error: error.message,
    });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if quiz has attempts
    const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
    if (attemptCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete quiz with existing attempts",
      });
    }

    // Delete related data
    await Question.deleteMany({ quizId: quiz._id });
    await QuizAssignment.deleteMany({ quizId: quiz._id });

    // Delete quiz
    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting quiz",
      error: error.message,
    });
  }
};

// ============================================
// SYSTEM FIXES (Temporary)
// ============================================

// Fix admin users who have isFirstLogin set to true
exports.fixAdminFirstLogin = async (req, res) => {
  try {
    const result = await User.updateMany(
      { role: "admin", isFirstLogin: true },
      { $set: { isFirstLogin: false } },
    );

    res.json({
      success: true,
      message: `Fixed ${result.modifiedCount} admin users`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error fixing admin first login:", error);
    res.status(500).json({
      success: false,
      message: "Error fixing admin first login",
      error: error.message,
    });
  }
};

// Bulk delete users
exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs are required and should be an array",
      });
    }

    // Prevent deletion of admin users including the current user
    const adminUsers = await User.find({
      _id: { $in: userIds },
      role: "admin",
    });

    if (adminUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin users",
      });
    }

    // Prevent self-deletion
    if (userIds.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Delete users
    const result = await User.deleteMany({
      _id: { $in: userIds },
      role: { $ne: "admin" }, // Extra protection
    });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} users`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting users",
      error: error.message,
    });
  }
};

module.exports = exports;

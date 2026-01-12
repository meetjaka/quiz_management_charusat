const jwt = require("jsonwebtoken");
const User = require("../models/UserNew");
const { createAuditLog } = require("../middleware/auditMiddleware");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (or Admin only for bulk creation)
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      enrollmentNumber,
      department,
      semester,
      batch,
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      enrollmentNumber,
      department,
      semester,
      batch,
    });

    // Create audit log
    await createAuditLog({
      userId: user._id,
      action: "CREATE_USER",
      resource: "User",
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      await createAuditLog({
        userId: null,
        action: "LOGIN",
        details: { email },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "failure",
        errorMessage: "Invalid credentials",
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res
        .status(401)
        .json({ message: "Account is deactivated. Contact administrator." });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await createAuditLog({
        userId: user._id,
        action: "LOGIN",
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "failure",
        errorMessage: "Invalid password",
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = Date.now();
    user.lastLoginIP = req.ip;
    await user.save();

    // Create audit log
    await createAuditLog({
      userId: user._id,
      action: "LOGIN",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      semester: user.semester,
      batch: user.batch,
      enrollmentNumber: user.enrollmentNumber,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    await createAuditLog({
      userId: req.user._id,
      action: "LOGOUT",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  changePassword,
};

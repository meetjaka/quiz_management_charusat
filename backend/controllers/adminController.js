const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const QuizAssignment = require('../models/QuizAssignment');
const xlsx = require('xlsx');

// ============================================
// USER MANAGEMENT
// ============================================

// Get all users with filtering and pagination
exports.getAllUsers = async (req, res) => {
  try {
    const { role, department, isActive, page = 1, limit = 20, search } = req.query;
    
    const query = {};
    
    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Search by name, email, or studentId
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
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
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get additional stats based on role
    let stats = {};
    
    if (user.role === 'coordinator') {
      const quizCount = await Quiz.countDocuments({ coordinatorId: user._id });
      stats.totalQuizzes = quizCount;
    }
    
    if (user.role === 'student') {
      const attemptCount = await QuizAttempt.countDocuments({ studentId: user._id });
      const assignmentCount = await QuizAssignment.countDocuments({ studentId: user._id });
      stats.totalAttempts = attemptCount;
      stats.assignedQuizzes = assignmentCount;
    }
    
    res.status(200).json({
      success: true,
      data: user,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { email, password, fullName, role, studentId, department } = req.body;
    
    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, fullName, and role'
      });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Check if studentId exists (for students)
    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already exists'
        });
      }
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      fullName,
      role,
      studentId: role === 'student' ? studentId : undefined,
      department
    });
    
    // Remove password from response
    user.password = undefined;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
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
        message: 'User not found'
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
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
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
        message: 'User not found'
      });
    }
    
    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Soft delete by deactivating
    user.isActive = false;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// ============================================
// QUIZ VIEWING (Read-Only for Admin)
// ============================================

// Get all quizzes (admin can view all, but not edit)
exports.getAllQuizzes = async (req, res) => {
  try {
    const { status, coordinatorId, department, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (coordinatorId) query.coordinatorId = coordinatorId;
    
    const skip = (page - 1) * limit;
    
    const quizzes = await Quiz.find(query)
      .populate('coordinatorId', 'fullName email department')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Quiz.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
      error: error.message
    });
  }
};

// Get quiz by ID (read-only)
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('coordinatorId', 'fullName email department');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Get assignment and attempt counts
    const assignmentCount = await QuizAssignment.countDocuments({ quizId: quiz._id });
    const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
    
    res.status(200).json({
      success: true,
      data: quiz,
      stats: {
        assignedTo: assignmentCount,
        totalAttempts: attemptCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
      error: error.message
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
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalCoordinators = await User.countDocuments({ role: 'coordinator' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Quiz statistics
    const totalQuizzes = await Quiz.countDocuments();
    const publishedQuizzes = await Quiz.countDocuments({ status: 'published' });
    const draftQuizzes = await Quiz.countDocuments({ status: 'draft' });
    const closedQuizzes = await Quiz.countDocuments({ status: 'closed' });
    
    // Assignment statistics
    const totalAssignments = await QuizAssignment.countDocuments();
    
    // Attempt statistics
    const totalAttempts = await QuizAttempt.countDocuments();
    const submittedAttempts = await QuizAttempt.countDocuments({ status: 'submitted' });
    const inProgressAttempts = await QuizAttempt.countDocuments({ status: 'in_progress' });
    
    // Average scores
    const attemptStats = await QuizAttempt.aggregate([
      { $match: { status: 'submitted' } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalScore' },
          avgPercentage: { $avg: '$percentage' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          coordinators: totalCoordinators,
          students: totalStudents,
          active: activeUsers
        },
        quizzes: {
          total: totalQuizzes,
          published: publishedQuizzes,
          draft: draftQuizzes,
          closed: closedQuizzes
        },
        assignments: {
          total: totalAssignments
        },
        attempts: {
          total: totalAttempts,
          submitted: submittedAttempts,
          inProgress: inProgressAttempts,
          averageScore: attemptStats[0]?.avgScore || 0,
          averagePercentage: attemptStats[0]?.avgPercentage || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system analytics',
      error: error.message
    });
  }
};

// Get department-wise analytics
exports.getDepartmentAnalytics = async (req, res) => {
  try {
    const departmentStats = await User.aggregate([
      {
        $group: {
          _id: '$department',
          totalUsers: { $sum: 1 },
          coordinators: {
            $sum: { $cond: [{ $eq: ['$role', 'coordinator'] }, 1, 0] }
          },
          students: {
            $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalUsers: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: departmentStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching department analytics',
      error: error.message
    });
  }
};

// Get coordinator performance analytics
exports.getCoordinatorAnalytics = async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'coordinator' })
      .select('fullName email department');
    
    const analyticsPromises = coordinators.map(async (coordinator) => {
      const totalQuizzes = await Quiz.countDocuments({ coordinatorId: coordinator._id });
      const publishedQuizzes = await Quiz.countDocuments({ 
        coordinatorId: coordinator._id, 
        status: 'published' 
      });
      
      const quizIds = await Quiz.find({ coordinatorId: coordinator._id })
        .select('_id');
      const quizIdArray = quizIds.map(q => q._id);
      
      const totalAssignments = await QuizAssignment.countDocuments({ 
        quizId: { $in: quizIdArray } 
      });
      const totalAttempts = await QuizAttempt.countDocuments({ 
        quizId: { $in: quizIdArray } 
      });
      
      return {
        coordinator: {
          id: coordinator._id,
          name: coordinator.fullName,
          email: coordinator.email,
          department: coordinator.department
        },
        stats: {
          totalQuizzes,
          publishedQuizzes,
          totalAssignments,
          totalAttempts
        }
      };
    });
    
    const analytics = await Promise.all(analyticsPromises);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coordinator analytics',
      error: error.message
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
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Format data for Excel
    const data = users.map(user => ({
      'Full Name': user.fullName,
      'Email': user.email,
      'Role': user.role,
      'Student ID': user.studentId || 'N/A',
      'Department': user.department || 'N/A',
      'Active': user.isActive ? 'Yes' : 'No',
      'Created At': new Date(user.createdAt).toLocaleDateString()
    }));
    
    // Create workbook
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Users');
    
    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting users',
      error: error.message
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
        message: 'Quiz not found'
      });
    }
    
    const attempts = await QuizAttempt.find({ quizId })
      .populate('studentId', 'fullName email studentId department')
      .sort({ submittedAt: -1 });
    
    // Format data for Excel
    const data = attempts.map(attempt => ({
      'Student Name': attempt.studentId.fullName,
      'Student ID': attempt.studentId.studentId,
      'Email': attempt.studentId.email,
      'Department': attempt.studentId.department || 'N/A',
      'Score': attempt.totalScore,
      'Total Marks': quiz.totalMarks,
      'Percentage': attempt.percentage.toFixed(2) + '%',
      'Status': attempt.status,
      'Attempt Number': attempt.attemptNumber,
      'Started At': attempt.startedAt ? new Date(attempt.startedAt).toLocaleString() : 'N/A',
      'Submitted At': attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A'
    }));
    
    // Create workbook
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Quiz Results');
    
    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', `attachment; filename=${quiz.title.replace(/\s+/g, '_')}_results.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting quiz results',
      error: error.message
    });
  }
};

module.exports = exports;

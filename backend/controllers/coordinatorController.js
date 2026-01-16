const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuestionBank = require('../models/QuestionBank');
const QuizAssignment = require('../models/QuizAssignment');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const xlsx = require('xlsx');
const { sendQuizAssignmentEmail } = require('../utils/emailService');
const { parseQuestionsCSV, generateQuestionTemplate } = require('../utils/bulkUpload');

// ============================================
// QUIZ MANAGEMENT (Own Quizzes Only)
// ============================================

// Get all quizzes created by this coordinator
exports.getMyQuizzes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    
    const query = { coordinatorId: req.user._id };
    
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Quiz.countDocuments(query);
    
    // Get stats for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const assignmentCount = await QuizAssignment.countDocuments({ quizId: quiz._id });
        const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
        const questionCount = await Question.countDocuments({ quizId: quiz._id });
        
        return {
          ...quiz.toObject(),
          stats: {
            assignedTo: assignmentCount,
            totalAttempts: attemptCount,
            totalQuestions: questionCount
          }
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: quizzesWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
      error: error.message
    });
  }
};

// Get single quiz by ID (must be owned by coordinator)
exports.getMyQuizById = async (req, res) => {
  try {
    // Quiz already attached by checkQuizOwnership middleware
    const quiz = req.quiz;
    
    // Get questions for this quiz
    const questions = await Question.find({ quizId: quiz._id })
      .sort({ orderNumber: 1 });
    
    // Get stats
    const assignmentCount = await QuizAssignment.countDocuments({ quizId: quiz._id });
    const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
    
    res.status(200).json({
      success: true,
      data: {
        quiz,
        questions,
        stats: {
          assignedTo: assignmentCount,
          totalAttempts: attemptCount,
          totalQuestions: questions.length
        }
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

// Create new quiz
exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      totalMarks,
      passingMarks,
      durationMinutes,
      startTime,
      endTime,
      shuffleQuestions,
      shuffleOptions,
      maxAttempts,
      status
    } = req.body;
    
    // Validate required fields
    if (!title || !totalMarks || !passingMarks || !durationMinutes || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Validate dates
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }
    
    // Create quiz with coordinator ID
    const quiz = await Quiz.create({
      title,
      description,
      coordinatorId: req.user._id,
      totalMarks,
      passingMarks,
      durationMinutes,
      startTime,
      endTime,
      shuffleQuestions: shuffleQuestions || false,
      shuffleOptions: shuffleOptions || false,
      maxAttempts: maxAttempts || 1,
      status: status || 'draft'
    });
    
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message
    });
  }
};

// Update quiz (must be owned)
exports.updateQuiz = async (req, res) => {
  try {
    // Quiz already attached and verified by middleware
    const quiz = req.quiz;
    
    const {
      title,
      description,
      totalMarks,
      passingMarks,
      durationMinutes,
      startTime,
      endTime,
      shuffleQuestions,
      shuffleOptions,
      maxAttempts,
      status
    } = req.body;
    
    // Don't allow editing if quiz is closed
    if (quiz.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a closed quiz'
      });
    }
    
    // Update fields
    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (totalMarks) quiz.totalMarks = totalMarks;
    if (passingMarks) quiz.passingMarks = passingMarks;
    if (durationMinutes) quiz.durationMinutes = durationMinutes;
    if (startTime) quiz.startTime = startTime;
    if (endTime) quiz.endTime = endTime;
    if (shuffleQuestions !== undefined) quiz.shuffleQuestions = shuffleQuestions;
    if (shuffleOptions !== undefined) quiz.shuffleOptions = shuffleOptions;
    if (maxAttempts) quiz.maxAttempts = maxAttempts;
    if (status) quiz.status = status;
    
    await quiz.save();
    
    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating quiz',
      error: error.message
    });
  }
};

// Delete quiz (must be owned)
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = req.quiz;
    
    // Check if quiz has attempts
    const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
    
    if (attemptCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete quiz with existing attempts. Consider closing it instead.'
      });
    }
    
    // Delete related data
    await Question.deleteMany({ quizId: quiz._id });
    await QuizAssignment.deleteMany({ quizId: quiz._id });
    await quiz.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz',
      error: error.message
    });
  }
};

// ============================================
// QUESTION MANAGEMENT
// ============================================

// Add question to quiz
exports.addQuestion = async (req, res) => {
  try {
    const quiz = req.quiz;
    const { questionText, questionType, marks, options, correctAnswer } = req.body;
    
    // Validate required fields
    if (!questionText || !questionType || !marks) {
      return res.status(400).json({
        success: false,
        message: 'Please provide questionText, questionType, and marks'
      });
    }
    
    // Get next order number
    const lastQuestion = await Question.findOne({ quizId: quiz._id })
      .sort({ orderNumber: -1 });
    const orderNumber = lastQuestion ? lastQuestion.orderNumber + 1 : 1;
    
    // Create question
    const question = await Question.create({
      quizId: quiz._id,
      questionText,
      questionType,
      marks,
      orderNumber,
      options: options || [],
      correctAnswer
    });
    
    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding question',
      error: error.message
    });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const quiz = req.quiz;
    
    const question = await Question.findOne({
      _id: questionId,
      quizId: quiz._id
    });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    const { questionText, questionType, marks, options, correctAnswer, orderNumber } = req.body;
    
    if (questionText) question.questionText = questionText;
    if (questionType) question.questionType = questionType;
    if (marks) question.marks = marks;
    if (options) question.options = options;
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
    if (orderNumber) question.orderNumber = orderNumber;
    
    await question.save();
    
    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const quiz = req.quiz;
    
    const question = await Question.findOneAndDelete({
      _id: questionId,
      quizId: quiz._id
    });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// ============================================
// QUIZ ASSIGNMENT
// ============================================

// Assign quiz to students
exports.assignQuizToStudents = async (req, res) => {
  try {
    const quiz = req.quiz;
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of student IDs'
      });
    }
    
    // Verify all are valid students
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student',
      isActive: true
    });
    
    if (students.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some student IDs are invalid or inactive'
      });
    }
    
    // Create assignments (skip duplicates)
    const assignments = [];
    for (const studentId of studentIds) {
      const existing = await QuizAssignment.findOne({
        quizId: quiz._id,
        studentId
      });
      
      if (!existing) {
        const assignment = await QuizAssignment.create({
          quizId: quiz._id,
          studentId
        });
        assignments.push(assignment);
      }
    }
    
    // Send email notifications to newly assigned students
    if (assignments.length > 0) {
      const assignedStudentIds = assignments.map(a => a.studentId);
      const assignedStudents = students.filter(s => assignedStudentIds.includes(s._id.toString()));
      
      assignedStudents.forEach(async (student) => {
        try {
          await sendQuizAssignmentEmail(
            student.email,
            student.fullName,
            quiz.title,
            quiz.startTime,
            quiz.endTime,
            quiz.durationMinutes
          );
        } catch (emailError) {
          console.error(`Failed to send email to ${student.email}:`, emailError);
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: `Quiz assigned to ${assignments.length} new student(s). Email notifications sent.`,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning quiz',
      error: error.message
    });
  }
};

// Get assigned students for a quiz
exports.getAssignedStudents = async (req, res) => {
  try {
    const quiz = req.quiz;
    
    const assignments = await QuizAssignment.find({ quizId: quiz._id })
      .populate('studentId', 'fullName email studentId department');
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned students',
      error: error.message
    });
  }
};

// Remove student assignment
exports.removeStudentAssignment = async (req, res) => {
  try {
    const quiz = req.quiz;
    const { studentId } = req.params;
    
    const assignment = await QuizAssignment.findOneAndDelete({
      quizId: quiz._id,
      studentId
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Student assignment removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing assignment',
      error: error.message
    });
  }
};

// ============================================
// RESULTS & ANALYTICS (Own Quizzes Only)
// ============================================

// Get quiz results
exports.getQuizResults = async (req, res) => {
  try {
    const quiz = req.quiz;
    
    const attempts = await QuizAttempt.find({ quizId: quiz._id })
      .populate('studentId', 'fullName email studentId department')
      .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz results',
      error: error.message
    });
  }
};

// Get quiz analytics
exports.getQuizAnalytics = async (req, res) => {
  try {
    const quiz = req.quiz;
    
    const totalAssignments = await QuizAssignment.countDocuments({ quizId: quiz._id });
    const totalAttempts = await QuizAttempt.countDocuments({ quizId: quiz._id });
    const submittedAttempts = await QuizAttempt.countDocuments({ 
      quizId: quiz._id, 
      status: 'submitted' 
    });
    
    // Score statistics
    const scoreStats = await QuizAttempt.aggregate([
      { $match: { quizId: quiz._id, status: 'submitted' } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalScore' },
          maxScore: { $max: '$totalScore' },
          minScore: { $min: '$totalScore' },
          avgPercentage: { $avg: '$percentage' }
        }
      }
    ]);
    
    // Pass/fail count
    const passCount = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      status: 'submitted',
      totalScore: { $gte: quiz.passingMarks }
    });
    
    const failCount = submittedAttempts - passCount;
    
    res.status(200).json({
      success: true,
      data: {
        quiz: {
          title: quiz.title,
          totalMarks: quiz.totalMarks,
          passingMarks: quiz.passingMarks
        },
        assignments: {
          total: totalAssignments
        },
        attempts: {
          total: totalAttempts,
          submitted: submittedAttempts,
          inProgress: totalAttempts - submittedAttempts
        },
        scores: scoreStats[0] || {
          avgScore: 0,
          maxScore: 0,
          minScore: 0,
          avgPercentage: 0
        },
        passFailStats: {
          passed: passCount,
          failed: failCount,
          passRate: submittedAttempts > 0 ? ((passCount / submittedAttempts) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz analytics',
      error: error.message
    });
  }
};

// Get overall coordinator analytics
exports.getMyAnalytics = async (req, res) => {
  try {
    const coordinatorId = req.user._id;
    
    const totalQuizzes = await Quiz.countDocuments({ coordinatorId });
    const publishedQuizzes = await Quiz.countDocuments({ 
      coordinatorId, 
      status: 'published' 
    });
    const draftQuizzes = await Quiz.countDocuments({ 
      coordinatorId, 
      status: 'draft' 
    });
    
    // Get all quiz IDs
    const quizIds = await Quiz.find({ coordinatorId }).select('_id');
    const quizIdArray = quizIds.map(q => q._id);
    
    const totalAssignments = await QuizAssignment.countDocuments({ 
      quizId: { $in: quizIdArray } 
    });
    const totalAttempts = await QuizAttempt.countDocuments({ 
      quizId: { $in: quizIdArray } 
    });
    
    res.status(200).json({
      success: true,
      data: {
        quizzes: {
          total: totalQuizzes,
          published: publishedQuizzes,
          draft: draftQuizzes
        },
        assignments: {
          total: totalAssignments
        },
        attempts: {
          total: totalAttempts
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// ============================================
// QUESTION BANK
// ============================================

// Get all questions from personal question bank
exports.getQuestionBank = async (req, res) => {
  try {
    const { subject, topic, difficulty, page = 1, limit = 20 } = req.query;
    
    const query = { coordinatorId: req.user._id };
    
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    
    const skip = (page - 1) * limit;
    
    const questions = await QuestionBank.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await QuestionBank.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching question bank',
      error: error.message
    });
  }
};

// Add question to personal bank
exports.addToQuestionBank = async (req, res) => {
  try {
    const {
      questionText,
      questionType,
      subject,
      topic,
      difficulty,
      tags,
      options,
      correctAnswer
    } = req.body;
    
    if (!questionText || !questionType || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide questionText, questionType, and subject'
      });
    }
    
    const question = await QuestionBank.create({
      coordinatorId: req.user._id,
      questionText,
      questionType,
      subject,
      topic,
      difficulty: difficulty || 'medium',
      tags: tags || [],
      options: options || [],
      correctAnswer
    });
    
    res.status(201).json({
      success: true,
      message: 'Question added to bank',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding question to bank',
      error: error.message
    });
  }
};

// Delete question from bank
exports.deleteFromQuestionBank = async (req, res) => {
  try {
    const question = await QuestionBank.findOneAndDelete({
      _id: req.params.questionId,
      coordinatorId: req.user._id
    });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in your bank'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Question deleted from bank'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// ============================================
// STUDENT LIST
// ============================================

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const { department, page = 1, limit = 50, search } = req.query;
    
    const query = { role: 'student', isActive: true };
    
    if (department) query.department = department;
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const students = await User.find(query)
      .select('fullName email studentId department')
      .sort({ fullName: 1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

// ============================================
// BULK UPLOAD QUESTIONS
// ============================================

// Bulk upload questions from CSV
exports.bulkUploadQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }

    const result = await parseQuestionsCSV(req.file.path);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors found',
        errors: result.errors
      });
    }

    // Add coordinatorId to all questions and save to question bank
    const savedQuestions = await QuestionBank.insertMany(
      result.questions.map(q => ({
        ...q,
        coordinatorId: req.user._id
      }))
    );

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${savedQuestions.length} questions to your question bank`,
      data: {
        totalUploaded: savedQuestions.length,
        questions: savedQuestions
      }
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading questions: ' + error.message
    });
  }
};

// Download question template CSV
exports.downloadQuestionTemplate = async (req, res) => {
  try {
    const template = generateQuestionTemplate();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=question_template.csv');
    res.send(template);
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating template: ' + error.message
    });
  }
};

module.exports = exports;

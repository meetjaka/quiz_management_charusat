import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  UserCog,
  FileText,
  Activity,
  Target,
  Plus,
  BarChart3,
  Settings,
  ArrowRight,
  Clock,
  School,
  AlertCircle,
} from "lucide-react";
import Layout from "../../components/Layout";
import apiClient from "../../api";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  const fetchDashboardAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }
      const response = await apiClient.get("/admin/analytics/system");
      setAnalytics(response.data.data);
      setError(null);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        setError("Session expired. Please log in again.");
      } else if (status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (status === 500) {
        setError("Server error: " + (message || "Please try again later."));
      } else if (!err.response) {
        setError(
          "Network error. Please check if the backend server is running.",
        );
      } else {
        setError(message || "Failed to fetch analytics");
      }
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm font-medium text-gray-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Admin Dashboard">
        <div className="mx-auto max-w-lg mt-8">
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 flex flex-col items-center text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-800">
              Failed to load data
            </h3>
            <p className="mt-2 text-sm text-red-600 mb-6">{error}</p>
            <button
              onClick={fetchDashboardAnalytics}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50 transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { overview, recentQuizzes, recentAttempts, departmentStats } =
    analytics || {};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Layout title="Admin Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Monitor and manage your quiz management system
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Students"
            value={overview?.totalStudents || 0}
            icon={Users}
            color="text-blue-600"
            bg="bg-blue-50"
            link="/admin/users?role=student"
          />
          <StatCard
            title="Coordinators"
            value={overview?.totalCoordinators || 0}
            icon={UserCog}
            color="text-purple-600"
            bg="bg-purple-50"
            link="/admin/users?role=coordinator"
          />
          <StatCard
            title="Total Quizzes"
            value={overview?.totalQuizzes || 0}
            icon={FileText}
            color="text-emerald-600"
            bg="bg-emerald-50"
            link="/admin/quizzes"
          />
          <StatCard
            title="Active Quizzes"
            value={overview?.activeQuizzes || 0}
            icon={Activity}
            color="text-amber-600"
            bg="bg-amber-50"
            link="/admin/quizzes?status=active"
          />
          <StatCard
            title="Total Attempts"
            value={overview?.totalAttempts || 0}
            icon={Target}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (Left - 2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Attempts Table */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Quiz Attempts
                </h2>
                <Link
                  to="/admin/analytics"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View Analytics <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Quiz</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentAttempts && recentAttempts.length > 0 ? (
                      recentAttempts.map((attempt) => (
                        <tr
                          key={attempt._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {attempt.studentId?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {attempt.studentId?.enrollmentNumber || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {attempt.quizId?.title || "Unknown Quiz"}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {attempt.totalScore !== undefined
                              ? `${attempt.totalScore}%`
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                attempt.status === "submitted"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {attempt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(attempt.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-gray-400"
                        >
                          No recent attempts found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Department Statistics */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Department Statistics
              </h2>
              <div className="space-y-5">
                {departmentStats && departmentStats.length > 0 ? (
                  departmentStats.map((dept, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {dept._id || "Not Specified"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {dept.count} students
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(dept.count / (overview?.totalStudents || 1)) * 100}%`,
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-blue-600 h-2.5 rounded-full"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No department data available
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Column (Right - 1 Col) */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <QuickActionButton
                  title="Create Quiz"
                  icon={Plus}
                  link="/admin/quizzes"
                  color="text-blue-600"
                  bg="bg-blue-50"
                  borderColor="hover:border-blue-200"
                />
                <QuickActionButton
                  title="Add User"
                  icon={Users}
                  link="/admin/users"
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                  borderColor="hover:border-emerald-200"
                />
                <QuickActionButton
                  title="Analytics"
                  icon={BarChart3}
                  link="/admin/analytics"
                  color="text-purple-600"
                  bg="bg-purple-50"
                  borderColor="hover:border-purple-200"
                />
                <QuickActionButton
                  title="Manage"
                  icon={Settings}
                  link="/admin/quizzes"
                  color="text-orange-600"
                  bg="bg-orange-50"
                  borderColor="hover:border-orange-200"
                />
              </div>
            </motion.div>

            {/* Recent Quizzes List */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-900">Recent Quizzes</h2>
                <Link
                  to="/admin/quizzes"
                  className="text-xs font-medium text-gray-500 hover:text-blue-600"
                >
                  View All
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {recentQuizzes && recentQuizzes.length > 0 ? (
                  recentQuizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {quiz.title}
                        </h3>
                        {quiz.isActive && quiz.isPublished ? (
                          <span className="flex h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-50" />
                        ) : (
                          <span className="flex h-2 w-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        By {quiz.createdBy?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <School className="w-3 h-3" />{" "}
                          {quiz.questions?.length || 0} Qs
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {quiz.duration}m
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-gray-500">
                    No quizzes created yet
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

// --- Sub Components ---

const StatCard = ({ title, value, icon: Icon, color, bg, link }) => {
  const content = (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {link && <ArrowRight className="w-4 h-4 text-gray-300" />}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
      </div>
    </motion.div>
  );

  return link ? (
    <Link to={link} className="block h-full">
      {content}
    </Link>
  ) : (
    <div className="h-full">{content}</div>
  );
};

const QuickActionButton = ({
  title,
  icon: Icon,
  link,
  color,
  bg,
  borderColor,
}) => {
  return (
    <Link
      to={link}
      className={`flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl transition-all hover:shadow-sm group ${borderColor}`}
    >
      <div
        className={`p-3 rounded-full mb-3 group-hover:scale-110 transition-transform ${bg}`}
      >
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
        {title}
      </span>
    </Link>
  );
};

export default AdminDashboard;

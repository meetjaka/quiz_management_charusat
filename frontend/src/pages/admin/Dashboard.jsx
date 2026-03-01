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
        setError("Network error. Please check if the backend server is running.");
      } else {
        setError(message || "Failed to fetch analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
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
          <div className="rounded-md border border-danger/20 bg-danger/5 p-6 flex flex-col items-center text-center">
            <AlertCircle className="h-10 w-10 text-danger mb-4" />
            <h3 className="text-lg font-semibold text-danger">
              Failed to load data
            </h3>
            <p className="mt-2 text-sm text-danger/80 mb-6">{error}</p>
            <button
              onClick={fetchDashboardAnalytics}
              className="px-4 py-2 bg-card text-danger border border-danger/20 rounded-md font-medium hover:bg-danger/5 transition-colors subtle-shadow"
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
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Layout title="Admin Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 max-w-7xl mx-auto"
      >
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-secondary tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Monitor and manage your quiz management system
            </p>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-card px-3 py-1.5 rounded-md border border-border subtle-shadow">
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
            color="text-primary"
            bg="bg-primary/10"
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
              className="bg-card rounded-md border border-border overflow-hidden subtle-shadow"
            >
              <div className="p-5 flex justify-between items-center border-b border-border/50">
                <h2 className="text-base font-semibold text-secondary">
                  Recent Quiz Attempts
                </h2>
                <Link
                  to="/admin/analytics"
                  className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                >
                  View Analytics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-border/50">
                    <tr>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Student</th>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Quiz</th>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Score</th>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttempts && recentAttempts.length > 0 ? (
                      recentAttempts.map((attempt) => (
                        <tr
                          key={attempt._id}
                          className="hover:bg-gray-50/50 transition-colors border-b border-border/30 last:border-0"
                        >
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-secondary">
                              {attempt.studentId?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {attempt.studentId?.enrollmentNumber || "N/A"}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600">
                            {attempt.quizId?.title || "Unknown Quiz"}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-secondary">
                            {attempt.totalScore !== undefined
                              ? `${attempt.totalScore}%`
                              : "N/A"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${attempt.status === "submitted"
                                  ? "bg-success/10 text-success border-success/20"
                                  : "bg-warning/10 text-warning border-warning/20"
                                }`}
                            >
                              {attempt.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs text-nowrap">
                            {new Date(attempt.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-5 py-12 text-center text-gray-400"
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
              className="bg-card rounded-md border border-border p-6 subtle-shadow"
            >
              <h2 className="text-base font-semibold text-secondary mb-5">
                Department Statistics
              </h2>
              <div className="space-y-4">
                {departmentStats && departmentStats.length > 0 ? (
                  departmentStats.map((dept, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-secondary">
                          {dept._id || "Not Specified"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dept.count} students
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(dept.count / (overview?.totalStudents || 1)) * 100}%`,
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-primary h-1.5 rounded-full"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-6 text-sm">
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
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton
                  title="Create Quiz"
                  icon={Plus}
                  link="/admin/quizzes"
                  color="text-primary"
                  bg="bg-primary/5"
                  borderColor="hover:border-primary/30"
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
              className="bg-card rounded-md border border-border overflow-hidden subtle-shadow"
            >
              <div className="p-4 border-b border-border/50 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-secondary">Recent Quizzes</h2>
                <Link
                  to="/admin/quizzes"
                  className="text-xs font-medium text-gray-500 hover:text-primary transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="divide-y divide-border/50">
                {recentQuizzes && recentQuizzes.length > 0 ? (
                  recentQuizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="p-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-sm font-medium text-secondary line-clamp-1">
                          {quiz.title}
                        </h3>
                        {quiz.isActive && quiz.isPublished ? (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-success ring-4 ring-success/10 mt-1" />
                        ) : (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-gray-300 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mb-2">
                        By {quiz.createdBy?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
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
                  <div className="p-6 text-center text-sm text-gray-400">
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
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1 },
      }}
      className="bg-card p-4 rounded-md border border-border subtle-shadow hover:shadow-md transition-all h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-md ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {link && <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors" />}
      </div>
      <div>
        <h3 className="text-xl font-bold text-secondary">{value}</h3>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{title}</p>
      </div>
    </motion.div>
  );

  return link ? (
    <Link to={link} className="block h-full group">
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
      className={`flex flex-col items-center justify-center p-3 bg-card border border-border rounded-md transition-all hover:bg-gray-50 group`}
    >
      <div
        className={`p-2 rounded-md mb-2 group-hover:scale-110 transition-transform ${bg}`}
      >
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <span className="text-[11px] font-medium text-gray-600 group-hover:text-secondary">
        {title}
      </span>
    </Link>
  );
};

export default AdminDashboard;

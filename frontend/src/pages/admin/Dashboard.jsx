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
  TrendingUp,
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
      <Layout title="Dashboard">
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
            <p className="text-sm font-medium text-secondary-500">
              Loading dashboard analytics...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="mx-auto max-w-lg mt-8">
          <div className="rounded-xl border border-danger-200 bg-danger-50 p-6 flex flex-col items-center text-center shadow-card">
            <AlertCircle className="h-10 w-10 text-danger-500 mb-4" />
            <h3 className="text-lg font-semibold text-danger-800">
              Failed to load data
            </h3>
            <p className="mt-2 text-sm text-danger-600 mb-6">{error}</p>
            <button
              onClick={fetchDashboardAnalytics}
              className="px-4 py-2 bg-white text-danger-600 border border-danger-200 rounded-lg font-medium hover:bg-danger-50 transition-colors shadow-card active:scale-95"
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
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <Layout title="Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-12"
      >
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 tracking-tight mb-1">
              System Overview
            </h1>
            <p className="text-sm text-secondary-500 font-medium">
              Monitor top-level metrics and recent activity across the platform.
            </p>
          </div>
          <div className="text-xs font-semibold text-secondary-500 bg-white px-3.5 py-2 rounded-lg border border-secondary-200 shadow-card flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Overview Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <StatCard
            title="Total Students"
            value={overview?.totalStudents || 0}
            icon={Users}
            color="text-brand-600"
            bg="bg-brand-50"
            link="/admin/users?role=student"
          />
          <StatCard
            title="Coordinators"
            value={overview?.totalCoordinators || 0}
            icon={UserCog}
            color="text-accent-600"
            bg="bg-accent-50"
            link="/admin/users?role=coordinator"
          />
          <StatCard
            title="Total Quizzes"
            value={overview?.totalQuizzes || 0}
            icon={FileText}
            color="text-success-600"
            bg="bg-success-50"
            link="/admin/quizzes"
          />
          <StatCard
            title="Active Quizzes"
            value={overview?.activeQuizzes || 0}
            icon={Activity}
            color="text-warning-600"
            bg="bg-warning-50"
            link="/admin/quizzes?status=active"
          />
          <StatCard
            title="Total Attempts"
            value={overview?.totalAttempts || 0}
            icon={Target}
            color="text-primary-600"
            bg="bg-primary-50"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Column (Left - 2 Cols) */}
          <div className="xl:col-span-2 space-y-8">

            {/* Recent Attempts Table */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-card border border-secondary-200 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-secondary-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-lg font-bold text-secondary-900 tracking-tight">
                    Recent Quiz Attempts
                  </h2>
                  <p className="text-xs text-secondary-500 mt-0.5">Latest student activity across all departments.</p>
                </div>
                <Link
                  to="/admin/analytics"
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-brand-50 transition-colors"
                >
                  View Analytics <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-secondary-50/80 text-secondary-500 font-semibold text-xs uppercase tracking-wider border-b border-secondary-100">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-lg">Student Details</th>
                      <th className="px-6 py-4">Quiz Name</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 rounded-tr-lg">Completion Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100">
                    {recentAttempts && recentAttempts.length > 0 ? (
                      recentAttempts.map((attempt) => (
                        <tr
                          key={attempt._id}
                          className="hover:bg-secondary-50/50 transition-colors group cursor-default"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                                {attempt.studentId?.name?.charAt(0) || "U"}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-secondary-900">
                                  {attempt.studentId?.name || "Unknown Student"}
                                </span>
                                <span className="text-xs text-secondary-500">
                                  {attempt.studentId?.enrollmentNumber || "No Enrollment ID"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-secondary-700 font-medium">
                              {attempt.quizId?.title || "Unknown Quiz"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-secondary-900">
                              {attempt.totalScore !== undefined
                                ? `${attempt.totalScore}%`
                                : "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${attempt.status === "submitted"
                                  ? "bg-success-50 text-success-700 border-success-200"
                                  : "bg-warning-50 text-warning-700 border-warning-200"
                                }`}
                            >
                              {attempt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-secondary-500 font-medium">
                            {new Date(attempt.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-secondary-400 bg-secondary-50/30"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Activity className="w-8 h-8 text-secondary-300 mb-2" />
                            <p className="font-medium">No recent attempts found</p>
                          </div>
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
              className="bg-white rounded-xl shadow-card border border-secondary-200 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-secondary-900 tracking-tight">
                    Department Distribution
                  </h2>
                  <p className="text-xs text-secondary-500 mt-0.5">Student counts by enrolled department.</p>
                </div>
                <div className="bg-brand-50 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-brand-600" />
                </div>
              </div>
              <div className="space-y-5">
                {departmentStats && departmentStats.length > 0 ? (
                  departmentStats.map((dept, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-sm font-semibold text-secondary-700 group-hover:text-brand-600 transition-colors">
                          {dept._id || "Not Specified"}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-secondary-900">
                            {dept.count}
                          </span>
                          <span className="text-xs text-secondary-400">students</span>
                        </div>
                      </div>
                      <div className="w-full bg-secondary-100 rounded-full h-2 overflow-hidden shadow-inner flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(dept.count / (overview?.totalStudents || 1)) * 100}%`,
                          }}
                          transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                          className="bg-brand-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-secondary-400 py-8 bg-secondary-50/50 rounded-lg border border-dashed border-secondary-200">
                    <p className="font-medium">No department data available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Column (Right - 1 Col) */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-card border border-secondary-200">
              <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <QuickActionButton
                  title="New Quiz"
                  icon={Plus}
                  link="/admin/quizzes"
                  color="text-brand-600"
                  bg="bg-brand-50"
                  borderColor="border-secondary-100 hover:border-brand-200 hover:shadow-card-hover"
                />
                <QuickActionButton
                  title="Add User"
                  icon={Users}
                  link="/admin/users"
                  color="text-success-600"
                  bg="bg-success-50"
                  borderColor="border-secondary-100 hover:border-success-200 hover:shadow-card-hover"
                />
                <QuickActionButton
                  title="Reports"
                  icon={BarChart3}
                  link="/admin/analytics"
                  color="text-accent-600"
                  bg="bg-accent-50"
                  borderColor="border-secondary-100 hover:border-accent-200 hover:shadow-card-hover"
                />
                <QuickActionButton
                  title="Sys Config"
                  icon={Settings}
                  link="/admin/quizzes"
                  color="text-warning-600"
                  bg="bg-warning-50"
                  borderColor="border-secondary-100 hover:border-warning-200 hover:shadow-card-hover"
                />
              </div>
            </motion.div>

            {/* Recent Quizzes List */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-card border border-secondary-200 overflow-hidden"
            >
              <div className="p-5 border-b border-secondary-100 flex justify-between items-center bg-white">
                <h2 className="font-bold text-secondary-900 tracking-tight">Recent Quizzes</h2>
                <Link
                  to="/admin/quizzes"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded bg-brand-50"
                >
                  View All
                </Link>
              </div>
              <div className="divide-y divide-secondary-100">
                {recentQuizzes && recentQuizzes.length > 0 ? (
                  recentQuizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="p-5 hover:bg-secondary-50/50 transition-colors group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-sm font-semibold text-secondary-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {quiz.title}
                        </h3>
                        {quiz.isActive && quiz.isPublished ? (
                          <span className="flex h-2.5 w-2.5 rounded-full bg-success-500 shadow-[0_0_0_4px_rgba(34,197,94,0.15)] mt-1" />
                        ) : (
                          <span className="flex h-2.5 w-2.5 rounded-full bg-secondary-300 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-secondary-500 mb-3 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary-300"></span>
                        {quiz.createdBy?.name || "Unknown Author"}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">
                        <span className="flex items-center gap-1.5 bg-secondary-100 px-2 py-1 rounded-md">
                          <School className="w-3.5 h-3.5" />
                          {quiz.questions?.length || 0} Qs
                        </span>
                        <span className="flex items-center gap-1.5 bg-secondary-100 px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          {quiz.duration}m
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-secondary-50/30">
                    <FileText className="w-8 h-8 text-secondary-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-secondary-500">No quizzes created yet</p>
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
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
      }}
      className="bg-white p-5 rounded-xl border border-secondary-200 shadow-card hover:shadow-card-hover transition-all h-full group relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/0 to-secondary-50/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-2.5 rounded-lg ${bg} ring-1 ring-inset ring-black/5`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {link && (
          <div className="p-1 rounded bg-secondary-50 text-secondary-300 opacity-0 group-hover:opacity-100 group-hover:text-brand-500 transition-all -translate-x-2 group-hover:translate-x-0">
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-3xl font-bold text-secondary-900 tracking-tight">{value}</h3>
        <p className="text-sm font-semibold text-secondary-500 mt-1">{title}</p>
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
      className={`flex flex-col items-center justify-center p-5 bg-white border rounded-xl transition-all ${borderColor}`}
    >
      <div
        className={`p-3.5 rounded-xl mb-3 ${bg} ring-1 ring-inset ring-black/5`}
      >
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <span className="text-sm font-semibold text-secondary-700 text-center">
        {title}
      </span>
    </Link>
  );
};

export default AdminDashboard;

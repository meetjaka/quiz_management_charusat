import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  Award,
  TrendingUp,
  Play,
  BarChart3,
  ArrowRight,
  AlertCircle,
  Calendar,
  Clock
} from "lucide-react";
import Layout from "../../components/Layout";
import api from "../../api";

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    availableQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    passRate: 0,
  });
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/auth/me");
      setUserProfile(response.data.data || response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [quizzesRes, resultsRes, analyticsRes] = await Promise.all([
        api.get("/student/quizzes"),
        api.get("/student/results"),
        api.get("/student/analytics")
      ]);

      const quizzes = quizzesRes.data.data || [];
      const results = resultsRes.data.data || [];
      const analytics = analyticsRes.data.data || {};

      setStats({
        availableQuizzes: quizzes.length,
        completedQuizzes: analytics.attempts?.total || 0,
        averageScore: (analytics.scores?.avgPercentage || 0).toFixed(1),
        passRate: (parseFloat(analytics.attempts?.passRate) || 0).toFixed(1),
      });

      // Get recent 5 results
      setRecentResults(results.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
            <p className="text-sm font-medium text-secondary-500">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 sm:p-8 rounded-xl shadow-card border border-secondary-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-brand-100/50 to-primary-100/50 rounded-full blur-3xl -z-10 -mt-16 -mr-16"></div>
          <div className="z-10">
            <h1 className="text-3xl font-bold text-secondary-900 tracking-tight mb-2">Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}! 👋</h1>
            <p className="text-sm font-medium text-secondary-500">Track your quiz performance, review results, and prepare for upcoming assignments.</p>
          </div>
          <div className="text-xs font-semibold text-secondary-500 bg-white/80 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-secondary-200/50 shadow-card flex items-center gap-2 z-10 w-fit">
            <Calendar className="w-4 h-4 text-brand-500" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Profile Info Card - Only show if quizzes are 0 */}
        {stats.availableQuizzes === 0 && userProfile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border border-warning-200 bg-warning-50 p-5 shadow-card"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-warning-900 mb-2">
                  No Quizzes Available
                </h3>
                <p className="text-sm text-warning-800 font-medium mb-4">
                  Quizzes are assigned based on your department and semester. Verify your profile information below:
                </p>
                <div className="bg-white/80 border border-warning-100 rounded-xl p-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div><span className="text-warning-600 font-semibold mb-1 block text-xs uppercase tracking-wider">Department</span> <span className="text-warning-900 font-medium">{userProfile.department || "Not set"}</span></div>
                  <div><span className="text-warning-600 font-semibold mb-1 block text-xs uppercase tracking-wider">Semester</span> <span className="text-warning-900 font-medium">{userProfile.semester || "Not set"}</span></div>
                  <div><span className="text-warning-600 font-semibold mb-1 block text-xs uppercase tracking-wider">Batch</span> <span className="text-warning-900 font-medium">{userProfile.batch || "Not set"}</span></div>
                  <div><span className="text-warning-600 font-semibold mb-1 block text-xs uppercase tracking-wider">Enrollment</span> <span className="text-warning-900 font-medium">{userProfile.enrollmentNumber || "Not set"}</span></div>
                </div>
                <p className="mt-4 text-xs font-semibold text-warning-700">
                  ⚠️ If the details above are incorrect, your quizzes won't appear. Please contact your administrator to update your profile.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Available"
            value={stats.availableQuizzes}
            icon={FileText}
            color="text-brand-600"
            bg="bg-brand-50"
          />
          <StatCard
            title="Completed"
            value={stats.completedQuizzes}
            icon={CheckCircle2}
            color="text-success-600"
            bg="bg-success-50"
          />
          <StatCard
            title="Avg. Score"
            value={`${stats.averageScore}%`}
            icon={Award}
            color="text-warning-600"
            bg="bg-warning-50"
          />
          <StatCard
            title="Pass Rate"
            value={`${stats.passRate}%`}
            icon={TrendingUp}
            color="text-accent-600"
            bg="bg-accent-50"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* Recent Results */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-card border border-secondary-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-secondary-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-lg font-bold text-secondary-900 tracking-tight">Recent Results</h2>
                  <p className="text-xs text-secondary-500 mt-0.5">Your past quiz performance history.</p>
                </div>
                <Link
                  to="/student/results"
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-brand-50 transition-colors"
                >
                  View History <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div>
                {recentResults.length === 0 ? (
                  <div className="text-center py-16 bg-secondary-50/30">
                    <div className="w-16 h-16 bg-white shadow-card rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary-100">
                      <Award className="w-8 h-8 text-secondary-300" />
                    </div>
                    <h3 className="text-base font-bold text-secondary-900 mb-1">No results yet</h3>
                    <p className="text-sm font-medium text-secondary-500 mb-6 max-w-sm mx-auto">
                      Your completed quizzes and their results will appear here once you've finished them.
                    </p>
                    <Link
                      to="/student/quizzes"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-card hover:shadow transition-all active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4" />
                      Start a Quiz
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary-50/80 text-secondary-500 font-semibold text-xs uppercase tracking-wider border-b border-secondary-100">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Quiz details</th>
                          <th className="px-6 py-4 font-semibold">Score</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary-100 bg-white">
                        {recentResults.map((result) => (
                          <tr key={result._id} className="hover:bg-secondary-50/50 transition-colors group cursor-default">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-secondary-900 text-base mb-1">
                                {result.quizId?.title || "N/A"}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-semibold text-secondary-400">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(result.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-secondary-900 text-base">{result.percentage.toFixed(1)}%</span>
                                <span className="text-xs font-medium text-secondary-500">{result.totalScore}/{result.quizId?.totalMarks || 0} pts</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${result.isPassed
                                    ? "bg-success-50 text-success-700 border-success-200"
                                    : "bg-danger-50 text-danger-700 border-danger-200"
                                  }`}
                              >
                                {result.isPassed ? "Passed" : "Failed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-card border border-secondary-200">
              <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-4">Quick Links</h3>
              <div className="grid grid-cols-1 gap-3">
                <QuickActionCard
                  title="Start a Quiz"
                  description="View available assignments"
                  icon={Play}
                  link="/student/quizzes"
                  color="text-brand-600"
                  bg="bg-brand-50"
                />
                <QuickActionCard
                  title="Performance Analytics"
                  description="Deep dive into your stats"
                  icon={BarChart3}
                  link="/student/analytics"
                  color="text-accent-600"
                  bg="bg-accent-50"
                />
              </div>
            </motion.div>
          </div>
        </div>

      </motion.div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
    className="bg-white p-5 rounded-xl border border-secondary-200 shadow-card hover:shadow-card-hover transition-all h-full relative overflow-hidden group"
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/0 to-secondary-50/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 z-0"></div>
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-3 rounded-xl ${bg} ring-1 ring-inset ring-black/5`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-3xl sm:text-4xl font-bold text-secondary-900 tracking-tighter mb-1">{value}</h3>
      <p className="text-sm font-semibold text-secondary-500">{title}</p>
    </div>
  </motion.div>
);

const QuickActionCard = ({ title, description, icon: Icon, link, color, bg }) => (
  <Link to={link}>
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="flex items-center p-4 bg-white border border-secondary-200 rounded-xl transition-all hover:border-secondary-300 hover:shadow-card-hover group relative"
    >
      <div className={`p-3 rounded-xl ${bg} ring-1 ring-inset ring-black/5`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="ml-4 flex-1">
        <p className="font-semibold text-sm text-secondary-900 group-hover:text-brand-600 transition-colors">{title}</p>
        <p className="text-xs text-secondary-500 font-medium">{description}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-secondary-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
        <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:text-brand-600 transition-colors" />
      </div>
    </motion.div>
  </Link>
);

export default StudentDashboard;

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
  Calendar
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
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm font-medium text-gray-500">Loading dashboard...</p>
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
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout title="Student Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 max-w-7xl mx-auto"
      >
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-secondary tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1 text-sm">Track your quiz performance and progress</p>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-card px-3 py-1.5 rounded-md border border-border subtle-shadow">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Profile Info Card - Only show if quizzes are 0 */}
        {stats.availableQuizzes === 0 && userProfile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-md border border-warning/20 bg-warning/5 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-warning mb-2">
                  No Quizzes Available
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Quizzes are matched based on your profile details. Make sure your information is correct:
                </p>
                <div className="bg-card rounded-md p-3 space-y-1.5 text-sm border border-border">
                  <p className="text-gray-700"><strong>Department:</strong> {userProfile.department || "Not set"}</p>
                  <p className="text-gray-700"><strong>Semester:</strong> {userProfile.semester || "Not set"}</p>
                  <p className="text-gray-700"><strong>Batch:</strong> {userProfile.batch || "Not set"}</p>
                  <p className="text-gray-700"><strong>Enrollment:</strong> {userProfile.enrollmentNumber || "Not set"}</p>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  <strong>Note:</strong> Your profile details must <strong>exactly match</strong> the quiz settings. Contact your admin if issues persist.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Available Quizzes"
            value={stats.availableQuizzes}
            icon={FileText}
            color="text-primary"
            bg="bg-primary/10"
          />
          <StatCard
            title="Completed"
            value={stats.completedQuizzes}
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon={Award}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            title="Pass Rate"
            value={`${stats.passRate}%`}
            icon={TrendingUp}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard
              title="Start a Quiz"
              description="View available quizzes"
              icon={Play}
              link="/student/quizzes"
              color="text-primary"
              bg="bg-primary/5"
            />
            <QuickActionCard
              title="View Results"
              description="Check your performance"
              icon={BarChart3}
              link="/student/results"
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
          </div>
        </motion.div>

        {/* Recent Results */}
        <motion.div variants={itemVariants} className="bg-card rounded-md border border-border overflow-hidden subtle-shadow">
          <div className="p-5 border-b border-border/50">
            <h2 className="text-base font-semibold text-secondary">Recent Results</h2>
          </div>
          <div className="p-0">
            {recentResults.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-secondary">No results yet</h3>
                <p className="mt-1 text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                  Start taking quizzes to see your results here.
                </p>
                <Link
                  to="/student/quizzes"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary/50 transition-all subtle-shadow active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  View Available Quizzes
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-border/50">
                    <tr>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Quiz</th>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Score</th>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentResults.map((result) => (
                      <tr key={result._id} className="hover:bg-gray-50/50 transition-colors border-b border-border/30 last:border-0">
                        <td className="px-5 py-3.5 font-medium text-secondary">
                          {result.quizId?.title || "N/A"}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {result.totalScore}/{result.quizId?.totalMarks || 0} <span className="text-gray-400">({result.percentage.toFixed(1)}%)</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${result.isPassed
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-danger/10 text-danger border-danger/20"
                              }`}
                          >
                            {result.isPassed ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                          <div className="flex items-center gap-1.5 focus:outline-none">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(result.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }}
    className="bg-card p-4 rounded-md border border-border subtle-shadow hover:shadow-md transition-all h-full"
  >
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-md ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
    <div>
      <h3 className="text-xl font-bold text-secondary">{value}</h3>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{title}</p>
    </div>
  </motion.div>
);

const QuickActionCard = ({ title, description, icon: Icon, link, color, bg }) => (
  <Link to={link}>
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="flex items-center p-4 bg-card border border-border rounded-md transition-all hover:shadow-md subtle-shadow group group-hover:bg-gray-50/50"
    >
      <div className={`p-2 rounded-md ${bg} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="ml-4 flex-1">
        <p className="font-medium text-sm text-secondary group-hover:text-primary transition-colors">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </motion.div>
  </Link>
);

export default StudentDashboard;

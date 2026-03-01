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
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout title="Student Dashboard">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Track your quiz performance and progress</p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Profile Info Card - Only show if quizzes are 0 */}
        {stats.availableQuizzes === 0 && userProfile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border border-yellow-200 bg-yellow-50 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                  No Quizzes Available
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Quizzes are matched based on your profile details. Make sure your information is correct:
                </p>
                <div className="bg-white/60 rounded-lg p-3 space-y-1.5 text-sm">
                  <p className="text-gray-700"><strong>Department:</strong> {userProfile.department || "Not set"}</p>
                  <p className="text-gray-700"><strong>Semester:</strong> {userProfile.semester || "Not set"}</p>
                  <p className="text-gray-700"><strong>Batch:</strong> {userProfile.batch || "Not set"}</p>
                  <p className="text-gray-700"><strong>Enrollment:</strong> {userProfile.enrollmentNumber || "Not set"}</p>
                </div>
                <p className="mt-3 text-xs text-yellow-700">
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
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Completed"
            value={stats.completedQuizzes}
            icon={CheckCircle2}
            color="text-green-600"
            bg="bg-green-50"
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
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard
              title="Start a Quiz"
              description="View available quizzes"
              icon={Play}
              link="/student/quizzes"
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <QuickActionCard
              title="View Results"
              description="Check your performance"
              icon={BarChart3}
              link="/student/results"
              color="text-green-600"
              bg="bg-green-50"
            />
          </div>
        </motion.div>

        {/* Recent Results */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Results</h2>
          </div>
          <div className="p-6">
            {recentResults.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-gray-900">No results yet</h3>
                <p className="mt-1 text-sm text-gray-500 mb-6">
                  Start taking quizzes to see your results here.
                </p>
                <Link
                  to="/student/quizzes"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                  <Play className="w-4 h-4" />
                  View Available Quizzes
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-medium">Quiz</th>
                      <th className="px-6 py-3 font-medium">Score</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentResults.map((result) => (
                      <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {result.quizId?.title || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {result.totalScore}/{result.quizId?.totalMarks || 0} (
                          {result.percentage.toFixed(1)}%)
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              result.isPassed
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {result.isPassed ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(result.createdAt).toLocaleDateString()}
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
    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
    className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all h-full"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-lg ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
    </div>
  </motion.div>
);

const QuickActionCard = ({ title, description, icon: Icon, link, color, bg }) => (
  <Link to={link}>
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center p-5 bg-white border border-gray-200 rounded-xl transition-all hover:shadow-sm group"
    >
      <div className={`p-3 rounded-full ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="ml-4 flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
    </motion.div>
  </Link>
);

export default StudentDashboard;

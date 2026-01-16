import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  CheckCircle2, 
  Target, 
  BarChart3, 
  Calendar, 
  Clock, 
  Users,
  ArrowRight,
  AlertCircle,
  Plus,
  Activity
} from "lucide-react";
import Layout from "../../components/Layout";
import apiClient from "../../api";

const CoordinatorDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, analyticsRes] = await Promise.all([
        apiClient.get("/coordinator/quizzes?limit=5"),
        apiClient.get("/coordinator/analytics")
      ]);

      setQuizzes(quizzesRes.data.data || []);
      setStats(analyticsRes.data.data || {});

      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Coordinator Dashboard">
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
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
    <Layout title="Coordinator Dashboard">
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
            <p className="text-gray-500 mt-1">Manage your assigned quizzes and monitor student performance</p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border border-red-100 bg-red-50 p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm font-medium text-red-800">{error}</span>
          </motion.div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Quizzes"
              value={stats.quizzes?.total || 0}
              icon={FileText}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <StatCard
              title="Published Quizzes"
              value={stats.quizzes?.published || 0}
              icon={CheckCircle2}
              color="text-green-600"
              bg="bg-green-50"
            />
            <StatCard
              title="Total Attempts"
              value={stats.attempts?.total || 0}
              icon={Target}
              color="text-orange-600"
              bg="bg-orange-50"
            />
          </div>
        )}

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              title="View All Quizzes"
              description="Manage your assigned quizzes"
              icon={FileText}
              link="/coordinator/quizzes"
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <QuickActionCard
              title="View Analytics"
              description="Check quiz results and analytics"
              icon={BarChart3}
              link="/coordinator/analytics"
              color="text-purple-600"
              bg="bg-purple-50"
            />
          </div>
        </motion.div>

        {/* Recent Quizzes */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Assigned Quizzes</h2>
            <Link to="/coordinator/quizzes" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No quizzes assigned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.slice(0, 5).map((quiz) => (
                  <div
                    key={quiz._id}
                    className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {quiz.department} - {quiz.semester} - {quiz.subject}
                        </p>
                        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(quiz.startTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{quiz.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{quiz.totalAttempts || 0} attempts</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        {quiz.isActive && new Date(quiz.endTime) >= new Date() ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                            <Activity className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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

export default CoordinatorDashboard;

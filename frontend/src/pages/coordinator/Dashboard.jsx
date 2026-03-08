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
  Activity,
  Sparkles,
  BookOpen
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 tracking-tight mb-1">Coordinator Overview</h1>
            <p className="text-sm font-medium text-secondary-500">Manage your assigned quizzes and monitor student performance.</p>
          </div>
          <div className="text-xs font-semibold text-secondary-500 bg-white px-3.5 py-2 rounded-lg border border-secondary-200 shadow-card flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-500" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border border-danger-200 bg-danger-50 p-4 flex items-center gap-3 shadow-card"
          >
            <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0" />
            <span className="text-sm font-medium text-danger-800">{error}</span>
          </motion.div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Total Quizzes"
              value={stats.quizzes?.total || 0}
              icon={FileText}
              color="text-brand-600"
              bg="bg-brand-50"
            />
            <StatCard
              title="Published Quizzes"
              value={stats.quizzes?.published || 0}
              icon={CheckCircle2}
              color="text-success-600"
              bg="bg-success-50"
            />
            <StatCard
              title="Total Attempts"
              value={stats.attempts?.total || 0}
              icon={Target}
              color="text-accent-600"
              bg="bg-accent-50"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            {/* Recent Quizzes */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-card border border-secondary-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-secondary-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-lg font-bold text-secondary-900 tracking-tight">Assigned Quizzes</h2>
                  <p className="text-xs text-secondary-500 mt-0.5">Your most recently created or updated quizzes.</p>
                </div>
                <Link to="/coordinator/quizzes" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-brand-50 transition-colors">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-0">
                {quizzes.length === 0 ? (
                  <div className="text-center py-12 bg-secondary-50/30">
                    <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-secondary-500">No quizzes assigned yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-secondary-100">
                    {quizzes.slice(0, 5).map((quiz) => (
                      <div
                        key={quiz._id}
                        className="p-5 hover:bg-secondary-50/50 transition-all group cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-secondary-900 text-base mb-1 group-hover:text-brand-600 transition-colors">
                              {quiz.title}
                            </h3>
                            <p className="text-xs font-medium text-secondary-500 mb-3 flex items-center gap-1.5">
                              <span className="bg-secondary-100 px-2 py-0.5 rounded text-secondary-600">{quiz.department}</span>
                              <span className="bg-secondary-100 px-2 py-0.5 rounded text-secondary-600">{quiz.semester}</span>
                              <span className="text-secondary-400">•</span>
                              <span>{quiz.subject}</span>
                            </p>
                            <div className="flex items-center flex-wrap gap-4 text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(quiz.startTime).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{quiz.duration} min</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                <span>{quiz.stats?.totalAttempts ?? 0} attempts</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            {quiz.isActive && new Date(quiz.endTime) >= new Date() ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border bg-success-50 text-success-700 border-success-200">
                                <Activity className="w-3 h-3 mr-1.5" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border bg-secondary-50 text-secondary-600 border-secondary-200">
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
          </div>

          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-card border border-secondary-200">
              <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <QuickActionCard
                  title="Create New Quiz"
                  description="Manually create a quiz"
                  icon={Plus}
                  link="/coordinator/quizzes/create"
                  color="text-brand-600"
                  bg="bg-brand-50"
                />
                <QuickActionCard
                  title="Generate from AI"
                  description="Fast quiz generation"
                  icon={Sparkles}
                  link="/coordinator/json-generator"
                  color="text-success-600"
                  bg="bg-success-50"
                  badge="NEW"
                />
                <QuickActionCard
                  title="Question Bank"
                  description="Manage reusable questions"
                  icon={BookOpen}
                  link="/coordinator/question-bank"
                  color="text-accent-600"
                  bg="bg-accent-50"
                />
              </div>
            </motion.div>

            {/* Overview Analytics Links */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-card border border-secondary-200">
              <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-4">Overview & Reports</h3>
              <div className="grid grid-cols-1 gap-3">
                <QuickActionCard
                  title="View All Quizzes"
                  description="Manage your assigned quizzes"
                  icon={FileText}
                  link="/coordinator/quizzes"
                  color="text-brand-600"
                  bg="bg-brand-50"
                />
                <QuickActionCard
                  title="View Analytics"
                  description="Check quiz results and charts"
                  icon={BarChart3}
                  link="/coordinator/analytics"
                  color="text-warning-600"
                  bg="bg-warning-50"
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
      <div className={`p-2.5 rounded-lg ${bg} ring-1 ring-inset ring-black/5`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-3xl font-bold text-secondary-900 tracking-tight">{value}</h3>
      <p className="text-sm font-semibold text-secondary-500 mt-1">{title}</p>
    </div>
  </motion.div>
);

const QuickActionCard = ({ title, description, icon: Icon, link, color, bg, badge }) => (
  <Link to={link}>
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="flex items-center p-4 bg-white border border-secondary-200 rounded-xl transition-all hover:border-secondary-300 hover:shadow-card-hover group relative"
    >
      {badge && (
        <span className="absolute top-2 right-2 text-[10px] font-bold text-success-700 bg-success-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
          {badge}
        </span>
      )}
      <div className={`p-3 rounded-xl ${bg} ring-1 ring-inset ring-black/5`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="ml-4 flex-1">
        <p className="font-semibold text-sm text-secondary-900 group-hover:text-brand-600 transition-colors">{title}</p>
        <p className="text-xs text-secondary-500 font-medium">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-secondary-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
    </motion.div>
  </Link>
);

export default CoordinatorDashboard;

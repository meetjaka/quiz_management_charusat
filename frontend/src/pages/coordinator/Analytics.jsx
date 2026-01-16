import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import CoordinatorAnalyticsCharts from '../../components/charts/CoordinatorAnalyticsCharts';
import { showToast } from '../../utils/toast';
import apiClient from '../../api';

const CoordinatorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, quizzesRes] = await Promise.all([
        apiClient.get('/coordinator/analytics'),
        apiClient.get('/coordinator/quizzes?limit=10')
      ]);
      
      setAnalytics(analyticsRes.data.data);
      setQuizzes(quizzesRes.data.data);
    } catch (error) {
      showToast.error('Failed to fetch analytics');
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="My Analytics">
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-gray-100"></div>
              <div className="absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <p className="text-sm font-medium text-gray-500 animate-pulse">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Analytics">
      <div className="space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-200">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              My Analytics
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Performance overview of your quizzes and student engagement
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchData}
            className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:rotate-180 transition-all duration-500" />
            Refresh
          </motion.button>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {analytics ? (
            <div className="space-y-6">
              <CoordinatorAnalyticsCharts analytics={analytics} quizzes={quizzes} />
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Analytics Data Available</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Create your first quiz to start seeing analytics data.
              </p>
            </div>
          )}
        </motion.div>
        
      </div>
    </Layout>
  );
};

export default CoordinatorAnalytics;

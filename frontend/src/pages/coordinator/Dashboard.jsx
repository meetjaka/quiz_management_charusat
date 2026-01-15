import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
      const [quizzesRes] = await Promise.all([
        apiClient.get("/coordinator/quizzes"),
      ]);

      setQuizzes(quizzesRes.data.data || []);

      // Calculate stats from quizzes
      const activeQuizzes = quizzesRes.data.data.filter((q) => {
        const now = new Date();
        return (
          q.isActive &&
          new Date(q.startTime) <= now &&
          new Date(q.endTime) >= now
        );
      });

      const totalAttempts = quizzesRes.data.data.reduce(
        (sum, q) => sum + (q.totalAttempts || 0),
        0
      );

      setStats({
        totalQuizzes: quizzesRes.data.data.length,
        activeQuizzes: activeQuizzes.length,
        totalAttempts,
      });

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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Coordinator Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold">
            Welcome to Coordinator Dashboard
          </h1>
          <p className="mt-2 text-purple-100">
            Manage your assigned quizzes and monitor student performance
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalQuizzes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-lg p-3">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeQuizzes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-lg p-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalAttempts}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/coordinator/quizzes"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-2xl mr-3">📋</span>
              <div>
                <p className="font-semibold text-gray-900">View All Quizzes</p>
                <p className="text-sm text-gray-600">
                  Manage your assigned quizzes
                </p>
              </div>
            </Link>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="font-semibold text-gray-900">View Results</p>
                <p className="text-sm text-gray-600">
                  Check quiz results and analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Assigned Quizzes
              </h2>
              <Link
                to="/coordinator/quizzes"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {quizzes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No quizzes assigned yet
              </p>
            ) : (
              <div className="space-y-4">
                {quizzes.slice(0, 5).map((quiz) => (
                  <div
                    key={quiz._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {quiz.department} - {quiz.semester} - {quiz.subject}
                        </p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                          <span>
                            📅 {new Date(quiz.startTime).toLocaleDateString()}
                          </span>
                          <span>⏱️ {quiz.duration} min</span>
                          <span>📊 {quiz.totalAttempts || 0} attempts</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {quiz.isActive &&
                        new Date(quiz.endTime) >= new Date() ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                        <Link
                          to={`/coordinator/quizzes`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoordinatorDashboard;

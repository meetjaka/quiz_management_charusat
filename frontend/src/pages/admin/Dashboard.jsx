import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
      const response = await apiClient.get("/admin/analytics/dashboard");
      setAnalytics(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Admin Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchDashboardAnalytics}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  const { overview, recentQuizzes, recentAttempts, departmentStats } =
    analytics || {};

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold">Welcome to Admin Dashboard</h1>
          <p className="mt-2 text-blue-100">
            Monitor and manage your quiz management system
          </p>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Students"
            value={overview?.totalStudents || 0}
            icon="👨‍🎓"
            color="bg-blue-500"
            link="/admin/users?role=student"
          />
          <StatCard
            title="Coordinators"
            value={overview?.totalCoordinators || 0}
            icon="👨‍🏫"
            color="bg-purple-500"
            link="/admin/users?role=coordinator"
          />
          <StatCard
            title="Total Quizzes"
            value={overview?.totalQuizzes || 0}
            icon="📝"
            color="bg-green-500"
            link="/admin/quizzes"
          />
          <StatCard
            title="Active Quizzes"
            value={overview?.activeQuizzes || 0}
            icon="✅"
            color="bg-teal-500"
            link="/admin/quizzes?status=active"
          />
          <StatCard
            title="Total Attempts"
            value={overview?.totalAttempts || 0}
            icon="🎯"
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              title="Create Quiz"
              icon="➕"
              link="/admin/quizzes"
              color="bg-blue-600"
            />
            <QuickActionButton
              title="Add User"
              icon="👤"
              link="/admin/users"
              color="bg-green-600"
            />
            <QuickActionButton
              title="View Analytics"
              icon="📊"
              link="/admin/analytics"
              color="bg-purple-600"
            />
            <QuickActionButton
              title="Manage Quizzes"
              icon="📋"
              link="/admin/quizzes"
              color="bg-orange-600"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Quizzes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Quizzes
                </h2>
                <Link
                  to="/admin/quizzes"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentQuizzes && recentQuizzes.length > 0 ? (
                recentQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Created by {quiz.createdBy?.name || "Unknown"}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500">
                            {quiz.questions?.length || 0} questions
                          </span>
                          <span className="text-xs text-gray-500">
                            Duration: {quiz.duration} mins
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              quiz.isActive && quiz.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {quiz.isActive && quiz.isPublished
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No quizzes created yet
                </div>
              )}
            </div>
          </div>

          {/* Department Statistics */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Department Statistics
              </h2>
            </div>
            <div className="p-6">
              {departmentStats && departmentStats.length > 0 ? (
                <div className="space-y-4">
                  {departmentStats.map((dept, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {dept._id || "Not Specified"}
                          </span>
                          <span className="text-sm text-gray-600">
                            {dept.count} students
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                (dept.count / (overview?.totalStudents || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No department data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Quiz Attempts
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAttempts && recentAttempts.length > 0 ? (
                  recentAttempts.map((attempt) => (
                    <tr key={attempt._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {attempt.studentId?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attempt.studentId?.enrollmentNumber || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {attempt.quizId?.title || "Unknown Quiz"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {attempt.totalScore !== undefined
                            ? `${attempt.totalScore}%`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            attempt.status === "submitted"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {attempt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(attempt.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No recent attempts
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, color, link }) => {
  const CardContent = (
    <div
      className={`${color} rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  return link ? <Link to={link}>{CardContent}</Link> : CardContent;
};

// QuickActionButton Component
const QuickActionButton = ({ title, icon, link, color }) => {
  return (
    <Link
      to={link}
      className={`${color} hover:opacity-90 text-white rounded-lg p-4 flex items-center space-x-3 transition-opacity shadow-md`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium">{title}</span>
    </Link>
  );
};

export default AdminDashboard;

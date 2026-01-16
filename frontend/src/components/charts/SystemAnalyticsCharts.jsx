import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const SystemAnalyticsCharts = ({ analytics }) => {
  if (!analytics) return null;

  // User distribution data
  const userDistribution = [
    { name: 'Admins', value: analytics.users?.admins || 0, color: '#EF4444' },
    { name: 'Coordinators', value: analytics.users?.coordinators || 0, color: '#3B82F6' },
    { name: 'Students', value: analytics.users?.students || 0, color: '#10B981' },
  ];

  // Quiz status data
  const quizStatus = [
    { name: 'Draft', count: analytics.quizzes?.draft || 0 },
    { name: 'Published', count: analytics.quizzes?.published || 0 },
    { name: 'Closed', count: analytics.quizzes?.closed || 0 },
  ];

  // Attempt statistics
  const attemptStats = [
    { name: 'Submitted', value: analytics.attempts?.submitted || 0, color: '#10B981' },
    { name: 'In Progress', value: analytics.attempts?.inProgress || 0, color: '#F59E0B' },
    { name: 'Evaluated', value: analytics.attempts?.evaluated || 0, color: '#3B82F6' },
  ];

  return (
    <div className="space-y-8">
      {/* User Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">User Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={userDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {userDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center space-x-6 mt-4">
          {userDistribution.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-700">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Status Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={quizStatus}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attempt Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Attempt Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={attemptStats}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {attemptStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
          <div className="text-sm font-medium text-blue-600 mb-1">Total Users</div>
          <div className="text-3xl font-bold text-gray-900">{analytics.users?.total || 0}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-600">
          <div className="text-sm font-medium text-green-600 mb-1">Total Quizzes</div>
          <div className="text-3xl font-bold text-gray-900">{analytics.quizzes?.total || 0}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-600">
          <div className="text-sm font-medium text-purple-600 mb-1">Total Attempts</div>
          <div className="text-3xl font-bold text-gray-900">{analytics.attempts?.total || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalyticsCharts;

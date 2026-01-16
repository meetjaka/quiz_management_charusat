import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CoordinatorAnalyticsCharts = ({ analytics, quizzes }) => {
  if (!analytics) return null;

  // Pass/Fail distribution
  const passFailData = [
    { name: 'Passed', value: analytics.attempts?.passed || 0, color: '#10B981' },
    { name: 'Failed', value: analytics.attempts?.failed || 0, color: '#EF4444' },
  ];

  // Quiz performance data
  const quizPerformance = quizzes?.slice(0, 5).map((quiz, index) => ({
    name: quiz.title.substring(0, 20) + (quiz.title.length > 20 ? '...' : ''),
    attempts: quiz.totalAttempts || 0,
    avgScore: Math.round(quiz.averageScore || 0),
  })) || [];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Quizzes</div>
          <div className="text-3xl font-bold text-gray-900">{analytics.quizzes?.total || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
          <div className="text-sm font-medium text-gray-600 mb-1">Published</div>
          <div className="text-3xl font-bold text-gray-900">{analytics.quizzes?.published || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Attempts</div>
          <div className="text-3xl font-bold text-gray-900">{analytics.attempts?.total || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-600">
          <div className="text-sm font-medium text-gray-600 mb-1">Avg Score</div>
          <div className="text-3xl font-bold text-gray-900">{Math.round(analytics.scores?.avgPercentage || 0)}%</div>
        </div>
      </div>

      {/* Pass/Fail Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Pass/Fail Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={passFailData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {passFailData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-600 mb-1">Passed</div>
              <div className="text-2xl font-bold text-gray-900">{passFailData[0].value}</div>
              <div className="text-sm text-gray-600 mt-1">
                Pass Rate: {analytics.attempts?.total > 0 
                  ? ((passFailData[0].value / analytics.attempts.total) * 100).toFixed(1) 
                  : 0}%
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm font-medium text-red-600 mb-1">Failed</div>
              <div className="text-2xl font-bold text-gray-900">{passFailData[1].value}</div>
              <div className="text-sm text-gray-600 mt-1">
                Fail Rate: {analytics.attempts?.total > 0 
                  ? ((passFailData[1].value / analytics.attempts.total) * 100).toFixed(1) 
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Performance Comparison */}
      {quizPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quizPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="attempts" fill="#3B82F6" name="Total Attempts" />
              <Bar yAxisId="right" dataKey="avgScore" fill="#10B981" name="Avg Score %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CoordinatorAnalyticsCharts;

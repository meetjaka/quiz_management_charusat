import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentAnalyticsCharts = ({ analytics, recentResults }) => {
  if (!analytics) return null;

  // Performance trend data (from recent results)
  const performanceTrend = recentResults?.slice(0, 10).reverse().map((result, index) => ({
    quiz: `Quiz ${index + 1}`,
    score: Math.round(result.percentage || 0),
    passed: result.percentage >= result.passingPercentage,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Attempts</div>
          <div className="text-3xl font-bold text-gray-900">{analytics.attempts?.total || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
          <div className="text-sm font-medium text-gray-600 mb-1">Passed</div>
          <div className="text-3xl font-bold text-green-900">{analytics.attempts?.passed || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-600">
          <div className="text-sm font-medium text-gray-600 mb-1">Failed</div>
          <div className="text-3xl font-bold text-red-900">{analytics.attempts?.failed || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
          <div className="text-sm font-medium text-gray-600 mb-1">Avg Score</div>
          <div className="text-3xl font-bold text-gray-900">{Math.round(analytics.scores?.avgPercentage || 0)}%</div>
        </div>
      </div>

      {/* Performance Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600 mb-1">Pass Rate</div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(analytics.attempts?.passRate || 0)}%</div>
            <div className="text-sm text-gray-600 mt-2">
              {analytics.attempts?.passed || 0} out of {analytics.attempts?.total || 0} quizzes
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600 mb-1">Highest Score</div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(analytics.scores?.highest || 0)}%</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm font-medium text-yellow-600 mb-1">Lowest Score</div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(analytics.scores?.lowest || 0)}%</div>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      {performanceTrend.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quiz" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 5 }}
                name="Score %"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Your performance over the last {performanceTrend.length} quizzes
          </div>
        </div>
      )}

      {/* Score Distribution */}
      {performanceTrend.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quiz" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="score" 
                fill="#3B82F6"
                name="Score %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StudentAnalyticsCharts;

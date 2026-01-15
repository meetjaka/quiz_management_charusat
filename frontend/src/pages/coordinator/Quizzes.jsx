import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import apiClient from "../../api";

const CoordinatorQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/coordinator/quizzes");
      setQuizzes(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch quizzes");
      console.error("Error fetching quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (quizId) => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/coordinator/quizzes/${quizId}/results`
      );
      setResults(response.data.data || []);
      setShowResults(true);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch results");
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const start = new Date(quiz.startTime);
    const end = new Date(quiz.endTime);

    if (now < start)
      return { label: "Upcoming", color: "bg-yellow-100 text-yellow-800" };
    if (now > end)
      return { label: "Ended", color: "bg-gray-100 text-gray-800" };
    if (quiz.isActive)
      return { label: "Active", color: "bg-green-100 text-green-800" };
    return { label: "Inactive", color: "bg-red-100 text-red-800" };
  };

  if (loading && quizzes.length === 0) {
    return (
      <Layout title="My Quizzes">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Quizzes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assigned Quizzes
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor your assigned quizzes
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results Modal */}
        {showResults && selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    Results: {selectedQuiz.title}
                  </h2>
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setSelectedQuiz(null);
                      setResults([]);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                {results.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No results available yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Rank
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Score
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Percentage
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.map((result, index) => (
                          <tr key={result._id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              #{index + 1}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {result.studentId?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {result.studentId?.enrollmentNumber}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {result.totalScore}/{result.maxScore}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {result.percentage.toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  result.isPassed
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {result.isPassed ? "Passed" : "Failed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quizzes List */}
        <div className="bg-white rounded-lg shadow">
          {quizzes.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl">📝</span>
              <p className="mt-4 text-gray-600">No quizzes assigned yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizzes.map((quiz) => {
                    const status = getQuizStatus(quiz);
                    return (
                      <tr key={quiz._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {quiz.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quiz.department} - {quiz.semester} - {quiz.subject}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(quiz.startTime).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            to {new Date(quiz.endTime).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quiz.totalQuestions} questions
                          </div>
                          <div className="text-sm text-gray-500">
                            {quiz.totalAttempts || 0} attempts
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              fetchResults(quiz._id);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View Results
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CoordinatorQuizzes;

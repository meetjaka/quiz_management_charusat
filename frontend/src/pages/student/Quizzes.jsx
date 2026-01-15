import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api from "../../api";
import { useNavigate } from "react-router-dom";

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startingQuiz, setStartingQuiz] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableQuizzes();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchAvailableQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/student/quizzes/available");
      setQuizzes(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    if (startingQuiz) return; // Prevent rapid clicking
    setStartingQuiz(true);
    navigate(`/student/quiz/${quizId}/attempt`);
  };

  return (
    <Layout title="Available Quizzes">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Available Quizzes
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No quizzes available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <h2 className="text-lg font-bold mb-2">{quiz.title}</h2>
                  <p className="text-sm opacity-90">{quiz.subject}</p>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Department:</span>
                      <span className="font-semibold text-gray-900">
                        {quiz.department}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Semester:</span>
                      <span className="font-semibold text-gray-900">
                        {quiz.semester}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Duration:</span>
                      <span className="font-semibold text-gray-900">
                        {quiz.duration} mins
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">
                        Total Marks:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {quiz.totalMarks}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">
                        Passing Marks:
                      </span>
                      <span className="font-semibold text-green-600">
                        {quiz.passingMarks}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600 mb-4">
                      <p className="mb-2">
                        <strong>Starts:</strong>{" "}
                        {new Date(quiz.startTime).toLocaleString()}
                      </p>
                      <p>
                        <strong>Ends:</strong>{" "}
                        {new Date(quiz.endTime).toLocaleString()}
                      </p>
                    </div>

                    {quiz.hasAttempted ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Status:</strong> Already Attempted
                        </p>
                      </div>
                    ) : null}

                    <button
                      onClick={() => handleStartQuiz(quiz._id)}
                      disabled={quiz.hasAttempted || startingQuiz}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                        quiz.hasAttempted || startingQuiz
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {startingQuiz
                        ? "Starting..."
                        : quiz.hasAttempted
                        ? "Already Attempted"
                        : "Start Quiz"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentQuizzes;

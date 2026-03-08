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
      const response = await api.get("/student/quizzes");
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
        <h1 className="text-3xl font-bold text-secondary-900 mb-8">
          Available Quizzes
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-danger-100 border border-danger-400 text-danger-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-secondary-500">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary-500 text-lg">
              No quizzes available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-xl shadow-card border border-secondary-200 hover:shadow-card-hover hover:border-brand-200 transition-all overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white text-center">
                  <h2 className="text-xl font-bold mb-1 tracking-tight">{quiz.title}</h2>
                  <p className="text-sm text-brand-100 font-medium">{quiz.subject}</p>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
                      <span className="text-secondary-500 text-sm font-medium">Department</span>
                      <span className="font-semibold text-secondary-900">
                        {quiz.department}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
                      <span className="text-secondary-500 text-sm font-medium">Semester</span>
                      <span className="font-semibold text-secondary-900">
                        {quiz.semester}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
                      <span className="text-secondary-500 text-sm font-medium">Duration</span>
                      <span className="font-semibold text-secondary-900">
                        {quiz.duration} mins
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
                      <span className="text-secondary-500 text-sm font-medium">
                        Total Marks
                      </span>
                      <span className="font-semibold text-secondary-900">
                        {quiz.totalMarks}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
                      <span className="text-secondary-500 text-sm font-medium">
                        Passing Marks
                      </span>
                      <span className="font-semibold text-success-600">
                        {quiz.passingMarks}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-auto">
                    <div className="text-sm font-medium text-secondary-600 mb-6 bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                      <div className="flex justify-between mb-2">
                        <span className="text-secondary-500">Starts:</span>
                        <span className="text-secondary-900">{new Date(quiz.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Ends:</span>
                        <span className="text-secondary-900">{new Date(quiz.endTime).toLocaleString()}</span>
                      </div>
                    </div>

                    {quiz.hasAttempted ? (
                      <div className="bg-warning-50 flex items-center justify-center gap-2 border border-warning-200 rounded-xl p-3 mb-4">
                        <svg className="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <p className="text-sm font-semibold text-warning-800">
                          Already Attempted
                        </p>
                      </div>
                    ) : null}

                    <button
                      onClick={() => handleStartQuiz(quiz._id)}
                      disabled={quiz.hasAttempted || startingQuiz}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition ${quiz.hasAttempted || startingQuiz
                          ? "bg-secondary-300 text-secondary-600 cursor-not-allowed"
                          : "bg-brand-600 hover:bg-brand-700 text-white"
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

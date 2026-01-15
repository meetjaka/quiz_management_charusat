import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import apiClient from "../../api";

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Start quiz attempt
  useEffect(() => {
    startAttempt();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Track tab switches
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && attemptId) {
        reportTabSwitch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attemptId]);

  const startAttempt = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(`/student/quizzes/${quizId}/start`);
      const { attemptId, quiz, questions, timeLimit } = response.data.data;

      setAttemptId(attemptId);
      setQuiz(quiz);
      setQuestions(questions);
      setTimeRemaining(timeLimit);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to start quiz";

      // Check if it's a duplicate attempt error
      if (
        errorMessage.includes("already attempted") ||
        errorMessage.includes("duplicate key") ||
        err.response?.status === 400
      ) {
        setError(
          "You have already attempted this quiz. Please check your results page or contact your instructor if this is an error."
        );
      } else {
        setError(errorMessage);
      }

      console.error("Error starting quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const reportTabSwitch = async () => {
    try {
      await apiClient.post(`/student/attempts/${attemptId}/tab-switch`);
    } catch (err) {
      console.error("Error reporting tab switch:", err);
    }
  };

  const handleAnswerChange = async (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    // Save answer to backend
    try {
      await apiClient.put(`/student/attempts/${attemptId}/answer`, {
        questionId,
        answer,
      });
    } catch (err) {
      console.error("Error saving answer:", err);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;

    if (!autoSubmit) {
      const confirmed = window.confirm(
        "Are you sure you want to submit? You cannot change answers after submission."
      );
      if (!confirmed) return;
    }

    try {
      setSubmitting(true);
      await apiClient.post(`/student/attempts/${attemptId}/submit`);
      navigate("/student/results", {
        state: { message: "Quiz submitted successfully!" },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter((k) => answers[k] !== null).length;
  };

  if (loading) {
    return (
      <Layout title="Quiz Attempt">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Quiz Attempt">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate("/student/quizzes")}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz?.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p
                  className={`text-2xl font-bold ${
                    timeRemaining < 300 ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Answered</p>
                <p className="text-2xl font-bold text-green-600">
                  {getAnsweredCount()}/{questions.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Question Text */}
              <div className="mb-6">
                <div className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    {currentQuestion + 1}
                  </span>
                  <p className="text-lg text-gray-900 flex-1">
                    {currentQ?.questionText}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {["A", "B", "C", "D"].map((option) => (
                  <label
                    key={option}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      answers[currentQ?._id] === option
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ?._id}`}
                      value={option}
                      checked={answers[currentQ?._id] === option}
                      onChange={(e) =>
                        handleAnswerChange(currentQ?._id, e.target.value)
                      }
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-700 mr-2">
                        {option}.
                      </span>
                      <span className="text-gray-900">
                        {currentQ?.options[option]}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() =>
                    setCurrentQuestion((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setCurrentQuestion((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">
                Question Navigator
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-full aspect-square rounded-lg font-semibold text-sm transition-all ${
                      index === currentQuestion
                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                        : answers[q._id]
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                  <span className="text-gray-600">Current</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;

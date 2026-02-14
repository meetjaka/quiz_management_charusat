import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  BookOpen,
} from "lucide-react";
import { showToast } from "../../utils/toast";
import apiClient from "../../api";

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [initialIsActive, setInitialIsActive] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [addingQuestion, setAddingQuestion] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const [quizRes, questionsRes] = await Promise.all([
        apiClient.get(`/coordinator/quizzes/${id}`),
        apiClient.get(`/coordinator/quizzes/${id}/questions`),
      ]);

      // Backend returns nested structure: { quiz: {...}, questions: [...], stats: {...} }
      const quizData = quizRes.data.data.quiz || quizRes.data.data;
      setQuiz(quizData);
      setInitialIsActive(quizData?.isActive ?? null);
      setQuestions(questionsRes.data.data || []);
    } catch (err) {
      showToast.error("Failed to fetch quiz data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuiz = async () => {
    try {
      setSaving(true);
      const updatePayload = {
        title: quiz?.title,
        description: quiz?.description,
        totalMarks: quiz?.totalMarks,
        passingMarks: quiz?.passingMarks,
        durationMinutes: quiz?.durationMinutes,
        startTime: quiz?.startTime,
        endTime: quiz?.endTime,
        shuffleQuestions: quiz?.shuffleQuestions,
        shuffleOptions: quiz?.shuffleOptions,
        maxAttempts: quiz?.maxAttempts,
      };
      if (initialIsActive !== null && quiz?.isActive !== initialIsActive) {
        updatePayload.isActive = quiz?.isActive;
      }
      await apiClient.put(`/coordinator/quizzes/${id}`, updatePayload);
      showToast.success("Quiz updated successfully!");

      // Refetch to ensure we have latest data from backend
      await fetchQuizData();
    } catch (err) {
      showToast.error("Failed to update quiz");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      await apiClient.delete(
        `/coordinator/quizzes/${id}/questions/${questionId}`,
      );
      setQuestions(questions.filter((q) => q._id !== questionId));
      showToast.success("Question deleted successfully!");
    } catch (err) {
      showToast.error("Failed to delete question");
      console.error(err);
    }
  };

  const handleUpdateQuestion = async (questionId, updatedData) => {
    try {
      await apiClient.put(
        `/coordinator/quizzes/${id}/questions/${questionId}`,
        updatedData,
      );
      setQuestions(
        questions.map((q) =>
          q._id === questionId ? { ...q, ...updatedData } : q,
        ),
      );
      setEditingQuestion(null);
      showToast.success("Question updated successfully!");
    } catch (err) {
      showToast.error("Failed to update question");
      console.error(err);
    }
  };

  const handleAddQuestion = async (questionData) => {
    try {
      const response = await apiClient.post(
        `/coordinator/quizzes/${id}/questions`,
        {
          ...questionData,
          orderNumber: questions.length + 1,
        },
      );
      setQuestions([...questions, response.data.data]);
      setAddingQuestion(false);
      showToast.success("Question added successfully!");
    } catch (err) {
      showToast.error("Failed to add question");
      console.error(err);
    }
  };

  const toggleQuizStatus = async () => {
    try {
      const newIsActive = !quiz.isActive;
      const response = await apiClient.put(`/coordinator/quizzes/${id}`, {
        isActive: newIsActive,
      });

      // Backend now returns isActive properly, use it from response
      const updatedQuizFromBackend = response.data.data;
      setQuiz(updatedQuizFromBackend);
      setInitialIsActive(updatedQuizFromBackend?.isActive ?? null);
      showToast.success(`Quiz ${newIsActive ? "activated" : "deactivated"}!`);
    } catch (err) {
      showToast.error("Failed to update quiz status");
      console.error("Toggle error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Quiz not found</p>
          <button
            onClick={() => navigate("/coordinator/quizzes")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go back to quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/coordinator/quizzes")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
            <div className="flex gap-3">
              <button
                onClick={toggleQuizStatus}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  quiz.isActive
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {quiz.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={handleUpdateQuiz}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Details Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={quiz?.title || ""}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={quiz?.description || ""}
                onChange={(e) =>
                  setQuiz({ ...quiz, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Time
              </label>
              <input
                type="datetime-local"
                value={
                  quiz?.startTime
                    ? new Date(
                        new Date(quiz.startTime).getTime() -
                          new Date(quiz.startTime).getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setQuiz({
                    ...quiz,
                    startTime: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Time
              </label>
              <input
                type="datetime-local"
                value={
                  quiz?.endTime
                    ? new Date(
                        new Date(quiz.endTime).getTime() -
                          new Date(quiz.endTime).getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setQuiz({
                    ...quiz,
                    endTime: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                value={quiz?.durationMinutes || ""}
                onChange={(e) =>
                  setQuiz({
                    ...quiz,
                    durationMinutes: e.target.value
                      ? parseInt(e.target.value)
                      : 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                placeholder="Enter duration"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Marks
              </label>
              <input
                type="number"
                value={quiz?.totalMarks || ""}
                onChange={(e) =>
                  setQuiz({
                    ...quiz,
                    totalMarks: e.target.value ? parseInt(e.target.value) : 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                placeholder="Enter total marks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                value={quiz?.passingMarks || ""}
                onChange={(e) =>
                  setQuiz({
                    ...quiz,
                    passingMarks: e.target.value ? parseInt(e.target.value) : 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                placeholder="Enter passing marks"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={quiz?.isActive || false}
                onChange={(e) =>
                  setQuiz({ ...quiz, isActive: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 rounded mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Questions ({questions.length})
            </h2>
            <button
              onClick={() => setAddingQuestion(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {addingQuestion && (
            <div className="border-2 border-green-500 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Add New Question
              </h3>
              <QuestionEditForm
                question={{
                  questionText: "",
                  questionType: "mcq",
                  marks: 1,
                  options: [
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                  ],
                  correctAnswer: "",
                }}
                onSave={handleAddQuestion}
                onCancel={() => setAddingQuestion(false)}
                isNew={true}
              />
            </div>
          )}

          {questions.length === 0 && !addingQuestion ? (
            <p className="text-center text-gray-500 py-8">
              No questions added yet
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {editingQuestion === question._id ? (
                    <QuestionEditForm
                      question={question}
                      onSave={(data) =>
                        handleUpdateQuestion(question._id, data)
                      }
                      onCancel={() => setEditingQuestion(null)}
                    />
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-2">
                            Q{index + 1}. {question.questionText}
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {question.questionType}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              {question.marks} marks
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingQuestion(question._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {question.options && question.options.length > 0 && (
                        <div className="mt-2 space-y-1 text-sm">
                          {question.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`pl-4 py-1 rounded ${
                                opt.isCorrect
                                  ? "text-green-700 bg-green-50 font-medium"
                                  : "text-gray-700"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}. {opt.text}
                              {opt.isCorrect && " ✓"}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.questionType === "short_answer" && (
                        <div className="mt-2 text-sm bg-green-50 text-green-700 p-2 rounded">
                          <strong>Correct Answer:</strong>{" "}
                          {question.correctAnswer}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const QuestionEditForm = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    questionText: question.questionText,
    questionType: question.questionType,
    marks: question.marks,
    options: question.options || [],
    correctAnswer: question.correctAnswer || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that at least one option is marked as correct for MCQ types
    if (formData.questionType !== "short_answer") {
      const hasCorrectAnswer = formData.options.some((opt) => opt.isCorrect);
      if (!hasCorrectAnswer) {
        showToast.error("Please mark at least one option as correct");
        return;
      }

      // Validate that all options have text
      const hasEmptyOption = formData.options.some((opt) => !opt.text.trim());
      if (hasEmptyOption) {
        showToast.error("All options must have text");
        return;
      }
    }

    // Validate short answer has correct answer
    if (
      formData.questionType === "short_answer" &&
      !formData.correctAnswer.trim()
    ) {
      showToast.error("Please provide a correct answer");
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <textarea
          value={formData.questionText}
          onChange={(e) =>
            setFormData({ ...formData, questionText: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows="3"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={formData.questionType}
            onChange={(e) =>
              setFormData({ ...formData, questionType: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="mcq">Multiple Choice (Single Answer)</option>
            <option value="mcq_multiple">Multiple Choice (Multi-Select)</option>
            <option value="true_false">True/False</option>
            <option value="short_answer">Short Answer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marks
          </label>
          <input
            type="number"
            value={formData.marks}
            onChange={(e) =>
              setFormData({ ...formData, marks: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>
      </div>

      {formData.questionType !== "short_answer" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Options
            </label>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  options: [
                    ...formData.options,
                    { text: "", isCorrect: false },
                  ],
                })
              }
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </div>
          {formData.options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={opt.text}
                onChange={(e) => {
                  const newOptions = [...formData.options];
                  newOptions[idx].text = e.target.value;
                  setFormData({ ...formData, options: newOptions });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={`Option ${idx + 1}`}
              />
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={opt.isCorrect}
                  onChange={(e) => {
                    // For single select (mcq), only one can be correct
                    // For multi-select (mcq_multiple), multiple can be correct
                    const newOptions =
                      formData.questionType === "mcq"
                        ? formData.options.map((o, i) => ({
                            ...o,
                            isCorrect: i === idx ? e.target.checked : false,
                          }))
                        : formData.options.map((o, i) => ({
                            ...o,
                            isCorrect:
                              i === idx ? e.target.checked : o.isCorrect,
                          }));
                    setFormData({ ...formData, options: newOptions });
                  }}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-600">Correct</span>
              </label>
              {formData.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = formData.options.filter(
                      (_, i) => i !== idx,
                    );
                    setFormData({ ...formData, options: newOptions });
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {formData.questionType === "short_answer" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correct Answer
          </label>
          <input
            type="text"
            value={formData.correctAnswer}
            onChange={(e) =>
              setFormData({ ...formData, correctAnswer: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditQuiz;

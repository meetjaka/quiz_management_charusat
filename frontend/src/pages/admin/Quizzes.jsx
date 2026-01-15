import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api from "../../api";

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    semester: "",
    subject: "",
    batch: "",
    startTime: "",
    endTime: "",
    duration: "",
    passingMarks: "",
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/quizzes");
      setQuizzes(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.title ||
      !formData.department ||
      !formData.semester ||
      !formData.subject ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.duration
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setCreationStep(2);
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "",
        marks: 1,
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    if (field.startsWith("option-")) {
      const option = field.split("-")[1];
      updated[index].options[option] = value;
    } else {
      updated[index][field] = value;
    }
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (creationMethod === "excel") {
      if (!excelFile) {
        setError("Please upload an Excel file");
        return;
      }

      try {
        setLoading(true);
        const formDataToSend = new FormData();
        formDataToSend.append("file", excelFile);
        formDataToSend.append("title", formData.title);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("department", formData.department);
        formDataToSend.append("semester", formData.semester);
        formDataToSend.append("subject", formData.subject);
        formDataToSend.append("batch", formData.batch);
        formDataToSend.append("startTime", formData.startTime);
        formDataToSend.append("endTime", formData.endTime);
        formDataToSend.append("duration", formData.duration);
        formDataToSend.append("passingMarks", formData.passingMarks || "");

        await api.post("/admin/quizzes/upload-excel", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setSuccess("Quiz created with Excel questions successfully!");
        resetForm();
        fetchQuizzes();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to create quiz");
      } finally {
        setLoading(false);
      }
    } else {
      if (questions.length === 0) {
        setError("Please add at least one question");
        return;
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (
          !q.questionText ||
          !q.correctAnswer ||
          !q.options.A ||
          !q.options.B ||
          !q.options.C ||
          !q.options.D
        ) {
          setError(`Please fill in all fields for question ${i + 1}`);
          return;
        }
      }

      const totalMarks = questions.reduce(
        (sum, q) => sum + parseInt(q.marks),
        0
      );
      const passingMarks =
        formData.passingMarks || Math.floor(totalMarks * 0.4);

      try {
        setLoading(true);
        const response = await api.post("/admin/quizzes", {
          ...formData,
          duration: parseInt(formData.duration),
          totalMarks,
          passingMarks: parseInt(passingMarks),
        });

        const quizId = response.data.data._id;

        for (const question of questions) {
          await api.post("/admin/quizzes/add-question", {
            quizId,
            ...question,
            marks: parseInt(question.marks),
          });
        }

        setSuccess("Quiz created successfully!");
        resetForm();
        fetchQuizzes();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to create quiz");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      department: "",
      semester: "",
      subject: "",
      batch: "",
      startTime: "",
      endTime: "",
      duration: "",
      passingMarks: "",
    });
    setQuestions([]);
    setExcelFile(null);
    setCreationStep(1);
    setCreationMethod("manual");
    setShowCreateForm(false);
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await api.delete(`/admin/quizzes/${id}`);
      setSuccess("Quiz deleted successfully!");
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete quiz");
    }
  };

  const toggleQuizPublish = async (id, isPublished) => {
    try {
      await api.patch(`/admin/quizzes/${id}/toggle-publish`);
      setSuccess(
        `Quiz ${!isPublished ? "published" : "unpublished"} successfully!`
      );
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quiz");
    }
  };

  const toggleQuizActive = async (id, isActive) => {
    try {
      await api.patch(`/admin/quizzes/${id}/toggle-active`);
      setSuccess(
        `Quiz ${!isActive ? "activated" : "deactivated"} successfully!`
      );
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quiz");
    }
  };

  const handleViewQuestions = async (quiz) => {
    try {
      setLoadingQuestions(true);
      setSelectedQuiz(quiz);
      const response = await api.get(`/admin/quizzes/${quiz._id}`);
      setQuizQuestions(response.data.data.questions || []);
      setShowQuestionsModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch questions");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const closeQuestionsModal = () => {
    setShowQuestionsModal(false);
    setSelectedQuiz(null);
    setQuizQuestions([]);
  };

  return (
    <Layout title="Quiz Management">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {showCreateForm ? "Cancel" : "+ Create Quiz"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {creationStep === 1
                    ? "Step 1: Quiz Information"
                    : "Step 2: Add Questions"}
                </h2>
              </div>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {creationStep === 1 ? (
              <form
                onSubmit={handleNextStep}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester *
                  </label>
                  <input
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Database Systems"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch (Optional)
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 60"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Marks (Optional)
                  </label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-calculated if empty"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quiz description"
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Next: Add Questions →
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose how to add questions:
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCreationMethod("manual")}
                      className={`flex-1 p-4 border-2 rounded-lg ${
                        creationMethod === "manual"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">✍️</div>
                      <div className="font-semibold">Manual Entry</div>
                      <div className="text-xs text-gray-600">
                        Add questions one by one
                      </div>
                    </button>
                    <button
                      onClick={() => setCreationMethod("excel")}
                      className={`flex-1 p-4 border-2 rounded-lg ${
                        creationMethod === "excel"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">📊</div>
                      <div className="font-semibold">Excel Upload</div>
                      <div className="text-xs text-gray-600">
                        Upload questions from file
                      </div>
                    </button>
                  </div>
                </div>

                {creationMethod === "excel" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Excel File *
                      </label>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Excel should have columns: Question, Option A, Option B,
                        Option C, Option D, Correct Answer, Marks
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCreationStep(1)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !excelFile}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        {loading ? "Creating..." : "Create Quiz with Excel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q, index) => (
                      <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">
                            Question {index + 1}
                          </h4>
                          <button
                            onClick={() => removeQuestion(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Question text"
                            value={q.questionText}
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                "questionText",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Option A"
                              value={q.options.A}
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "option-A",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Option B"
                              value={q.options.B}
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "option-B",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Option C"
                              value={q.options.C}
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "option-C",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Option D"
                              value={q.options.D}
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "option-D",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={q.correctAnswer}
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "correctAnswer",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="">Correct Answer</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Marks"
                              value={q.marks}
                              onChange={(e) =>
                                updateQuestion(index, "marks", e.target.value)
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addQuestion}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600"
                    >
                      + Add Question
                    </button>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setCreationStep(1)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading || questions.length === 0}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        {loading
                          ? "Creating..."
                          : `Create Quiz (${questions.length} questions)`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-2xl font-bold text-gray-900 p-6 border-b">
            All Quizzes
          </h2>

          {loading && !showCreateForm ? (
            <div className="p-8 text-center text-gray-500">
              Loading quizzes...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No quizzes found. Create one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz, index) => (
                    <tr
                      key={quiz._id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quiz.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {quiz.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {quiz.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {quiz.passingMarks}/{quiz.totalMarks}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              quiz.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {quiz.isActive ? "Active" : "Inactive"}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              quiz.isPublished
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {quiz.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewQuestions(quiz)}
                            className="px-2 py-1 rounded text-xs font-semibold bg-purple-500 hover:bg-purple-600 text-white"
                          >
                            View Questions
                          </button>
                          <button
                            onClick={() =>
                              toggleQuizActive(quiz._id, quiz.isActive)
                            }
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              quiz.isActive
                                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                          >
                            {quiz.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() =>
                              toggleQuizPublish(quiz._id, quiz.isPublished)
                            }
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              quiz.isPublished
                                ? "bg-gray-500 hover:bg-gray-600 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                          >
                            {quiz.isPublished ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz._id)}
                            className="px-2 py-1 rounded text-xs font-semibold bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Questions Modal */}
        {showQuestionsModal && selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedQuiz.title} - Questions
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Questions: {quizQuestions.length}
                  </p>
                </div>
                <button
                  onClick={closeQuestionsModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {loadingQuestions ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading questions...
                  </div>
                ) : quizQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No questions found for this quiz.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {quizQuestions.map((question, index) => (
                      <div
                        key={question._id || index}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Question {index + 1}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {question.marks} marks
                          </span>
                        </div>

                        <p className="text-gray-800 mb-4 font-medium">
                          {question.questionText}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {question.options &&
                            Object.entries(question.options).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className={`p-3 rounded-lg border-2 ${
                                    question.correctAnswer === key
                                      ? "border-green-500 bg-green-50"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="font-semibold text-gray-700">
                                      {key}.
                                    </span>
                                    <span className="text-gray-800">
                                      {value}
                                    </span>
                                    {question.correctAnswer === key && (
                                      <span className="ml-auto text-green-600 font-bold">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="text-sm text-gray-700">
                            <strong>Correct Answer:</strong>{" "}
                            {question.correctAnswer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-100 border-t p-4 flex justify-end">
                <button
                  onClick={closeQuestionsModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminQuizzes;

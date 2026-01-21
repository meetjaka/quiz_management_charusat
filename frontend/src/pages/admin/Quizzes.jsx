import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Power,
  Send,
  FileText,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Search,
  Filter,
  ChevronRight,
  Save,
  ArrowLeft,
} from "lucide-react";
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
        0,
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
        `Quiz ${!isPublished ? "published" : "unpublished"} successfully!`,
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
        `Quiz ${!isActive ? "activated" : "deactivated"} successfully!`,
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
      <div className="min-h-screen bg-gray-50/50 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Quiz Management
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Create, manage and monitor student assessments
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                showCreateForm
                  ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
              }`}
            >
              {showCreateForm ? (
                <>
                  <X className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Create New Quiz
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Notifications */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3 text-green-700"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Creation Form */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8"
              >
                {/* Stepper Header */}
                <div className="border-b border-gray-100 p-6 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${creationStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                      >
                        1
                      </div>
                      <div
                        className={`h-1 w-12 rounded ${creationStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
                      />
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${creationStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                      >
                        2
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {creationStep === 1 ? "Quiz Details" : "Questions"}
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  {creationStep === 1 ? (
                    <form onSubmit={handleNextStep} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Quiz Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                            placeholder="e.g. Mid-Semester Java Exam"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                            placeholder="e.g. Computer Science"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Semester <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="semester"
                            value={formData.semester}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                            placeholder="e.g. 5"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Subject <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                            placeholder="e.g. Database Systems"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Batch
                          </label>
                          <input
                            type="text"
                            name="batch"
                            value={formData.batch}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                            placeholder="e.g. 2024"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Duration (mins){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                            placeholder="60"
                            min="1"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Start Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            End Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Passing Marks
                          </label>
                          <input
                            type="number"
                            name="passingMarks"
                            value={formData.passingMarks}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                            placeholder="Auto-calculated if empty"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                          placeholder="Instructions for students..."
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                        >
                          Next Step <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-8">
                      {/* Method Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => setCreationMethod("manual")}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                            creationMethod === "manual"
                              ? "border-blue-600 bg-blue-50/50"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-full ${creationMethod === "manual" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
                          >
                            <Edit3 className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <h3
                              className={`font-semibold ${creationMethod === "manual" ? "text-blue-900" : "text-gray-900"}`}
                            >
                              Manual Entry
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Add questions one by one
                            </p>
                          </div>
                        </button>

                        <button
                          onClick={() => setCreationMethod("excel")}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                            creationMethod === "excel"
                              ? "border-blue-600 bg-blue-50/50"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-full ${creationMethod === "excel" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
                          >
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <h3
                              className={`font-semibold ${creationMethod === "excel" ? "text-blue-900" : "text-gray-900"}`}
                            >
                              Excel Upload
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Bulk import from .xlsx file
                            </p>
                          </div>
                        </button>
                      </div>

                      {creationMethod === "excel" ? (
                        <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300 text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <label className="block">
                            <span className="sr-only">Choose file</span>
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={handleFileChange}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-4">
                            Supported formats: .xlsx, .xls. Ensure columns:
                            Question, Option A, B, C, D, Correct Answer, Marks
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {questions.map((q, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-xl p-6 border border-gray-200 relative group"
                            >
                              <button
                                onClick={() => removeQuestion(index)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded flex items-center justify-center text-xs">
                                  {index + 1}
                                </span>
                                Question Details
                              </h4>

                              <div className="space-y-4">
                                <input
                                  type="text"
                                  placeholder="Type your question here..."
                                  value={q.questionText}
                                  onChange={(e) =>
                                    updateQuestion(
                                      index,
                                      "questionText",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {["A", "B", "C", "D"].map((opt) => (
                                    <div key={opt} className="relative">
                                      <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">
                                        {opt}
                                      </span>
                                      <input
                                        type="text"
                                        placeholder={`Option ${opt}`}
                                        value={q.options[opt]}
                                        onChange={(e) =>
                                          updateQuestion(
                                            index,
                                            `option-${opt}`,
                                            e.target.value,
                                          )
                                        }
                                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 outline-none"
                                      />
                                    </div>
                                  ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <select
                                    value={q.correctAnswer}
                                    onChange={(e) =>
                                      updateQuestion(
                                        index,
                                        "correctAnswer",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm outline-none"
                                  >
                                    <option value="">
                                      Select Correct Answer
                                    </option>
                                    <option value="A">Option A</option>
                                    <option value="B">Option B</option>
                                    <option value="C">Option C</option>
                                    <option value="D">Option D</option>
                                  </select>
                                  <input
                                    type="number"
                                    placeholder="Marks"
                                    value={q.marks}
                                    min="1"
                                    onChange={(e) =>
                                      updateQuestion(
                                        index,
                                        "marks",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={addQuestion}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Add Another Question
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <button
                          onClick={() => setCreationStep(1)}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back to Details
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmit}
                          disabled={
                            loading ||
                            (creationMethod === "manual" &&
                              questions.length === 0) ||
                            (creationMethod === "excel" && !excelFile)
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Publish Quiz
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quiz List Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">All Quizzes</h2>
              <div className="flex gap-2">
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Total: {quizzes.length}
                </span>
              </div>
            </div>

            {loading && !showCreateForm ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                Loading quizzes...
              </div>
            ) : quizzes.length === 0 ? (
              <div className="p-16 text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No quizzes found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-medium">Title</th>
                      <th className="px-6 py-4 font-medium">Department</th>
                      <th className="px-6 py-4 font-medium">Info</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quizzes.map((quiz) => (
                      <tr
                        key={quiz._id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {quiz.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {quiz.subject}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {quiz.department}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {quiz.duration}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-3 h-3" /> {quiz.totalMarks}pts
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                quiz.isActive
                                  ? "bg-green-50 text-green-700 border-green-100"
                                  : "bg-red-50 text-red-700 border-red-100"
                              }`}
                            >
                              {quiz.isActive ? "Active" : "Inactive"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                quiz.isPublished
                                  ? "bg-blue-50 text-blue-700 border-blue-100"
                                  : "bg-amber-50 text-amber-700 border-amber-100"
                              }`}
                            >
                              {quiz.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewQuestions(quiz)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Questions"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                toggleQuizActive(quiz._id, quiz.isActive)
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                quiz.isActive
                                  ? "text-amber-500 hover:bg-amber-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={quiz.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                toggleQuizPublish(quiz._id, quiz.isPublished)
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                quiz.isPublished
                                  ? "text-gray-400 hover:bg-gray-100"
                                  : "text-blue-600 hover:bg-blue-50"
                              }`}
                              title={quiz.isPublished ? "Unpublish" : "Publish"}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* View Questions Modal */}
          <AnimatePresence>
            {showQuestionsModal && selectedQuiz && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={closeQuestionsModal}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedQuiz.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {quizQuestions.length} Questions
                      </p>
                    </div>
                    <button
                      onClick={closeQuestionsModal}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loadingQuestions ? (
                      <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                      </div>
                    ) : quizQuestions.length === 0 ? (
                      <div className="text-center text-gray-400 py-12">
                        No questions found
                      </div>
                    ) : (
                      quizQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded">
                              Q{idx + 1}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {q.marks} Marks
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium mb-4">
                            {q.questionText}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Array.isArray(q.options)
                              ? // New format: array of {text, isCorrect}
                                q.options.map((opt, optIdx) => {
                                  const optionLabel = String.fromCharCode(
                                    65 + optIdx,
                                  ); // A, B, C, D
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`px-4 py-3 rounded-lg border text-sm flex items-center justify-between ${
                                        opt.isCorrect
                                          ? "bg-green-50 border-green-200 text-green-900"
                                          : "bg-gray-50 border-gray-100 text-gray-600"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span
                                          className={`font-bold text-xs ${opt.isCorrect ? "text-green-700" : "text-gray-400"}`}
                                        >
                                          {optionLabel}
                                        </span>
                                        <span>{opt.text}</span>
                                      </div>
                                      {opt.isCorrect && (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      )}
                                    </div>
                                  );
                                })
                              : // Old format: object {A: "text", B: "text"}
                                Object.entries(q.options || {}).map(
                                  ([key, val]) => (
                                    <div
                                      key={key}
                                      className={`px-4 py-3 rounded-lg border text-sm flex items-center justify-between ${
                                        q.correctAnswer === key
                                          ? "bg-green-50 border-green-200 text-green-900"
                                          : "bg-gray-50 border-gray-100 text-gray-600"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span
                                          className={`font-bold text-xs ${q.correctAnswer === key ? "text-green-700" : "text-gray-400"}`}
                                        >
                                          {key}
                                        </span>
                                        <span>{val}</span>
                                      </div>
                                      {q.correctAnswer === key && (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      )}
                                    </div>
                                  ),
                                )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                      onClick={closeQuestionsModal}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                    >
                      Close Viewer
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default AdminQuizzes;

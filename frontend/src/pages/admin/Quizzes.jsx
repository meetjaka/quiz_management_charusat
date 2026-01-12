import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api from "../../api";

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    totalMarks: "",
    passingMarks: "",
  });

  // Fetch quizzes on component mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Clear messages after 5 seconds
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (
      !formData.title ||
      !formData.department ||
      !formData.semester ||
      !formData.subject ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.duration ||
      !formData.totalMarks ||
      !formData.passingMarks
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/admin/quizzes", {
        ...formData,
        duration: parseInt(formData.duration),
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
      });

      setSuccess("Quiz created successfully!");
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
        totalMarks: "",
        passingMarks: "",
      });
      setShowCreateForm(false);
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

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

  return (
    <Layout title="Quiz Management">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {showCreateForm ? "Cancel" : "+ Create Quiz"}
          </button>
        </div>

        {/* Alert Messages */}
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

        {/* Create Quiz Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Quiz
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Title */}
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

              {/* Department */}
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

              {/* Semester */}
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

              {/* Subject */}
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

              {/* Batch */}
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

              {/* Start Time */}
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

              {/* End Time */}
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

              {/* Duration */}
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

              {/* Total Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks *
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                  min="1"
                />
              </div>

              {/* Passing Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Marks *
                </label>
                <input
                  type="number"
                  name="passingMarks"
                  value={formData.passingMarks}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 40"
                  min="0"
                />
              </div>

              {/* Description */}
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

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  {loading ? "Creating..." : "Create Quiz"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Quizzes List */}
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
                        <div className="flex gap-2">
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
      </div>
    </Layout>
  );
};

export default AdminQuizzes;

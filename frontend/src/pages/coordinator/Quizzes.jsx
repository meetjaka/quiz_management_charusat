import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Plus,
  BookOpen,
  Eye,
  BarChart3,
  FileText,
  Edit2,
  Trash2,
  Users,
  UserPlus,
  X,
  Search,
} from "lucide-react";
import Layout from "../../components/Layout";
import apiClient from "../../api";

// Helper to derive batch/group from studentId (e.g. "23it001" -> "23IT")
const getBatchFromStudentId = (studentId) => {
  if (!studentId) return null;
  const match = String(studentId).match(/^\d{2}[A-Za-z]+/);
  return match ? match[0].toUpperCase() : null;
};

const CoordinatorQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const [editingQuizData, setEditingQuizData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false); // Prevent refetch during updates

  // Student assignment states
  const [showAssignedStudents, setShowAssignedStudents] = useState(false);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [assigningStudents, setAssigningStudents] = useState(false);
  const [batchFilter, setBatchFilter] = useState("all");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Refetch quizzes when page becomes visible again (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isUpdating) {
        fetchQuizzes();
      }
    };

    const handleFocus = () => {
      if (!isUpdating) {
        fetchQuizzes();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isUpdating]);

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
        `/coordinator/quizzes/${quizId}/results`,
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

  // Fetch assigned students for a quiz
  const fetchAssignedStudents = async (quizId) => {
    try {
      const response = await apiClient.get(
        `/coordinator/quizzes/${quizId}/assigned-students`,
      );
      setAssignedStudents(response.data.data || []);
      setShowAssignedStudents(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch assigned students",
      );
      console.error("Error fetching assigned students:", err);
    }
  };

  // Fetch all students for assignment
  const fetchAllStudents = async (searchTerm = "") => {
    try {
      const params = new URLSearchParams();
      params.append("limit", "1000");
      if (searchTerm) params.append("search", searchTerm);

      const response = await apiClient.get(
        `/coordinator/students?${params.toString()}`,
      );
      setAllStudents(response.data.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // Open add students modal
  const openAddStudentsModal = async (quiz) => {
    setSelectedQuiz(quiz);
    setSelectedStudents([]);
    setStudentSearchTerm("");
    setBatchFilter("all");
    await fetchAllStudents();
    // Also fetch currently assigned to filter them out
    try {
      const response = await apiClient.get(
        `/coordinator/quizzes/${quiz._id}/assigned-students`,
      );
      setAssignedStudents(response.data.data || []);
    } catch (err) {
      console.error("Error fetching assigned students:", err);
    }
    setShowAddStudents(true);
  };

  // Assign selected students to quiz
  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    setAssigningStudents(true);
    try {
      await apiClient.post(`/coordinator/quizzes/${selectedQuiz._id}/assign`, {
        studentIds: selectedStudents,
      });
      alert(
        `Successfully assigned ${selectedStudents.length} student(s) to the quiz!`,
      );
      setShowAddStudents(false);
      setSelectedStudents([]);
      // Refresh quizzes to update stats
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign students");
      console.error("Error assigning students:", err);
      alert("Failed to assign students");
    } finally {
      setAssigningStudents(false);
    }
  };

  // Remove a student assignment
  const handleRemoveStudentAssignment = async (studentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this quiz?`)) {
      return;
    }

    try {
      await apiClient.delete(
        `/coordinator/quizzes/${selectedQuiz._id}/assigned-students/${studentId}`,
      );
      setAssignedStudents(
        assignedStudents.filter((a) => a.studentId?._id !== studentId),
      );
      alert("Student removed from quiz successfully!");
      // Refresh quizzes to update stats
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove student");
      console.error("Error removing student:", err);
      alert("Failed to remove student");
    }
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  // Select/deselect all students
  const toggleSelectAll = () => {
    const assignedIds = assignedStudents
      .map((a) => a.studentId?._id)
      .filter(Boolean);
    const availableStudents = allStudents
      .filter((s) => !assignedIds.includes(s._id))
      .filter((s) => {
        if (batchFilter === "all") return true;
        const batch = getBatchFromStudentId(s.studentId);
        return batch === batchFilter;
      });

    if (selectedStudents.length === availableStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(availableStudents.map((s) => s._id));
    }
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/coordinator/quizzes/${quizId}`);
      setQuizzes(quizzes.filter((q) => q._id !== quizId));
      alert("Quiz deleted successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete quiz";
      setError(errorMsg);
      console.error("Error deleting quiz:", err);
      alert(errorMsg);
    }
  };

  const toggleQuizExpand = (quizId) => {
    setExpandedQuizId(expandedQuizId === quizId ? null : quizId);
  };

  const handleQuickActivate = async (quiz) => {
    setIsUpdating(true);
    try {
      const updatedQuiz = { ...quiz, isActive: !quiz.isActive };
      console.log(
        "Activating quiz:",
        quiz._id,
        "new status:",
        updatedQuiz.isActive,
      );

      const response = await apiClient.put(`/coordinator/quizzes/${quiz._id}`, {
        isActive: updatedQuiz.isActive,
      });
      console.log("Activate response:", response.data);

      // Update local state
      setQuizzes(
        quizzes.map((q) =>
          q._id === quiz._id ? { ...q, isActive: updatedQuiz.isActive } : q,
        ),
      );
      alert(
        `Quiz ${updatedQuiz.isActive ? "activated" : "deactivated"} successfully!`,
      );

      // Wait a bit before allowing refetch
      setTimeout(() => setIsUpdating(false), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quiz");
      console.error("Error updating quiz:", err);
      alert("Failed to update quiz status");
      setIsUpdating(false);
    }
  };

  const handlePublishQuiz = async (quiz) => {
    setIsUpdating(true);
    try {
      const response = await apiClient.put(`/coordinator/quizzes/${quiz._id}`, {
        status: "published",
        isActive: true,
      });
      console.log("Publish response:", response.data);

      // Update local state
      setQuizzes(
        quizzes.map((q) =>
          q._id === quiz._id
            ? { ...q, status: "published", isActive: true }
            : q,
        ),
      );
      alert("Quiz published successfully! Students can now attempt the quiz.");

      // Wait a bit before allowing refetch
      setTimeout(() => setIsUpdating(false), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish quiz");
      console.error("Error publishing quiz:", err);
      alert("Failed to publish quiz");
      setIsUpdating(false);
    }
  };

  const handleQuickUpdate = async (quizId, field, value) => {
    setIsUpdating(true);
    try {
      const quiz = quizzes.find((q) => q._id === quizId);
      const updatedQuiz = { ...quiz, [field]: value };
      await apiClient.put(`/coordinator/quizzes/${quizId}`, {
        [field]: value,
      });
      setQuizzes(quizzes.map((q) => (q._id === quizId ? updatedQuiz : q)));
      setEditingQuizData({ ...editingQuizData, [quizId]: updatedQuiz });

      // Wait a bit before allowing refetch
      setTimeout(() => setIsUpdating(false), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quiz");
      console.error("Error updating quiz:", err);
      alert("Failed to update quiz");
      setIsUpdating(false);
    }
  };

  const getQuizStatus = (quiz) => {
    // First check if quiz is draft
    if (quiz.status !== "published") {
      return { label: "Draft", color: "bg-warning-100 text-warning-800" };
    }

    const now = new Date();
    const start = new Date(quiz.startTime);
    const end = new Date(quiz.endTime);

    if (now < start)
      return { label: "Upcoming", color: "bg-warning-100 text-warning-800" };
    if (now > end)
      return { label: "Ended", color: "bg-secondary-100 text-secondary-800" };
    if (quiz.isActive)
      return { label: "Active", color: "bg-success-100 text-success-800" };
    return { label: "Inactive", color: "bg-danger-100 text-danger-800" };
  };

  if (loading && quizzes.length === 0) {
    return (
      <Layout title="My Quizzes">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            <p className="mt-4 text-secondary-600">Loading quizzes...</p>
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
            <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-brand-600" />
              My Quizzes
            </h1>
            <p className="text-secondary-600 mt-1">
              Manage and monitor your quizzes
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/coordinator/question-bank")}
              className="px-4 py-2 bg-white border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Question Bank
            </button>
            <button
              onClick={() => navigate("/coordinator/quizzes/create")}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Quiz
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <p className="text-danger-800">{error}</p>
          </div>
        )}

        {/* Results Modal */}
        {showResults && selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-secondary-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-secondary-900">
                    Results: {selectedQuiz.title}
                  </h2>
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setSelectedQuiz(null);
                      setResults([]);
                    }}
                    className="text-secondary-500 hover:text-secondary-700"
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
                  <p className="text-center text-secondary-500 py-8">
                    No results available yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-200">
                      <thead className="bg-secondary-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                            Student ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-secondary-200">
                        {results
                          .slice()
                          .sort(
                            (a, b) => (b.totalScore || 0) - (a.totalScore || 0),
                          )
                          .map((result, index) => {
                            const maxScore =
                              selectedQuiz?.totalMarks ?? result.maxScore ?? 0;
                            const percentage =
                              typeof result.percentage === "number" &&
                                !isNaN(result.percentage)
                                ? result.percentage
                                : maxScore > 0
                                  ? (Number(result.totalScore || 0) /
                                    maxScore) *
                                  100
                                  : 0;
                            const isPassed =
                              typeof selectedQuiz?.passingMarks === "number"
                                ? Number(result.totalScore || 0) >=
                                Number(selectedQuiz.passingMarks)
                                : Boolean(result.isPassed);

                            return (
                              <tr key={result._id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-900">
                                  #{index + 1}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-secondary-900">
                                    {result.studentId?.fullName || "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-900">
                                  {result.studentId?.studentId ||
                                    result.studentId?.enrollmentNumber ||
                                    "Not Provided"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-900">
                                  {result.totalScore}/{maxScore || "-"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-900">
                                  {percentage.toFixed(2)}%
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${isPassed
                                        ? "bg-success-100 text-success-800"
                                        : "bg-danger-100 text-danger-800"
                                      }`}
                                  >
                                    {isPassed ? "Passed" : "Failed"}
                                  </span>
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
          </div>
        )}

        {/* Assigned Students Modal */}
        {showAssignedStudents && selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-secondary-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-secondary-900">
                      Assigned Students
                    </h2>
                    <p className="text-sm text-secondary-500 mt-1">
                      {selectedQuiz.title} - {assignedStudents.length}{" "}
                      student(s) assigned
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAssignedStudents(false);
                      setSelectedQuiz(null);
                      setAssignedStudents([]);
                    }}
                    className="text-secondary-500 hover:text-secondary-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {assignedStudents.filter((a) => a.studentId).length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500">No students assigned yet</p>
                    <button
                      onClick={() => {
                        setShowAssignedStudents(false);
                        openAddStudentsModal(selectedQuiz);
                      }}
                      className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Students
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedStudents
                      .filter((a) => a.studentId)
                      .map((assignment) => (
                        <div
                          key={assignment._id}
                          className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-secondary-900">
                              {assignment.studentId?.fullName}
                            </p>
                            <p className="text-sm text-secondary-500">
                              {assignment.studentId?.email} |{" "}
                              {assignment.studentId?.studentId}
                            </p>
                            <p className="text-xs text-secondary-400">
                              {assignment.studentId?.department}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveStudentAssignment(
                                assignment.studentId?._id,
                                assignment.studentId?.fullName,
                              )
                            }
                            className="text-danger-600 hover:text-danger-800 p-2"
                            title="Remove assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-secondary-200 bg-secondary-50">
                <button
                  onClick={() => {
                    setShowAssignedStudents(false);
                    openAddStudentsModal(selectedQuiz);
                  }}
                  className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add More Students
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Students Modal */}
        {showAddStudents && selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-secondary-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-secondary-900">
                      Add Students to Quiz
                    </h2>
                    <p className="text-sm text-secondary-500 mt-1">
                      {selectedQuiz.title}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddStudents(false);
                      setSelectedQuiz(null);
                      setSelectedStudents([]);
                      setStudentSearchTerm("");
                    }}
                    className="text-secondary-500 hover:text-secondary-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {/* Search Bar */}
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search students by name, email, or ID..."
                    value={studentSearchTerm}
                    onChange={(e) => {
                      setStudentSearchTerm(e.target.value);
                      fetchAllStudents(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
              <div className="p-4 border-b border-secondary-200 bg-secondary-50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={() => {
                      const assignedIds = assignedStudents
                        .map((a) => a.studentId?._id)
                        .filter(Boolean);
                      const availableFiltered = allStudents
                        .filter((s) => !assignedIds.includes(s._id))
                        .filter((s) => {
                          if (batchFilter === "all") return true;
                          const batch = getBatchFromStudentId(s.studentId);
                          return batch === batchFilter;
                        });
                      return (
                        availableFiltered.length > 0 &&
                        selectedStudents.length === availableFiltered.length
                      );
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <label htmlFor="selectAll" className="text-sm text-secondary-700">
                    Select All (
                    {(() => {
                      const assignedIds = assignedStudents
                        .map((a) => a.studentId?._id)
                        .filter(Boolean);
                      return allStudents
                        .filter((s) => !assignedIds.includes(s._id))
                        .filter((s) => {
                          if (batchFilter === "all") return true;
                          const batch = getBatchFromStudentId(s.studentId);
                          return batch === batchFilter;
                        }).length;
                    })()}{" "}
                    available)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary-700">Batch:</span>
                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="border border-secondary-300 rounded-md text-sm px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="all">All batches</option>
                    {Array.from(
                      new Set(
                        allStudents
                          .map((s) => getBatchFromStudentId(s.studentId))
                          .filter(Boolean),
                      ),
                    )
                      .sort()
                      .map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="text-sm text-secondary-600">
                  {selectedStudents.length} selected
                </p>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {allStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500">No students found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allStudents.map((student) => {
                      const batch = getBatchFromStudentId(student.studentId);
                      if (batchFilter !== "all" && batch !== batchFilter) {
                        return null;
                      }
                      const isAssigned = assignedStudents.some(
                        (a) => a.studentId?._id === student._id,
                      );
                      const isSelected = selectedStudents.includes(student._id);

                      return (
                        <div
                          key={student._id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isAssigned
                              ? "bg-secondary-100 border-secondary-200 opacity-60"
                              : isSelected
                                ? "bg-brand-50 border-brand-300"
                                : "bg-white border-secondary-200 hover:bg-secondary-50"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isAssigned}
                            onChange={() => toggleStudentSelection(student._id)}
                            className="w-4 h-4 text-brand-600 rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-secondary-900">
                              {student.fullName}
                            </p>
                            <p className="text-sm text-secondary-500">
                              {student.email} | {student.studentId}
                            </p>
                            <p className="text-xs text-secondary-400">
                              {student.department}
                              {batch && ` • ${batch} batch`}
                            </p>
                          </div>
                          {isAssigned && (
                            <span className="px-2 py-1 text-xs bg-success-100 text-success-700 rounded">
                              Already Assigned
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-secondary-200 bg-secondary-50 flex gap-3">
                <button
                  onClick={() => {
                    setShowAddStudents(false);
                    setSelectedQuiz(null);
                    setSelectedStudents([]);
                    setStudentSearchTerm("");
                  }}
                  className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignStudents}
                  disabled={selectedStudents.length === 0 || assigningStudents}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${selectedStudents.length === 0 || assigningStudents
                      ? "bg-secondary-300 text-secondary-500 cursor-not-allowed"
                      : "bg-brand-600 text-white hover:bg-brand-700"
                    }`}
                >
                  {assigningStudents ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Assign {selectedStudents.length} Student(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quizzes List */}
        <div className="bg-white rounded-lg shadow">
          {quizzes.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <p className="mt-4 text-secondary-600 font-medium">
                No quizzes created yet
              </p>
              <p className="text-sm text-secondary-500 mt-2">
                Create your first quiz to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                      Quiz Details
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {quizzes.map((quiz) => {
                    const status = getQuizStatus(quiz);
                    const isExpanded = expandedQuizId === quiz._id;
                    return (
                      <React.Fragment key={quiz._id}>
                        <tr
                          className="hover:bg-secondary-50 cursor-pointer"
                          onClick={() => toggleQuizExpand(quiz._id)}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-secondary-900">
                              {quiz.title}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {quiz.department} - {quiz.semester} -{" "}
                              {quiz.subject}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-secondary-900">
                              {new Date(quiz.startTime).toLocaleString()}
                            </div>
                            <div className="text-sm text-secondary-500">
                              to {new Date(quiz.endTime).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-secondary-900">
                              {quiz.totalQuestions} questions
                            </div>
                            <div className="text-sm text-secondary-500">
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
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setSelectedQuiz(quiz);
                                  fetchResults(quiz._id);
                                }}
                                className="text-success-600 hover:text-success-900 flex items-center gap-1"
                              >
                                <BarChart3 className="w-4 h-4" />
                                Results
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteQuiz(quiz._id, quiz.title)
                                }
                                className="text-danger-600 hover:text-danger-900 flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 bg-secondary-50">
                              <div className="border-l-4 border-brand-500 pl-4">
                                <h4 className="font-semibold text-secondary-900 mb-3">
                                  Quick Actions
                                </h4>

                                {/* Publish Banner for Draft Quizzes */}
                                {quiz.status !== "published" && (
                                  <div className="mb-4 p-4 bg-warning-50 border border-warning-200 rounded-lg flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-warning-800">
                                        ⚠️ This quiz is in draft mode
                                      </p>
                                      <p className="text-sm text-warning-700">
                                        Students cannot attempt this quiz until
                                        it is published.
                                      </p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePublishQuiz(quiz);
                                      }}
                                      className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors font-medium"
                                    >
                                      Publish Now
                                    </button>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-white p-4 rounded-lg border border-secondary-200">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="text-sm text-secondary-600 mb-1">
                                          Status
                                        </p>
                                        <p className="font-medium text-secondary-900">
                                          {quiz.status === "published"
                                            ? quiz.isActive
                                              ? "Published & Active"
                                              : "Published (Inactive)"
                                            : "Draft"}
                                        </p>
                                      </div>
                                      {quiz.status === "published" && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickActivate(quiz);
                                          }}
                                          className={`px-3 py-1 rounded text-sm font-medium ${quiz.isActive
                                              ? "bg-danger-100 text-danger-700 hover:bg-danger-200"
                                              : "bg-success-100 text-success-700 hover:bg-success-200"
                                            }`}
                                        >
                                          {quiz.isActive
                                            ? "Deactivate"
                                            : "Activate"}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="bg-white p-4 rounded-lg border border-secondary-200">
                                    <p className="text-sm text-secondary-600 mb-2">
                                      Start Time
                                    </p>
                                    <input
                                      type="datetime-local"
                                      value={
                                        quiz.startTime
                                          ? new Date(
                                            new Date(
                                              quiz.startTime,
                                            ).getTime() -
                                            new Date(
                                              quiz.startTime,
                                            ).getTimezoneOffset() *
                                            60000,
                                          )
                                            .toISOString()
                                            .slice(0, 16)
                                          : ""
                                      }
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleQuickUpdate(
                                          quiz._id,
                                          "startTime",
                                          new Date(
                                            e.target.value,
                                          ).toISOString(),
                                        );
                                      }}
                                      className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-brand-500"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="bg-white p-4 rounded-lg border border-secondary-200">
                                    <p className="text-sm text-secondary-600 mb-2">
                                      End Time
                                    </p>
                                    <input
                                      type="datetime-local"
                                      value={
                                        quiz.endTime
                                          ? new Date(
                                            new Date(quiz.endTime).getTime() -
                                            new Date(
                                              quiz.endTime,
                                            ).getTimezoneOffset() *
                                            60000,
                                          )
                                            .toISOString()
                                            .slice(0, 16)
                                          : ""
                                      }
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleQuickUpdate(
                                          quiz._id,
                                          "endTime",
                                          new Date(
                                            e.target.value,
                                          ).toISOString(),
                                        );
                                      }}
                                      className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-brand-500"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="bg-white p-4 rounded-lg border border-secondary-200">
                                    <p className="text-sm text-secondary-600 mb-2">
                                      Duration (minutes)
                                    </p>
                                    <input
                                      type="number"
                                      value={quiz.durationMinutes || ""}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleQuickUpdate(
                                          quiz._id,
                                          "durationMinutes",
                                          parseInt(e.target.value) || 0,
                                        );
                                      }}
                                      className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-brand-500"
                                      onClick={(e) => e.stopPropagation()}
                                      min="1"
                                    />
                                  </div>
                                  <div className="bg-white p-4 rounded-lg border border-secondary-200">
                                    <p className="text-sm text-secondary-600 mb-1">
                                      Total Marks
                                    </p>
                                    <p className="font-medium text-secondary-900">
                                      {quiz.totalMarks}
                                    </p>
                                  </div>
                                  <div className="bg-white p-4 rounded-lg border border-secondary-200 flex items-center justify-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/coordinator/quizzes/edit/${quiz._id}`,
                                        );
                                      }}
                                      className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      Edit Quiz
                                    </button>
                                  </div>
                                </div>

                                {/* Student Assignment Section */}
                                <div className="mt-4 pt-4 border-t border-secondary-200">
                                  <h4 className="font-semibold text-secondary-900 mb-3">
                                    Student Assignment
                                  </h4>
                                  <div className="flex gap-3 flex-wrap">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedQuiz(quiz);
                                        fetchAssignedStudents(quiz._id);
                                      }}
                                      className="px-4 py-2 bg-white border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors flex items-center gap-2"
                                    >
                                      <Users className="w-4 h-4" />
                                      View Assigned (
                                      {quiz.stats?.assignedTo || 0})
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAddStudentsModal(quiz);
                                      }}
                                      className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors flex items-center gap-2"
                                    >
                                      <UserPlus className="w-4 h-4" />
                                      Add Students
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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

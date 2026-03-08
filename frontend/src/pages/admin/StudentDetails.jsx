import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../api";

const StudentDetails = ({ id: propId, forceId }) => {
  // If forceId is true, always use propId; otherwise, fallback to useParams
  const { id: routeId } = useParams();
  const id = forceId ? propId : routeId;
  const [student, setStudent] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [editModal, setEditModal] = useState({
    open: false,
    quiz: null,
    newMarks: "",
  });
  const [markLoading, setMarkLoading] = useState(false);
  const [markError, setMarkError] = useState("");
  const [markSuccess, setMarkSuccess] = useState("");

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        const studentRes = await apiClient.get(`/admin/users/${id}`);
        setStudent(studentRes.data.data);
        // TODO: Replace with new API for quizzes/attempts
        const quizRes = await apiClient.get(`/admin/students/${id}/quizzes`, {
          params: subjectFilter ? { subject: subjectFilter } : {},
        });
        setQuizzes(quizRes.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch details");
      } finally {
        setLoading(false);
      }
    };
    fetchStudentDetails();
  }, [id, subjectFilter]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger-500">{error}</div>;
  if (!student) return <div>No student found.</div>;

  const openEditModal = (quiz) => {
    setEditModal({
      open: true,
      quiz,
      newMarks: quiz.marks !== undefined ? quiz.marks : "",
    });
    setMarkError("");
    setMarkSuccess("");
  };

  const closeEditModal = () => {
    setEditModal({ open: false, quiz: null, newMarks: "" });
    setMarkError("");
    setMarkSuccess("");
  };

  const handleMarkChange = (e) => {
    setEditModal((prev) => ({ ...prev, newMarks: e.target.value }));
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    setMarkLoading(true);
    setMarkError("");
    setMarkSuccess("");
    try {
      const marks = Number(editModal.newMarks);
      if (isNaN(marks)) {
        setMarkError("Please enter a valid number");
        setMarkLoading(false);
        return;
      }
      const res = await apiClient.put(
        `/admin/students/${id}/attempts/${editModal.quiz.attemptId}/marks`,
        { marks },
      );
      setMarkSuccess("Marks updated successfully");
      // Update local state
      setQuizzes((prev) =>
        prev.map((q) =>
          q.quizId === editModal.quiz.quizId ? { ...q, marks } : q,
        ),
      );
      setTimeout(() => {
        closeEditModal();
      }, 1000);
    } catch (err) {
      setMarkError(err.response?.data?.message || "Failed to update marks");
    } finally {
      setMarkLoading(false);
    }
  };

  return (
    <div className="p-0 md:p-6">
      <div className="bg-white rounded-xl shadow-card-hover border border-brand-100 p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-card-hover">
            {student.fullName?.charAt(0)?.toUpperCase() ||
              student.email?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-secondary-900">
              {student.fullName || (
                <span className="italic text-secondary-400">No Name</span>
              )}
            </div>
            <div className="text-secondary-500 text-sm md:text-base">
              {student.email}
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-2">
            <label className="text-secondary-600 font-medium">
              Filter by Subject:
            </label>
            <input
              type="text"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              placeholder="Enter subject name"
              className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-card-hover border border-secondary-100 p-6">
        <h3 className="text-xl font-semibold mb-4 text-brand-800">
          Quiz Attempts
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200 text-sm">
            <thead className="bg-brand-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-secondary-700 uppercase tracking-wider">
                  Quiz Title
                </th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-700 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-700 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-100">
              {quizzes.map((quiz) => (
                <tr
                  key={quiz.quizId}
                  className="hover:bg-brand-50 transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-secondary-900">
                    {quiz.title}
                  </td>
                  <td className="px-6 py-3 text-secondary-700">
                    {quiz.subject || (
                      <span className="italic text-secondary-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-secondary-700">
                    {quiz.marks !== undefined ? (
                      quiz.marks
                    ) : (
                      <span className="italic text-secondary-400">Not given</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {quiz.status === "Attempted" ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-success-100 text-success-700 text-xs font-semibold">
                        Attempted
                      </span>
                    ) : quiz.status === "Not given" ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-secondary-100 text-secondary-500 text-xs font-semibold">
                        Not given
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-warning-100 text-warning-700 text-xs font-semibold">
                        {quiz.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {quiz.attemptId ? (
                      <button
                        className="text-brand-600 hover:underline font-medium"
                        onClick={() => openEditModal(quiz)}
                      >
                        Edit Marks
                      </button>
                    ) : (
                      <span className="text-secondary-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Marks Modal */}
      {editModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-card-hover p-6 min-w-[300px]">
            <h4 className="text-lg font-bold mb-2">
              Edit Marks for {editModal.quiz.title}
            </h4>
            <form onSubmit={handleMarkSubmit} className="space-y-4">
              <input
                type="number"
                value={editModal.newMarks}
                onChange={handleMarkChange}
                className="border px-2 py-1 rounded w-full"
                min="0"
                max={editModal.quiz.totalMarks}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-brand-600 text-white px-4 py-1 rounded disabled:opacity-50"
                  disabled={markLoading}
                >
                  {markLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="bg-secondary-300 px-4 py-1 rounded"
                  onClick={closeEditModal}
                  disabled={markLoading}
                >
                  Cancel
                </button>
              </div>
              {markError && (
                <div className="text-danger-500 text-sm">{markError}</div>
              )}
              {markSuccess && (
                <div className="text-success-600 text-sm">{markSuccess}</div>
              )}
            </form>
          </div>
        </div>
      )}
      {/* TODO: Add performance summary */}
    </div>
  );
};

export default StudentDetails;

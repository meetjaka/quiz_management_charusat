import React, { useEffect, useState } from "react";
import apiClient from "../../api";
import StudentDetails from "./StudentDetails";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/groups");
        setGroups(res.data.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch groups");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Handlers for selecting group and student
  const handleGroupClick = async (group) => {
    setSelectedGroup(group);
    setSelectedStudent(null);
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const res = await apiClient.get(`/groups/${group._id}/members`);
      setGroupStudents(res.data.data || []);
    } catch (err) {
      setStudentsError(
        err.response?.data?.message || "Failed to fetch students",
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger-500">{error}</div>;

  return (
    <div className="p-6 min-h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Groups</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg shadow hover:bg-brand-700 transition-all"
          onClick={() => navigate("/admin/dashboard")}
        >
          <LayoutDashboard className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>
      <div className="flex gap-6 flex-col md:flex-row">
        {/* Group List */}
        <div className="bg-white rounded-xl shadow-card-hover border border-secondary-100 p-0 w-full md:w-1/3 min-w-[250px] overflow-hidden">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-100">
              {groups.map((group) => (
                <tr
                  key={group._id}
                  className={`hover:bg-brand-50 transition-colors cursor-pointer ${selectedGroup?._id === group._id ? "bg-brand-100" : ""}`}
                  onClick={() => handleGroupClick(group)}
                >
                  <td className="px-6 py-3 font-medium text-secondary-900">
                    {group.name}
                  </td>
                  <td className="px-6 py-3 text-secondary-700">{group.groupType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Students List and Back Arrow */}
        <div className="flex-1">
          {selectedGroup && (
            <div className="bg-white rounded-xl shadow-card-hover border border-secondary-100 p-6 mb-6 min-h-[200px]">
              <div className="flex items-center mb-4">
                <button
                  className="mr-2 text-secondary-600 hover:text-brand-600 p-2 rounded-full border border-secondary-200 hover:border-brand-400"
                  onClick={() => {
                    setSelectedGroup(null);
                    setGroupStudents([]);
                    setSelectedStudent(null);
                  }}
                  title="Back to Groups"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {selectedGroup.name} Students
                </h3>
              </div>
              {studentsLoading ? (
                <div className="flex items-center gap-2 text-secondary-500">
                  <span className="animate-spin">⏳</span> Loading students...
                </div>
              ) : studentsError ? (
                <div className="text-danger-500">
                  {studentsError}
                  {studentsError.includes("Not Found") && (
                    <div className="text-xs text-secondary-500 mt-1">
                      This error means the backend route{" "}
                      <code>/api/groups/:groupId/members</code> does not exist
                      or is not implemented. Please check your backend API.
                    </div>
                  )}
                </div>
              ) : groupStudents.length === 0 ? (
                <div className="text-secondary-500">
                  No students found in this group.
                </div>
              ) : (
                <ul className="space-y-2">
                  {groupStudents.map((student) => (
                    <li key={student._id}>
                      <button
                        className={`text-brand-600 hover:underline text-left ${selectedStudent?._id === student._id ? "font-bold" : ""}`}
                        onClick={() => handleStudentClick(student)}
                      >
                        {student.fullName || student.email}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Student Details */}
          {selectedStudent && (
            <div className="bg-white rounded-xl shadow-card-hover border border-brand-100 p-6 mt-4">
              <StudentDetails id={selectedStudent._id} forceId />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;

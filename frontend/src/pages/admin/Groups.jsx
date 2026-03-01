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
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 min-h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Groups</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-[#1d4ed8] transition-all"
          onClick={() => navigate("/admin/dashboard")}
        >
          <LayoutDashboard className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>
      <div className="flex gap-6 flex-col md:flex-row">
        {/* Group List */}
        <div className="bg-card rounded-md shadow-lg border border-border/50 p-0 w-full md:w-1/3 min-w-[250px] overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-gray-100">
              {groups.map((group) => (
                <tr
                  key={group._id}
                  className={`hover:bg-primary/5 transition-colors cursor-pointer ${selectedGroup?._id === group._id ? "bg-primary/10" : ""}`}
                  onClick={() => handleGroupClick(group)}
                >
                  <td className="px-6 py-3 font-medium text-secondary">
                    {group.name}
                  </td>
                  <td className="px-6 py-3 text-gray-700">{group.groupType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Students List and Back Arrow */}
        <div className="flex-1">
          {selectedGroup && (
            <div className="bg-card rounded-md shadow-lg border border-border/50 p-6 mb-6 min-h-[200px]">
              <div className="flex items-center mb-4">
                <button
                  className="mr-2 text-gray-600 hover:text-primary p-2 rounded-full border border-border hover:border-blue-400"
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
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="animate-spin">⏳</span> Loading students...
                </div>
              ) : studentsError ? (
                <div className="text-red-500">
                  {studentsError}
                  {studentsError.includes("Not Found") && (
                    <div className="text-xs text-gray-500 mt-1">
                      This error means the backend route{" "}
                      <code>/api/groups/:groupId/members</code> does not exist
                      or is not implemented. Please check your backend API.
                    </div>
                  )}
                </div>
              ) : groupStudents.length === 0 ? (
                <div className="text-gray-500">
                  No students found in this group.
                </div>
              ) : (
                <ul className="space-y-2">
                  {groupStudents.map((student) => (
                    <li key={student._id}>
                      <button
                        className={`text-primary hover:underline text-left ${selectedStudent?._id === student._id ? "font-bold" : ""}`}
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
            <div className="bg-card rounded-md shadow-lg border border-blue-100 p-6 mt-4">
              <StudentDetails id={selectedStudent._id} forceId />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;

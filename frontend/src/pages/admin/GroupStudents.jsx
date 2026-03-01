import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiClient from "../../api";

const GroupStudents = () => {
  const { groupId } = useParams();
  const [students, setStudents] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupStudents = async () => {
      try {
        setLoading(true);
        const groupRes = await apiClient.get(`/groups/${groupId}`);
        setGroup(groupRes.data.data);
        const res = await apiClient.get(`/groups/${groupId}/members`);
        setStudents(res.data.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };
    fetchGroupStudents();
  }, [groupId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {group?.name} ({group?.groupType})
      </h2>
      <h3 className="text-lg font-semibold mb-2">Students</h3>
      <ul className="space-y-2">
        {students.map((student) => (
          <li key={student._id}>
            <Link
              to={`/admin/students/${student._id}`}
              className="text-primary hover:underline"
            >
              {student.fullName || student.email}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupStudents;

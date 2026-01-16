import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  UserCog,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertCircle,
  Check,
  X
} from "lucide-react";
import Layout from "../../components/Layout";
import apiClient from "../../api";

const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "all");
  const [stats, setStats] = useState({ students: 0, coordinators: 0, admins: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    semester: "",
    enrollmentNumber: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [roleFilter]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/users", {
        params: { role: roleFilter !== "all" ? roleFilter : undefined }
      });
      setUsers(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/admin/analytics/system");
      const data = response.data.data.overview;
      setStats({
        students: data?.totalStudents || 0,
        coordinators: data?.totalCoordinators || 0,
        admins: data?.totalAdmins || 0
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleRoleChange = (role) => {
    setRoleFilter(role);
    if (role !== "all") {
      setSearchParams({ role });
    } else {
      setSearchParams({});
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setError(null);
      await apiClient.post("/admin/users", formData);
      setSuccess("User added successfully!");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "student",
        department: "",
        semester: "",
        enrollmentNumber: ""
      });
      setShowAddForm(false);
      fetchUsers();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <Layout title="User Management">
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm font-medium text-gray-500">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
            <p className="text-gray-500 mt-1">Manage students, coordinators, and administrators</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
              showAddForm 
                ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
            }`}
          >
            {showAddForm ? (
              <>
                <X className="w-4 h-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add New User
              </>
            )}
          </motion.button>
        </div>

        {/* Notifications */}
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-xl p-4 flex items-center gap-3 ${
              error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
            }`}
          >
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : (
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${error ? "text-red-800" : "text-green-800"}`}>
              {error || success}
            </span>
          </motion.div>
        )}

        {/* Add User Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="user@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="Min. 6 characters"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50">
                    <option value="student">Student</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {/* Enrollment Number (for students) */}
                {formData.role === "student" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      name="enrollmentNumber"
                      value={formData.enrollmentNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      placeholder="e.g., 21CE001"
                    />
                  </div>
                )}

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="e.g., Computer Engineering"
                  />
                </div>

                {/* Semester (for students) */}
                {formData.role === "student" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50">
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add User
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Students"
            value={stats.students}
            icon={GraduationCap}
            color="text-blue-600"
            bgColor="bg-blue-50"
            active={roleFilter === "student"}
            onClick={() => handleRoleChange("student")}
          />
          <StatCard
            title="Coordinators"
            value={stats.coordinators}
            icon={UserCog}
            color="text-purple-600"
            bgColor="bg-purple-50"
            active={roleFilter === "coordinator"}
            onClick={() => handleRoleChange("coordinator")}
          />
          <StatCard
            title="Administrators"
            value={stats.admins}
            icon={Users}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            active={roleFilter === "admin"}
            onClick={() => handleRoleChange("admin")}
          />
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or enrollment number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="coordinator">Coordinators</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          {user.enrollmentNumber && (
                            <div className="text-xs text-gray-500">{user.enrollmentNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.department || "-"}
                        {user.semester && ` (Sem ${user.semester})`}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge active={user.isActive} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group">
                            <Edit className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group">
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      {searchTerm ? "No users found matching your search" : "No users found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bgColor, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`bg-white p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all text-left w-full ${
      active ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
    }`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </motion.button>
);

const RoleBadge = ({ role }) => {
  const styles = {
    admin: "bg-red-50 text-red-700 border-red-200",
    coordinator: "bg-purple-50 text-purple-700 border-purple-200",
    student: "bg-blue-50 text-blue-700 border-blue-200",
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role] || "bg-gray-50 text-gray-700 border-gray-200"} capitalize`}>
      {role}
    </span>
  );
};

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
    active
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-gray-50 text-gray-700 border-gray-200"
  }`}>
    {active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    {active ? "Active" : "Inactive"}
  </span>
);

export default AdminUsers;

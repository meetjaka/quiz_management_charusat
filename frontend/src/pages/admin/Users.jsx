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
  X,
  UserX,
  ArrowRight,
  CheckSquare,
  Square,
  UserPlus,
} from "lucide-react";
import Layout from "../../components/Layout";
import apiClient from "../../api";
import { showToast } from "../../utils/toast";
import ConfirmDialog from "../../components/ConfirmDialog";

const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(
    searchParams.get("role") || "all",
  );
  const [stats, setStats] = useState({
    students: 0,
    coordinators: 0,
    admins: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [groups, setGroups] = useState([]);
  const [showMoveToGroupModal, setShowMoveToGroupModal] = useState(false);
  const [selectedGroupForMove, setSelectedGroupForMove] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [groupedUsers, setGroupedUsers] = useState({});
  const [deleteGroupDialog, setDeleteGroupDialog] = useState({
    show: false,
    group: null,
    deleteUsers: false,
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchGroups();
  }, [roleFilter]);

  useEffect(() => {
    setShowBulkActions(selectedUsers.length > 0);
  }, [selectedUsers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showGroupDropdown && !event.target.closest(".relative")) {
        setShowGroupDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showGroupDropdown]);

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get("/groups");
      setGroups(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

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
        params: {
          role: roleFilter !== "all" ? roleFilter : undefined,
          populate: "groups",
        },
      });
      const fetchedUsers = response.data.data || [];
      setUsers(fetchedUsers);

      console.log("=== FETCH USERS DEBUG ===");
      console.log("Total users fetched:", fetchedUsers.length);
      const sampleUserWithGroup = fetchedUsers.find(
        (u) => u.groups?.length > 0,
      );
      console.log("Sample user with groups:", sampleUserWithGroup);
      if (sampleUserWithGroup?.groups?.[0]) {
        console.log(
          "First group structure:",
          JSON.stringify(sampleUserWithGroup.groups[0], null, 2),
        );
      }

      // Group users by their groups
      const grouped = {};
      fetchedUsers.forEach((user) => {
        if (user.groups && user.groups.length > 0) {
          user.groups.forEach((group) => {
            if (!grouped[group._id]) {
              console.log("Creating new group entry:", {
                groupId: group._id,
                groupName: group.name,
                groupType: group.groupType,
                fullGroupObject: group,
              });
              grouped[group._id] = {
                groupInfo: group,
                users: [],
              };
            }
            grouped[group._id].users.push(user);
          });
        } else {
          // Users without groups
          if (!grouped["no-group"]) {
            grouped["no-group"] = {
              groupInfo: {
                _id: "no-group",
                name: "No Group",
                groupType: "none",
              },
              users: [],
            };
          }
          grouped["no-group"].users.push(user);
        }
      });

      console.log("=== FINAL GROUPED STRUCTURE ===");
      console.log("Number of groups:", Object.keys(grouped).length);
      Object.entries(grouped).forEach(([groupId, data]) => {
        console.log(`Group ${groupId}:`, {
          name: data.groupInfo?.name,
          type: data.groupInfo?.groupType,
          userCount: data.users.length,
          fullGroupInfo: JSON.stringify(data.groupInfo),
        });
      });

      setGroupedUsers(grouped);
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
        admins: data?.totalAdmins || 0,
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
      setSuccess(
        "User added successfully! They will complete their profile on first login.",
      );
      setFormData({
        email: "",
        password: "",
        role: "student",
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Multi-select handlers
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const selectAllUsers = () => {
    const allUserIds = filteredUsers.map((user) => user._id);
    setSelectedUsers(allUserIds);
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    try {
      await apiClient.delete("/admin/users/bulk", {
        data: { userIds: selectedUsers },
      });
      showToast.success(`Successfully deleted ${selectedUsers.length} users`);
      setSelectedUsers([]);
      fetchUsers();
      fetchStats();
      setShowDeleteConfirm(false);
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to delete users",
      );
    }
  };

  const handleMoveToGroup = async () => {
    if (!selectedGroupForMove) {
      showToast.error("Please select a group");
      return;
    }

    try {
      await apiClient.post(`/groups/${selectedGroupForMove}/members/bulk`, {
        userIds: selectedUsers,
      });
      const selectedGroup = groups.find((g) => g._id === selectedGroupForMove);
      showToast.success(
        `Successfully moved ${selectedUsers.length} users to ${selectedGroup.name}`,
      );
      setSelectedUsers([]);
      setShowMoveToGroupModal(false);
      setSelectedGroupForMove("");
    } catch (error) {
      showToast.error(error.response?.data?.message || "Failed to move users");
    }
  };

  // Group dropdown handlers
  const toggleGroupDropdown = (userId) => {
    setShowGroupDropdown(showGroupDropdown === userId ? null : userId);
  };

  const handleRemoveFromGroup = async (userId, groupId) => {
    try {
      await apiClient.delete(`/groups/${groupId}/members`, {
        data: { userId },
      });
      showToast.success("User removed from group");
      fetchUsers();
      setShowGroupDropdown(null);
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to remove user from group",
      );
    }
  };

  const handleChangeGroup = async (userId, newGroupId) => {
    try {
      // First remove from current group if exists
      const user = users.find((u) => u._id === userId);
      if (user.groups && user.groups.length > 0) {
        await apiClient.delete(`/groups/${user.groups[0]._id}/members`, {
          data: { userId },
        });
      }

      // Then add to new group
      if (newGroupId) {
        await apiClient.post(`/groups/${newGroupId}/members/bulk`, {
          userIds: [userId],
        });
      }

      showToast.success("Group changed successfully");
      fetchUsers();
      setShowGroupDropdown(null);
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to change group",
      );
    }
  };

  // Edit and delete handlers
  const handleEditUser = (user) => {
    // For now, we'll just show a toast. You can add edit modal later
    showToast.info(`Edit functionality for ${user.name} - Coming soon!`);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      await apiClient.delete(`/admin/users/bulk`, {
        data: { userIds: [userId] },
      });
      showToast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      showToast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Group expansion handlers
  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const expandAllGroups = () => {
    const allExpanded = {};
    Object.keys(groupedUsers).forEach((groupId) => {
      allExpanded[groupId] = true;
    });
    setExpandedGroups(allExpanded);
  };

  const collapseAllGroups = () => {
    setExpandedGroups({});
  };

  // Handle delete group
  const handleDeleteGroup = (e, groupId, groupInfo, userCount) => {
    e.stopPropagation();
    setDeleteGroupDialog({
      show: true,
      group: { _id: groupId, name: groupInfo?.name, memberCount: userCount },
      deleteUsers: false,
    });
  };

  // Confirm delete group
  const confirmDeleteGroup = async () => {
    try {
      const endpoint = deleteGroupDialog.deleteUsers
        ? `/groups/${deleteGroupDialog.group._id}/with-users`
        : `/groups/${deleteGroupDialog.group._id}`;

      const response = await apiClient.delete(endpoint);
      showToast.success(response.data.message || "Group deleted successfully");
      fetchUsers();
      fetchGroups();
      setDeleteGroupDialog({ show: false, group: null, deleteUsers: false });
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to delete group",
      );
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading && users.length === 0) {
    return (
      <Layout title="User Management">
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm font-medium text-gray-500">
              Loading users...
            </p>
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
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              User Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage students, coordinators, and administrators
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/bulk-users"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm bg-green-600 text-white hover:bg-green-700 shadow-green-200"
            >
              <Users className="w-4 h-4" /> Bulk Create Users
            </Link>
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
                  <Plus className="w-4 h-4" /> Add Single User
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                fetchUsers();
                fetchGroups();
                fetchStats();
                showToast.success("Data refreshed");
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              title="Refresh data"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Notifications */}
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-xl p-4 flex items-center gap-3 ${
              error
                ? "bg-red-50 border border-red-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : (
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
            <span
              className={`text-sm font-medium ${error ? "text-red-800" : "text-green-800"}`}
            >
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
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Add New User
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Users will complete their profile details on their first login.
            </p>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="md:col-span-2">
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
                    Temporary Password <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  >
                    <option value="student">Student</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="coordinator">Coordinators</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <span className="text-blue-800 font-medium">
                {selectedUsers.length} user
                {selectedUsers.length !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMoveToGroupModal(true)}
                className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ArrowRight className="w-4 h-4 mr-1" />
                Move to Group
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <UserX className="w-4 h-4 mr-1" />
                Delete Users
              </button>
            </div>
          </motion.div>
        )}

        {/* Expand/Collapse All */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={expandAllGroups}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Expand All
          </button>
          <button
            onClick={collapseAllGroups}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Collapse All
          </button>
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          {Object.entries(groupedUsers).map(
            ([groupId, { groupInfo, users: groupUsers }]) => (
              <div
                key={groupId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Group Header */}
                <div
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleGroupExpansion(groupId)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${groupId === "no-group" ? "bg-gray-100" : "bg-blue-100"}`}
                    >
                      <Users
                        className={`w-5 h-5 ${groupId === "no-group" ? "text-gray-600" : "text-blue-600"}`}
                      />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {groupInfo?.name || "Unknown Group"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {groupUsers.length}{" "}
                        {groupUsers.length === 1 ? "user" : "users"}
                        {groupInfo?.groupType &&
                          groupInfo.groupType !== "none" &&
                          ` • ${groupInfo.groupType}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Delete Group Button - only for actual groups */}
                    {groupId !== "no-group" && (
                      <button
                        onClick={(e) =>
                          handleDeleteGroup(
                            e,
                            groupId,
                            groupInfo,
                            groupUsers.length,
                          )
                        }
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {expandedGroups[groupId] ? (
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Group Users - Expanded View */}
                {expandedGroups[groupId] && (
                  <div className="border-t border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers((prev) => [
                                      ...new Set([
                                        ...prev,
                                        ...groupUsers.map((u) => u._id),
                                      ]),
                                    ]);
                                  } else {
                                    setSelectedUsers((prev) =>
                                      prev.filter(
                                        (id) =>
                                          !groupUsers.some((u) => u._id === id),
                                      ),
                                    );
                                  }
                                }}
                                checked={groupUsers.every((u) =>
                                  selectedUsers.includes(u._id),
                                )}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {groupUsers.map((user) => (
                            <tr
                              key={user._id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user._id)}
                                  onChange={() => toggleUserSelection(user._id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {user.name}
                                  </div>
                                  {user.enrollmentNumber && (
                                    <div className="text-xs text-gray-500">
                                      {user.enrollmentNumber}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {user.email}
                              </td>
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
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Edit user"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteUser(user._id, user.name)
                                    }
                                    className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                    title="Delete user"
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
                  </div>
                )}
              </div>
            ),
          )}

          {Object.keys(groupedUsers).length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Move to Group Modal */}
        {showMoveToGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Move Users to Group
                </h3>
                <button
                  onClick={() => setShowMoveToGroupModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Move {selectedUsers.length} selected user
                  {selectedUsers.length !== 1 ? "s" : ""} to a group:
                </p>

                <select
                  value={selectedGroupForMove}
                  onChange={(e) => setSelectedGroupForMove(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
                >
                  <option value="">Select a group</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} ({group.groupType})
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowMoveToGroupModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMoveToGroup}
                    disabled={!selectedGroupForMove}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Move Users
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleBulkDelete}
          title="Delete Users"
          message={`Are you sure you want to delete ${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""}? This action cannot be undone.`}
          confirmText="Delete Users"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />

        {/* Delete Group Dialog */}
        {deleteGroupDialog.show && deleteGroupDialog.group && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 bg-gray-500 opacity-75"
                  onClick={() =>
                    setDeleteGroupDialog({
                      show: false,
                      group: null,
                      deleteUsers: false,
                    })
                  }
                ></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Group: {deleteGroupDialog.group?.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        This group has{" "}
                        <strong>
                          {deleteGroupDialog.group?.memberCount || 0} member(s)
                        </strong>
                        . Choose how you want to delete this group:
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="deleteGroupOption"
                          checked={!deleteGroupDialog.deleteUsers}
                          onChange={() =>
                            setDeleteGroupDialog((prev) => ({
                              ...prev,
                              deleteUsers: false,
                            }))
                          }
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Delete group only
                          </span>
                          <p className="text-xs text-gray-500">
                            The group will be removed but users will remain in
                            the system
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="deleteGroupOption"
                          checked={deleteGroupDialog.deleteUsers}
                          onChange={() =>
                            setDeleteGroupDialog((prev) => ({
                              ...prev,
                              deleteUsers: true,
                            }))
                          }
                          className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-red-600">
                            Delete group and all users
                          </span>
                          <p className="text-xs text-gray-500">
                            The group and all{" "}
                            {deleteGroupDialog.group?.memberCount || 0}{" "}
                            member(s) will be permanently deleted
                          </p>
                        </div>
                      </label>
                    </div>
                    {deleteGroupDialog.deleteUsers && (
                      <div className="mt-3 p-3 bg-red-50 rounded-md">
                        <p className="text-sm text-red-700 font-medium">
                          ⚠️ Warning: This action cannot be undone. All user
                          data including quiz attempts and results will be
                          permanently deleted.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmDeleteGroup}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                      deleteGroupDialog.deleteUsers
                        ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        : "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                    }`}
                  >
                    {deleteGroupDialog.deleteUsers
                      ? "Delete Group & Users"
                      : "Delete Group Only"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteGroupDialog({
                        show: false,
                        group: null,
                        deleteUsers: false,
                      })
                    }
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  active,
  onClick,
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`bg-white p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all text-left w-full ${
      active ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
    }`}
  >
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
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role] || "bg-gray-50 text-gray-700 border-gray-200"} capitalize`}
    >
      {role}
    </span>
  );
};

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      active
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-gray-50 text-gray-700 border-gray-200"
    }`}
  >
    {active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    {active ? "Active" : "Inactive"}
  </span>
);

export default AdminUsers;

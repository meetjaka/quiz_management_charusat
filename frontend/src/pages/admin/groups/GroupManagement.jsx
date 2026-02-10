import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiUserPlus,
  FiDownload,
} from "react-icons/fi";
import { showToast } from "../../../utils/toast";
import apiClient from "../../../api";
import GroupForm from "./GroupForm";
import GroupDetails from "./GroupDetails";

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    show: false,
    group: null,
    deleteUsers: false,
  });
  const [filters, setFilters] = useState({
    groupType: "",
    isActive: "",
  });

  // Fetch groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (filters.groupType) params.append("groupType", filters.groupType);
      if (filters.isActive) params.append("isActive", filters.isActive);

      const response = await apiClient.get(`/groups?${params.toString()}`);
      setGroups(response.data.data);
    } catch (error) {
      showToast.error("Failed to fetch groups");
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [searchTerm, filters]);

  // Handle create group
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowGroupForm(true);
  };

  // Handle edit group
  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setShowGroupForm(true);
  };

  // Handle delete group
  const handleDeleteGroup = (group) => {
    setDeleteDialog({ show: true, group, deleteUsers: false });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const endpoint = deleteDialog.deleteUsers
        ? `/groups/${deleteDialog.group._id}/with-users`
        : `/groups/${deleteDialog.group._id}`;

      const response = await apiClient.delete(endpoint);
      showToast.success(response.data.message || "Group deleted successfully");
      fetchGroups();
      setDeleteDialog({ show: false, group: null, deleteUsers: false });
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to delete group",
      );
    }
  };

  // Handle view group details
  const handleViewGroup = (group) => {
    setSelectedGroup(group);
    setShowGroupDetails(true);
  };

  // Filter groups based on search
  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiUsers className="text-blue-600" />
                Group Management
              </h1>
              <p className="text-gray-600 mt-2">
                Organize users into groups and batches
              </p>
            </div>
            <button
              onClick={handleCreateGroup}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Create Group
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Group Type Filter */}
            <select
              value={filters.groupType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, groupType: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="batch">Batch</option>
              <option value="department">Department</option>
              <option value="course">Course</option>
              <option value="custom">Custom</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.isActive}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, isActive: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {group.groupType}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      group.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {group.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {group.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <FiUsers className="mr-1 h-4 w-4" />
                    {group.memberCount} members
                  </span>
                  <span>Created by {group.createdBy?.fullName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleViewGroup(group)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View Details
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit Group"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Delete Group"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No groups found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Create your first group to get started."}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateGroup}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Create Group
              </button>
            )}
          </div>
        )}

        {/* Group Form Modal */}
        {showGroupForm && (
          <GroupForm
            group={editingGroup}
            onClose={() => setShowGroupForm(false)}
            onSuccess={() => {
              fetchGroups();
              setShowGroupForm(false);
            }}
          />
        )}

        {/* Group Details Modal */}
        {showGroupDetails && selectedGroup && (
          <GroupDetails
            group={selectedGroup}
            onClose={() => setShowGroupDetails(false)}
            onGroupUpdated={fetchGroups}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deleteDialog.show && deleteDialog.group && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 bg-gray-500 opacity-75"
                  onClick={() =>
                    setDeleteDialog({
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
                    <FiTrash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Group: {deleteDialog.group?.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        This group has{" "}
                        <strong>
                          {deleteDialog.group?.memberCount || 0} member(s)
                        </strong>
                        . Choose how you want to delete this group:
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="deleteOption"
                          checked={!deleteDialog.deleteUsers}
                          onChange={() =>
                            setDeleteDialog((prev) => ({
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
                          name="deleteOption"
                          checked={deleteDialog.deleteUsers}
                          onChange={() =>
                            setDeleteDialog((prev) => ({
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
                            {deleteDialog.group?.memberCount || 0} member(s)
                            will be permanently deleted
                          </p>
                        </div>
                      </label>
                    </div>
                    {deleteDialog.deleteUsers && (
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
                    onClick={confirmDelete}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                      deleteDialog.deleteUsers
                        ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        : "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                    }`}
                  >
                    {deleteDialog.deleteUsers
                      ? "Delete Group & Users"
                      : "Delete Group Only"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteDialog({
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
      </div>
    </div>
  );
};

export default GroupManagement;

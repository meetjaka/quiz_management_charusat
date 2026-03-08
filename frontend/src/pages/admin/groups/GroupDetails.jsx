import React, { useState, useEffect } from 'react';
import { FiX, FiUserPlus, FiUsers, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';
import { showToast } from '../../../utils/toast';
import apiClient from '../../../api';

const GroupDetails = ({ group, onClose, onGroupUpdated }) => {
  const [groupData, setGroupData] = useState(group);
  const [allUsers, setAllUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch updated group data
  const fetchGroupData = async () => {
    try {
      const response = await apiClient.get(`/groups/${group._id}`);
      setGroupData(response.data.data);
    } catch (error) {
      showToast.error('Failed to fetch group details');
    }
  };

  // Fetch all users for adding to group
  const fetchAllUsers = async () => {
    try {
      const response = await apiClient.get('/admin/users?limit=1000');
      const users = response.data.data;
      setAllUsers(users);
      
      // Filter out users already in the group
      const memberIds = groupData.members.map(m => m.user._id);
      const available = users.filter(user => !memberIds.includes(user._id));
      setAvailableUsers(available);
    } catch (error) {
      showToast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    if (showAddMembers) {
      fetchAllUsers();
    }
  }, [showAddMembers, groupData.members]);

  // Handle add members
  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      showToast.error('Please select at least one user');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(`/groups/${group._id}/members/bulk`, {
        userIds: selectedUsers
      });
      
      showToast.success(`Successfully added ${selectedUsers.length} members to group`);
      setSelectedUsers([]);
      setShowAddMembers(false);
      fetchGroupData();
      onGroupUpdated();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (userId) => {
    try {
      await apiClient.delete(`/groups/${group._id}/members`, {
        data: { userId }
      });
      
      showToast.success('Member removed from group');
      fetchGroupData();
      onGroupUpdated();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  // Filter available users
  const filteredAvailableUsers = availableUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Export group members
  const handleExportMembers = () => {
    const csvContent = [
      ['Full Name', 'Email', 'Role', 'Student ID', 'Department', 'Added Date'].join(','),
      ...groupData.members.map(member => [
        `"${member.user.fullName}"`,
        `"${member.user.email}"`,
        `"${member.user.role}"`,
        `"${member.user.studentId || ''}"`,
        `"${member.user.department || ''}"`,
        `"${new Date(member.addedAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${groupData.name}_members.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-medium text-secondary-900">{groupData.name}</h3>
            <p className="text-sm text-secondary-600 capitalize">{groupData.groupType} • {groupData.memberCount} members</p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!showAddMembers ? (
            // Group Details View
            <div className="p-6">
              {/* Group Info */}
              <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
                <h4 className="font-medium text-secondary-900 mb-2">Group Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary-600">Type:</span>
                    <span className="ml-2 capitalize">{groupData.groupType}</span>
                  </div>
                  <div>
                    <span className="text-secondary-600">Status:</span>
                    <span className={`ml-2 capitalize ${groupData.isActive ? 'text-success-600' : 'text-danger-600'}`}>
                      {groupData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary-600">Created by:</span>
                    <span className="ml-2">{groupData.createdBy?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-secondary-600">Created:</span>
                    <span className="ml-2">{new Date(groupData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {groupData.description && (
                  <div className="mt-3">
                    <span className="text-secondary-600">Description:</span>
                    <p className="mt-1 text-secondary-900">{groupData.description}</p>
                  </div>
                )}
              </div>

              {/* Members List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-secondary-900 flex items-center">
                    <FiUsers className="mr-2 h-4 w-4" />
                    Members ({groupData.members.length})
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleExportMembers}
                      className="inline-flex items-center px-3 py-1 text-xs bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200"
                      disabled={groupData.members.length === 0}
                    >
                      <FiDownload className="mr-1 h-3 w-3" />
                      Export
                    </button>
                    <button
                      onClick={() => setShowAddMembers(true)}
                      className="inline-flex items-center px-3 py-1 text-xs bg-brand-100 text-brand-700 rounded hover:bg-brand-200"
                    >
                      <FiUserPlus className="mr-1 h-3 w-3" />
                      Add Members
                    </button>
                  </div>
                </div>

                {groupData.members.length === 0 ? (
                  <div className="text-center py-8 text-secondary-500">
                    <FiUsers className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>No members in this group yet</p>
                    <button
                      onClick={() => setShowAddMembers(true)}
                      className="mt-2 text-brand-600 hover:text-brand-800"
                    >
                      Add your first member
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {groupData.members.map((member) => (
                      <div key={member.user._id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {member.user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900">{member.user.fullName}</p>
                            <p className="text-xs text-secondary-600">
                              {member.user.email} • {member.user.role}
                              {member.user.studentId && ` • ${member.user.studentId}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-secondary-500">
                            Added {new Date(member.addedAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleRemoveMember(member.user._id)}
                            className="p-1 text-danger-400 hover:text-danger-600"
                            title="Remove from group"
                          >
                            <FiTrash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Add Members View
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-secondary-900">Add Members to {groupData.name}</h4>
                <button
                  onClick={() => setShowAddMembers(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  Back to Group
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              {/* Selected count */}
              {selectedUsers.length > 0 && (
                <div className="mb-4 p-3 bg-brand-50 rounded-lg">
                  <p className="text-brand-800 text-sm">
                    {selectedUsers.length} user(s) selected
                  </p>
                </div>
              )}

              {/* Available users */}
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {filteredAvailableUsers.map((user) => (
                  <div key={user._id} className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-secondary-300 rounded"
                    />
                    <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">{user.fullName}</p>
                      <p className="text-xs text-secondary-600">
                        {user.email} • {user.role}
                        {user.studentId && ` • ${user.studentId}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAvailableUsers.length === 0 && (
                <div className="text-center py-8 text-secondary-500">
                  <p>No available users found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {showAddMembers && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-secondary-50">
            <button
              onClick={() => setShowAddMembers(false)}
              className="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleAddMembers}
              disabled={loading || selectedUsers.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : `Add ${selectedUsers.length} Member(s)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;
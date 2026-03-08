import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiCalendar, FiUsers, FiEdit2, FiSave, FiX, FiBook, FiTrendingUp, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { showToast } from '../../utils/toast';
import apiClient from '../../api';
import { useAuth } from '../../context/AuthContext';

const CoordinatorProfile = () => {
  const { user, updateUserInfo } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    department: '',
    designation: '',
    phone: '',
    bio: '',
    specialization: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalStudents: 0,
    averageScore: 0,
    recentQuizzes: []
  });
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchGroups();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      const userData = response.data.data;
      setProfile({
        fullName: userData.fullName || '',
        email: userData.email || '',
        department: userData.department || '',
        designation: userData.designation || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        specialization: userData.specialization || ''
      });
    } catch (error) {
      showToast.error('Failed to fetch profile');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/coordinator/dashboard');
      const data = response.data;
      setStats({
        totalQuizzes: data.totalQuizzes || 0,
        activeQuizzes: data.activeQuizzes || 0,
        totalStudents: data.totalStudents || 0,
        averageScore: data.averageScore || 0,
        recentQuizzes: data.recentQuizzes || []
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      setGroups(response.data.data.groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await apiClient.put('/auth/profile', profile);
      
      // Update the auth context with new user info
      updateUserInfo(response.data.data);
      
      showToast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    fetchProfile(); // Reset to original values
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Coordinator Profile</h1>
          <p className="text-secondary-600">Manage your profile and view your coordination activities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-card border border-secondary-200 p-6"
            >
              {/* Profile Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-secondary-900">{profile.fullName}</h2>
                    <p className="text-secondary-600 flex items-center">
                      <FiUsers className="mr-1 h-4 w-4" />
                      Coordinator
                      {profile.designation && ` • ${profile.designation}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isEditing
                      ? 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FiX className="inline mr-1 h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <FiEdit2 className="inline mr-1 h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              {/* Profile Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center px-3 py-2 bg-secondary-50 rounded-lg">
                        <FiUser className="mr-2 h-4 w-4 text-secondary-400" />
                        <span>{profile.fullName || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Email
                    </label>
                    <div className="flex items-center px-3 py-2 bg-secondary-50 rounded-lg">
                      <FiMail className="mr-2 h-4 w-4 text-secondary-400" />
                      <span>{profile.email}</span>
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Department
                    </label>
                    {isEditing ? (
                      <select
                        value={profile.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Engineering">Computer Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics Engineering">Electronics Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Chemical Engineering">Chemical Engineering</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <div className="px-3 py-2 bg-secondary-50 rounded-lg">
                        <span>{profile.department || 'Not specified'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Designation
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                        placeholder="e.g., Assistant Professor, Lecturer"
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-secondary-50 rounded-lg">
                        <span>{profile.designation || 'Not specified'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="e.g., +91 9876543210"
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-secondary-50 rounded-lg">
                        <span>{profile.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Specialization
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        placeholder="e.g., Data Structures, Machine Learning"
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-secondary-50 rounded-lg">
                        <span>{profile.specialization || 'Not specified'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about your teaching experience and expertise..."
                      rows={3}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-secondary-50 rounded-lg min-h-[80px]">
                      <span className="text-secondary-600">{profile.bio || 'No bio provided'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <FiSave className="mr-1 h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </motion.div>

            {/* Groups Section */}
            {groups.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-card border border-secondary-200 p-6 mt-6"
              >
                <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                  <FiUsers className="mr-2 h-5 w-5" />
                  My Groups
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groups.map((group) => (
                    <div key={group._id} className="p-3 bg-secondary-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-secondary-900">{group.name}</p>
                          <p className="text-sm text-secondary-600 capitalize">{group.groupType}</p>
                        </div>
                        <span className="text-xs text-secondary-500">{group.memberCount} members</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quiz Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-card border border-secondary-200 p-6"
            >
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                <FiFileText className="mr-2 h-5 w-5" />
                Quiz Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600">Total Quizzes</span>
                  <span className="font-semibold text-secondary-900">{stats.totalQuizzes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600">Active Quizzes</span>
                  <span className="font-semibold text-success-600">{stats.activeQuizzes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600">Total Students</span>
                  <span className="font-semibold text-secondary-900">{stats.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600">Avg. Score</span>
                  <span className="font-semibold text-brand-600">{stats.averageScore.toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Quizzes */}
            {stats.recentQuizzes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-card border border-secondary-200 p-6"
              >
                <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                  <FiTrendingUp className="mr-2 h-5 w-5" />
                  Recent Quizzes
                </h3>
                <div className="space-y-3">
                  {stats.recentQuizzes.slice(0, 5).map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary-900 truncate" title={quiz.title}>
                          {quiz.title}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-secondary-900">{quiz.attempts || 0}</p>
                        <p className="text-xs text-secondary-500">attempts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-card border border-secondary-200 p-6"
            >
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 h-4 w-4 text-secondary-400" />
                  <span className="text-secondary-600">
                    Joined {new Date(user?.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiUsers className="mr-2 h-4 w-4 text-secondary-400" />
                  <span className="text-secondary-600">Coordinator Account</span>
                </div>
                <div className="flex items-center">
                  <FiBook className="mr-2 h-4 w-4 text-secondary-400" />
                  <span className="text-secondary-600">
                    {profile.department || 'Department not specified'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorProfile;
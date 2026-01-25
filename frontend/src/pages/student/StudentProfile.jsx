import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiCalendar, FiUsers, FiEdit2, FiSave, FiX, FiBook, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { showToast } from '../../utils/toast';
import apiClient from '../../api';
import { useAuth } from '../../context/AuthContext';

const StudentProfile = () => {
  const { user, updateUserInfo } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    studentId: '',
    department: '',
    batch: '',
    phone: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    completedQuizzes: 0,
    upcomingQuizzes: 0,
    recentResults: []
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
        studentId: userData.studentId || '',
        department: userData.department || '',
        batch: userData.batch || '',
        phone: userData.phone || '',
        bio: userData.bio || ''
      });
    } catch (error) {
      showToast.error('Failed to fetch profile');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/student/dashboard');
      const data = response.data;
      setStats({
        totalAttempts: data.totalAttempts || 0,
        averageScore: data.averageScore || 0,
        completedQuizzes: data.completedQuizzes || 0,
        upcomingQuizzes: data.upcomingQuizzes || 0,
        recentResults: data.recentResults || []
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600">Manage your profile and view your academic progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              {/* Profile Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{profile.fullName}</h2>
                    <p className="text-gray-600 flex items-center">
                      <FiBook className="mr-1 h-4 w-4" />
                      Student
                      {profile.studentId && ` • ${profile.studentId}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isEditing
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                        <FiUser className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{profile.fullName || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                      <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{profile.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.studentId}
                        onChange={(e) => handleInputChange('studentId', e.target.value)}
                        placeholder="e.g., 20CE001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <span>{profile.studentId || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    {isEditing ? (
                      <select
                        value={profile.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Engineering">Computer Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics Engineering">Electronics Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Chemical Engineering">Chemical Engineering</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <span>{profile.department || 'Not specified'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch/Year
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.batch}
                        onChange={(e) => handleInputChange('batch', e.target.value)}
                        placeholder="e.g., 2020-2024, 3rd Year"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <span>{profile.batch || 'Not specified'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="e.g., +91 9876543210"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <span>{profile.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg min-h-[80px]">
                      <span className="text-gray-600">{profile.bio || 'No bio provided'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiUsers className="mr-2 h-5 w-5" />
                  My Groups
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groups.map((group) => (
                    <div key={group._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{group.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{group.groupType}</p>
                        </div>
                        <span className="text-xs text-gray-500">{group.memberCount} members</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Academic Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiTrendingUp className="mr-2 h-5 w-5" />
                Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quiz Attempts</span>
                  <span className="font-semibold text-gray-900">{stats.totalAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-gray-900">{stats.completedQuizzes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Upcoming</span>
                  <span className="font-semibold text-orange-600">{stats.upcomingQuizzes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Score</span>
                  <span className={`font-semibold ${getScoreColor(stats.averageScore)}`}>
                    {stats.averageScore.toFixed(1)}%
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Recent Results */}
            {stats.recentResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h3>
                <div className="space-y-3">
                  {stats.recentResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate" title={result.quizTitle}>
                          {result.quizTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(result.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </span>
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
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Joined {new Date(user?.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiBook className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Student Account</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
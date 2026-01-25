import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUpload, FiDownload, FiUserPlus, FiEye, FiEyeOff, FiArrowLeft, FiPlus } from 'react-icons/fi';
import { showToast } from '../../utils/toast';
import apiClient from '../../api';

const BulkUserCreation = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('excel');
  const [excelFile, setExcelFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Manual form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student',
    department: '',
    semester: '',
    batch: '',
    enrollmentNumber: '',
    phoneNumber: '',
    password: '',
    generatePassword: true,
    groupId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [createGroupWithBulk, setCreateGroupWithBulk] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    groupType: 'batch'
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch groups
  const fetchGroups = async () => {
    try {
      const response = await apiClient.get('/groups');
      setGroups(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  // Handle Excel file selection
  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (!allowedTypes.includes(file.type)) {
        showToast.error('Please upload a valid Excel file (.xlsx or .xls)');
        return;
      }
      setExcelFile(file);
      setUploadResult(null);
    }
  };

  // Handle Excel upload
  const handleExcelUpload = async () => {
    if (!excelFile) {
      showToast.error('Please select an Excel file');
      return;
    }

    setUploading(true);
    try {
      let groupIdToUse = selectedGroupId;
      
      // Create new group if requested
      if (createGroupWithBulk && newGroupData.name.trim()) {
        const groupResponse = await apiClient.post('/groups', newGroupData);
        groupIdToUse = groupResponse.data.data._id;
        setGroups(prev => [...prev, groupResponse.data.data]);
        showToast.success(`Group "${newGroupData.name}" created successfully!`);
      }

      const formDataUpload = new FormData();
      formDataUpload.append('file', excelFile);
      if (groupIdToUse) {
        formDataUpload.append('groupId', groupIdToUse);
      }

      const response = await apiClient.post('/admin/users/bulk-create', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      setExcelFile(null);
      setSelectedGroupId('');
      setCreateGroupWithBulk(false);
      setNewGroupData({ name: '', description: '', groupType: 'batch' });
      
      // Reset file input
      const fileInput = document.getElementById('excel-upload');
      if (fileInput) fileInput.value = '';
      
      showToast.success(`Successfully created ${response.data.data.totalCreated} users!`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create users';
      showToast.error(errorMsg);
      console.error('Error creating users:', error);
    } finally {
      setUploading(false);
    }
  };

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      const response = await apiClient.get('/admin/users/download-template', {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulk_users_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast.success('Template downloaded successfully!');
    } catch (error) {
      showToast.error('Failed to download template');
      console.error('Error downloading template:', error);
    }
  };

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate password when generatePassword is checked
    if (name === 'generatePassword' && checked) {
      setFormData(prev => ({
        ...prev,
        password: generateRandomPassword()
      }));
    }
  };

  // Handle manual user creation
  const handleManualCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const userData = { ...formData };
      
      // Generate password if needed
      if (userData.generatePassword && !userData.password) {
        userData.password = generateRandomPassword();
      }

      // Remove generatePassword flag before sending
      delete userData.generatePassword;

      // Remove empty fields
      Object.keys(userData).forEach(key => {
        if (!userData[key]) delete userData[key];
      });

      const response = await apiClient.post('/admin/users', userData);
      
      showToast.success('User created successfully!');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        role: 'student',
        department: '',
        semester: '',
        batch: '',
        enrollmentNumber: '',
        phoneNumber: '',
        password: '',
        generatePassword: true,
        groupId: ''
      });
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create user';
      showToast.error(errorMsg);
      console.error('Error creating user:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiUsers className="text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">Create student and coordinator accounts</p>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('excel')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'excel'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUpload className="inline mr-2" />
                Bulk Upload (Excel)
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUserPlus className="inline mr-2" />
                Manual Creation
              </button>
            </nav>
          </div>
        </div>

        {/* Excel Upload Tab */}
        {activeTab === 'excel' && (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Excel Upload Instructions</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>Follow these steps to bulk create user accounts:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Download the Excel template using the button below</li>
                  <li>Fill in the required columns: <strong>email</strong> and <strong>password</strong></li>
                  <li>Email format: Must be valid (e.g., john.doe@charusat.edu.in)</li>
                  <li>Password: Temporary password for first login</li>
                  <li>Users will complete their profile during first-time login</li>
                  <li>Upload the completed file and click "Create Users"</li>
                </ol>
              </div>
            </div>

            {/* Template Download */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Download Template</h3>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiDownload className="w-5 h-5" />
                Download Excel Template
              </button>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Upload Completed File</h3>
              
              <div className="mb-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelFileChange}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer w-fit"
                >
                  <FiUpload className="w-4 h-4" />
                  Choose Excel File
                </label>
              </div>

              {excelFile && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Selected: {excelFile.name}</p>
                </div>
              )}

              {/* Group Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Assignment
                </label>
                
                {/* Option to create new group */}
                <div className="mb-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createGroupWithBulk}
                      onChange={(e) => {
                        setCreateGroupWithBulk(e.target.checked);
                        if (e.target.checked) {
                          setSelectedGroupId('');
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Create new group for these users</span>
                  </label>
                </div>

                {createGroupWithBulk ? (
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                    <div>
                      <input
                        type="text"
                        placeholder="Group Name *"
                        value={newGroupData.name}
                        onChange={(e) => setNewGroupData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Group Description (optional)"
                        value={newGroupData.description}
                        onChange={(e) => setNewGroupData(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <select
                        value={newGroupData.groupType}
                        onChange={(e) => setNewGroupData(prev => ({ ...prev, groupType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="batch">Batch</option>
                        <option value="department">Department</option>
                        <option value="course">Course</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Group</option>
                      {groups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.name} ({group.groupType})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCreateGroupModal(true)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Create new group"
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  {createGroupWithBulk 
                    ? "A new group will be created and all users will be added to it"
                    : "All users from the Excel file will be added to the selected group"
                  }
                </p>
              </div>

              <button
                onClick={handleExcelUpload}
                disabled={!excelFile || uploading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiUsers className="w-4 h-4" />
                {uploading ? 'Creating Users...' : 'Create Users'}
              </button>
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Upload Successful!</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-800 font-medium">Total Created</p>
                    <p className="text-2xl font-bold text-green-900">{uploadResult.data.totalCreated}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-800 font-medium">Students: {uploadResult.data.summary.students}</p>
                    <p className="text-blue-800 font-medium">Coordinators: {uploadResult.data.summary.coordinators}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Creation Tab */}
        {activeTab === 'manual' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Single User Account</h3>
            
            <form onSubmit={handleManualCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter department"
                  />
                </div>

                {/* Student specific fields */}
                {formData.role === 'student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enrollment Number
                      </label>
                      <input
                        type="text"
                        name="enrollmentNumber"
                        value={formData.enrollmentNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter enrollment number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Semester
                      </label>
                      <input
                        type="text"
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter semester"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batch
                      </label>
                      <input
                        type="text"
                        name="batch"
                        value={formData.batch}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter batch year"
                      />
                    </div>
                  </>
                )}

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Group (Optional)
                </label>
                <div className="flex gap-2">
                  <select
                    name="groupId"
                    value={formData.groupId}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No Group</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name} ({group.groupType})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCreateGroupModal(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Create new group"
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Password Settings</h4>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="generatePassword"
                      checked={formData.generatePassword}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Auto-generate password</span>
                  </label>
                </div>

                {!formData.generatePassword && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!formData.generatePassword}
                      minLength={6}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}

                {formData.generatePassword && formData.password && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 mb-2">Generated Password:</p>
                    <code className="bg-yellow-100 px-2 py-1 rounded text-sm font-mono">
                      {formData.password}
                    </code>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiUserPlus className="w-4 h-4" />
                  {creating ? 'Creating User...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupModal(false)}
          onSuccess={(newGroup) => {
            setGroups(prev => [...prev, newGroup]);
            setSelectedGroupId(newGroup._id);
            setFormData(prev => ({ ...prev, groupId: newGroup._id }));
            setShowCreateGroupModal(false);
          }}
        />
      )}
    </div>
  );
};

// Simple Create Group Modal Component
const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [groupData, setGroupData] = useState({
    name: '',
    groupType: 'batch',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupData.name.trim()) {
      showToast.error('Group name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/groups', groupData);
      showToast.success('Group created successfully!');
      onSuccess(response.data.data);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Create New Group</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={groupData.name}
              onChange={(e) => setGroupData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2024 CE Batch"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Type
            </label>
            <select
              value={groupData.groupType}
              onChange={(e) => setGroupData(prev => ({ ...prev, groupType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="batch">Batch</option>
              <option value="department">Department</option>
              <option value="course">Course</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={groupData.description}
              onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the group..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkUserCreation;
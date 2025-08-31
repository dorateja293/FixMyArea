import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// API function to fetch all users
const fetchUsers = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get('http://localhost:5000/api/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// API function to update a user's status or role
const updateUserStatus = async ({ id, status, role }) => {
  const token = localStorage.getItem('token');
  const payload = {};
  if (status) payload.status = status;
  if (role) payload.role = role;

  const response = await axios.patch(`http://localhost:5000/api/users/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all users using React Query
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // Set up a mutation for updating a user
  const updateMutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      showToastMessage('User updated successfully!', 'success');
    },
    onError: (err) => {
      showToastMessage(err.response?.data?.message || 'Failed to update user.', 'error');
    },
  });

  const showToastMessage = (message, type = 'success') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.innerHTML = `
      <span class="icon icon-small">${type === 'success' ? '✅' : '❌'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Handler for the "Disable" and "Activate" buttons
  const handleUpdate = (id, newStatus) => {
    updateMutation.mutate({ id, status: newStatus });
  };

  // Filter users based on search and role
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-12 bg-neutral-200 rounded-lg mb-8"></div>
            <div className="h-16 bg-neutral-200 rounded-lg mb-6"></div>
            <div className="h-96 bg-neutral-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="text-danger-600 text-xl mb-4">Failed to load users</div>
          <button 
            onClick={() => queryClient.invalidateQueries(['users'])}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading text-primary-900">
                👑 Admin Dashboard
              </h1>
              <p className="text-neutral-600 mt-2">
                Manage users, monitor system, and oversee operations
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {users?.length || 0}
              </div>
              <div className="text-sm text-neutral-500">Total Users</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stats-card">
            <div className="stats-icon bg-primary-100 text-primary-600">
              👥
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {users?.filter(u => u.role === 'resident').length || 0}
              </div>
              <div className="stats-label">Residents</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-secondary-100 text-secondary-600">
              👷
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {users?.filter(u => u.role === 'staff').length || 0}
              </div>
              <div className="stats-label">Staff Members</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-accent-100 text-accent-600">
              👑
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {users?.filter(u => u.role === 'admin').length || 0}
              </div>
              <div className="stats-label">Administrators</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-success-100 text-success-600">
              ✅
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {users?.filter(u => u.status === 'active').length || 0}
              </div>
              <div className="stats-label">Active Users</div>
            </div>
          </div>
        </div>

        {/* User Management Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white font-heading">
              👥 User Management
            </h2>
            <p className="text-primary-100 mt-1">
              Monitor and manage all system users
            </p>
          </div>
          
          <div className="p-8">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-12 pr-4 w-full"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-primary-500">🔍</span>
                  </div>
                </div>
              </div>
              
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="form-select min-w-[150px]"
              >
                <option value="all">All Roles</option>
                <option value="resident">Residents</option>
                <option value="staff">Staff</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Users Table */}
        <div className="overflow-x-auto">
              <table className="table-enhanced w-full">
            <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Phone</th>
                    <th className="table-header">Role</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Location</th>
                    <th className="table-header">Actions</th>
              </tr>
            </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">{user.name}</div>
                            <div className="text-sm text-neutral-500">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="font-mono text-sm">{user.phone}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'admin' ? '👑' : user.role === 'staff' ? '👷' : '🏠'}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          user.status === 'active' 
                            ? 'bg-success-100 text-success-800 border border-success-200' 
                            : 'bg-danger-100 text-danger-800 border border-danger-200'
                        }`}>
                          {user.status === 'active' ? '✅' : '❌'}
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                      <td className="table-cell">
                        <div className="text-sm text-neutral-600">
                          {user.location?.village && (
                            <div>{user.location.village}</div>
                          )}
                          {user.location?.district && (
                            <div className="text-xs text-neutral-500">{user.location.district}</div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleUpdate(user._id, 'disabled')}
                              className="btn btn-danger btn-sm"
                        disabled={updateMutation.isLoading}
                      >
                              🚫 Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdate(user._id, 'active')}
                              className="btn btn-success btn-sm"
                        disabled={updateMutation.isLoading}
                      >
                              ✅ Activate
                      </button>
                    )}
                        </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                  No users found
                </h3>
                <p className="text-neutral-500">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
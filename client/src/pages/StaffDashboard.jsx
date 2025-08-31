import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const fetchStaffComplaints = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
  const response = await axios.get('http://localhost:5000/api/complaints/assigned', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
};

const StaffDashboard = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { data: complaints, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['staffComplaints'],
    queryFn: fetchStaffComplaints,
    retry: 2,
    retryDelay: 1000,
  });

  const updateComplaintMutation = useMutation({
    mutationFn: ({ id, status }) => {
      const token = localStorage.getItem('token');
      return axios.patch(`http://localhost:5000/api/complaints/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['staffComplaints']);
      showToastMessage('Complaint status updated successfully!', 'success');
      
      // Update local state immediately for better UX
      queryClient.setQueryData(['staffComplaints'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(complaint => 
          complaint._id === variables.id 
            ? { ...complaint, status: variables.status }
            : complaint
        );
      });
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to update complaint status.';
      showToastMessage(message, 'error');
    },
  });

  const handleUpdateStatus = (id, newStatus) => {
    updateComplaintMutation.mutate({ id, status: newStatus });
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': {
        className: 'badge badge-pending',
        icon: '⏳',
        color: 'text-accent-700'
      },
      'In Progress': {
        className: 'badge badge-progress',
        icon: '🔄',
        color: 'text-primary-700'
      },
      'Resolved': {
        className: 'badge badge-resolved',
        icon: '✅',
        color: 'text-secondary-700'
      }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    
    return (
      <span className={config.className} role="status" aria-label={`Status: ${status}`}>
        <span className="icon icon-small">{config.icon}</span>
        <span className={config.color}>{status}</span>
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Garbage': '🗑️',
      'Water': '💧',
      'Road': '🛣️',
      'Electricity': '⚡',
      'StrayDog': '🐕'
    };
    return icons[category] || '📋';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'text-neutral-600',
      'Medium': 'text-accent-600',
      'High': 'text-danger-600',
      'Critical': 'text-danger-700'
    };
    return colors[priority] || 'text-neutral-600';
  };

  // Filter and sort complaints
  const filteredComplaints = React.useMemo(() => {
    if (!complaints) return [];
    
    let filtered = complaints.filter(complaint => {
      const matchesSearch = complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           complaint.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort complaints
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'status':
          const statusOrder = { 'Pending': 1, 'In Progress': 2, 'Resolved': 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    return filtered;
  }, [complaints, searchTerm, statusFilter, sortBy]);

  const pendingCount = complaints?.filter(c => c.status === 'Pending').length || 0;
  const inProgressCount = complaints?.filter(c => c.status === 'In Progress').length || 0;
  const resolvedCount = complaints?.filter(c => c.status === 'Resolved').length || 0;
  const totalCount = complaints?.length || 0;

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch, isLoading]);

  if (isLoading) return (
    <div className="app-container">
      <div className="container">
        <div className="section text-center">
          <div className="loading-spinner large mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-primary mb-4">Loading Dashboard</h2>
          <p className="text-neutral text-lg">Fetching your assigned complaints...</p>
          
          {/* Loading skeleton */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="grid-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
                  <div className="card-body">
                    <div className="skeleton title"></div>
                    <div className="skeleton text"></div>
                    <div className="skeleton text"></div>
                    <div className="skeleton text"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isError) return (
    <div className="app-container">
      <div className="container">
        <div className="section text-center">
          <div className="icon icon-large text-danger mb-6">⚠️</div>
          <h2 className="text-2xl font-semibold text-danger mb-4">Failed to Load Dashboard</h2>
          <p className="text-neutral text-lg mb-6">
            {error?.message || 'An error occurred while loading your complaints.'}
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => refetch()} 
              className="btn btn-primary"
            >
              🔄 Try Again
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-secondary"
            >
              🔃 Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <nav className="navbar">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold" aria-label="FixMyArea Logo">🏠</span>
              </div>
              <h1 className="text-2xl font-bold text-primary">FixMyArea</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="nav-link">Welcome, Staff Member</span>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content">
        <div className="container">
          {/* Page Header */}
          <div className="section">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-primary mb-4">🛠️ Staff Dashboard</h1>
              <p className="text-neutral text-lg">
                Manage and track assigned complaints efficiently
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid-4 mb-12">
              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent text-sm font-medium">Pending</p>
                    <p className="stats-number">{pendingCount}</p>
                  </div>
                  <div className="icon icon-large">⏳</div>
                </div>
              </div>

              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary text-sm font-medium">In Progress</p>
                    <p className="stats-number">{inProgressCount}</p>
                  </div>
                  <div className="icon icon-large">🔄</div>
                </div>
              </div>

              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary text-sm font-medium">Resolved</p>
                    <p className="stats-number">{resolvedCount}</p>
                  </div>
                  <div className="icon icon-large">✅</div>
                </div>
              </div>

              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral text-sm font-medium">Total</p>
                    <p className="stats-number">{totalCount}</p>
                  </div>
                  <div className="icon icon-large">📊</div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="card mb-8">
              <div className="card-body">
                <div className="grid-3 gap-6">
                  {/* Search */}
                  <div className="form-group">
                    <label htmlFor="search" className="form-label">🔍 Search Complaints</label>
                    <input
                      id="search"
                      type="text"
                      placeholder="Search by description or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="form-group">
                    <label htmlFor="status-filter" className="form-label">📊 Filter by Status</label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="form-select"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="form-group">
                    <label htmlFor="sort-by" className="form-label">🔄 Sort By</label>
                    <select
                      id="sort-by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="form-select"
                    >
                      <option value="date">Date (Newest First)</option>
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaints Section */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">📋 Assigned Complaints</h2>
                  <div className="text-sm text-white/80">
                    {filteredComplaints.length} of {totalCount} complaints
                  </div>
                </div>
              </div>

              <div className="card-body">
                {filteredComplaints.length > 0 ? (
                  <div className="grid-1">
                    {filteredComplaints.map((complaint) => (
                      <div 
                        key={complaint._id} 
                        className="card hover:transform hover:scale-105 transition-all duration-300 card-interactive"
                        tabIndex="0"
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            // Could open complaint details modal here
                          }
                        }}
                      >
                        <div className="card-body">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="icon icon-large">{getCategoryIcon(complaint.category)}</div>
                              <div>
                                <h3 className="text-lg font-semibold text-neutral-800">
                                  {complaint.category}
                                </h3>
                                <p className="text-sm text-neutral-500">
                                  ID: {complaint._id.substring(0, 8)}...
                                </p>
                                {complaint.priority && (
                                  <span className={`text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                                    Priority: {complaint.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                            {getStatusBadge(complaint.status)}
                          </div>

                          <p className="text-neutral-700 mb-4 leading-relaxed text-clamp-2">
                            {complaint.description.length > 150 
                              ? `${complaint.description.substring(0, 150)}...` 
                              : complaint.description
                            }
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-neutral-500">
                              📍 Location coordinates available
                              {complaint.createdAt && (
                                <span className="ml-4">
                                  📅 {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                    {complaint.status === 'Pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(complaint._id, 'In Progress')}
                                  className="btn btn-primary"
                        disabled={updateComplaintMutation.isLoading}
                                  aria-label={`Start work on ${complaint.category} complaint`}
                                >
                                  {updateComplaintMutation.isLoading ? (
                                    <>
                                      <div className="loading-spinner small"></div>
                                      Starting...
                                    </>
                                  ) : (
                                    <>
                                      🚀 Start Work
                                    </>
                                  )}
                      </button>
                    )}
                    {complaint.status === 'In Progress' && (
                      <button 
                        onClick={() => handleUpdateStatus(complaint._id, 'Resolved')}
                                  className="btn btn-success"
                        disabled={updateComplaintMutation.isLoading}
                                  aria-label={`Mark ${complaint.category} complaint as resolved`}
                                >
                                  {updateComplaintMutation.isLoading ? (
                                    <>
                                      <div className="loading-spinner small"></div>
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      ✅ Mark Resolved
                                    </>
                                  )}
                      </button>
                    )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="icon icon-large mb-4">🎉</div>
                    <h3 className="text-xl font-semibold text-neutral-600 mb-2">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No complaints match your filters' 
                        : 'No complaints assigned to you'
                      }
                    </h3>
                    <p className="text-neutral-500 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search terms or filters.'
                        : 'Great job! All your assigned complaints have been resolved.'
                      }
                    </p>
                    {(searchTerm || statusFilter !== 'all') && (
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                        className="btn btn-secondary"
                      >
                        🔄 Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
      </div>
        </div>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className={`toast ${toastType} show`} role="alert" aria-live="polite">
          <span className="icon icon-small">
            {toastType === 'success' ? '✅' : toastType === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span>{toastMessage}</span>
          <button 
            onClick={() => setShowToast(false)}
            className="ml-4 text-neutral-500 hover:text-neutral-700"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
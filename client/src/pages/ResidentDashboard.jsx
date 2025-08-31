import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';

const ResidentDashboard = () => {
  const { user, token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Debug logging
  useEffect(() => {
    console.log('🔍 Dashboard mounted with:', {
      user: user ? { id: user._id, name: user.name, role: user.role } : null,
      hasToken: !!token,
      isAuthenticated
    });
  }, [user, token, isAuthenticated]);

  // Fetch user's complaints with proper authentication
  const { data: complaints, isLoading, isError, error } = useQuery({
    queryKey: ['userComplaints'],
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token available');
      }

      if (!user) {
        throw new Error('No user data available');
      }

      console.log('🔍 Fetching user complaints for:', {
        userId: user._id,
        userName: user.name,
        hasToken: !!token
      });

      try {
        const response = await axios.get('http://localhost:5000/api/complaints/my-complaints', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('✅ Complaints fetched successfully:', {
          count: response.data?.length || 0,
          data: response.data,
          status: response.status
        });

        return response.data;
      } catch (error) {
        console.error('🚨 Error in complaints fetch:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
        throw error;
      }
    },
    enabled: !!token && !!user, // Only run query when we have token and user
    retry: 2, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 30000, // Data is fresh for 30 seconds
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-warning-100 text-warning-800 border-warning-200', icon: '⏳' },
      'In Progress': { color: 'bg-info-100 text-info-800 border-info-200', icon: '🔄' },
      'Resolved': { color: 'bg-success-100 text-success-800 border-success-200', icon: '✅' },
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <span>{config.icon}</span>
        {status}
      </span>
    );
  };

  // Handle retry with better error logging
  const handleRetry = () => {
    console.log('🔄 Retrying complaints fetch...');
    queryClient.invalidateQueries(['userComplaints']);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Navigation />
        <div className="p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="animate-pulse">
              <div className="h-12 bg-neutral-200 rounded-lg mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-neutral-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('🚨 Dashboard error:', error);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Navigation />
        <div className="p-6">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-danger-600 text-xl mb-4">Failed to load dashboard</div>
            <div className="text-neutral-600 mb-6 max-w-md mx-auto">
              {error?.response?.status === 401 ? (
                'Authentication failed. Please log in again.'
              ) : error?.response?.status === 404 ? (
                'No complaints found for your account.'
              ) : error?.response?.status === 500 ? (
                'Server error. Please try again later.'
              ) : error?.message ? (
                error.message
              ) : (
                'Unable to load your complaints. Please try again.'
              )}
            </div>
            <div className="bg-neutral-100 p-4 rounded-lg mb-6 max-w-lg mx-auto text-left">
              <div className="text-sm font-medium text-neutral-700 mb-2">Debug Info:</div>
              <div className="text-xs text-neutral-600 space-y-1">
                <div>Status: {error?.response?.status || 'Unknown'}</div>
                <div>Message: {error?.message || 'No message'}</div>
                <div>User: {user ? `${user.name} (${user.role})` : 'Not loaded'}</div>
                <div>Token: {token ? 'Present' : 'Missing'}</div>
              </div>
            </div>
            <div className="space-y-3">
              <button 
                onClick={handleRetry}
                className="btn btn-primary px-6 py-3"
              >
                🔄 Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-secondary px-6 py-3 ml-3"
              >
                🔃 Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navigation />
      
      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-primary-900 mb-2">
            Welcome back, {user?.name}! 🏠
          </h1>
          <p className="text-neutral-600 text-lg">
            Manage your complaints and track their progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stats-card">
            <div className="stats-icon bg-primary-100 text-primary-600">
              📊
            </div>
            <div className="stats-content">
              <div className="stats-number">{complaints?.length || 0}</div>
              <div className="stats-label">Total Complaints</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-warning-100 text-warning-600">
              ⏳
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {complaints?.filter(c => c.status === 'Pending').length || 0}
              </div>
              <div className="stats-label">Pending</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-info-100 text-info-600">
              🔄
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {complaints?.filter(c => c.status === 'In Progress').length || 0}
              </div>
              <div className="stats-label">In Progress</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-success-100 text-success-600">
              ✅
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {complaints?.filter(c => c.status === 'Resolved').length || 0}
              </div>
              <div className="stats-label">Resolved</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-8">
          <Link 
            to="/resident/complaints/new"
            className="btn btn-primary px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform duration-200"
          >
            📝 Submit New Complaint
          </Link>
        </div>

        {/* Complaints List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white font-heading">
              📋 Your Complaints
            </h2>
            <p className="text-primary-100 mt-1">
              Track the status of all your submitted complaints
            </p>
          </div>
          
          <div className="p-8">
            {!complaints || complaints.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                  No complaints yet
                </h3>
                <p className="text-neutral-500 mb-6">
                  Start by submitting your first complaint about an issue in your area
                </p>
                <Link 
                  to="/resident/complaints/new"
                  className="btn btn-primary px-8 py-3 text-lg font-semibold"
                >
                  Submit First Complaint
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="card card-interactive">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-neutral-900">
                            {complaint.category}
                          </h3>
                          {getStatusBadge(complaint.status)}
                        </div>
                        <p className="text-neutral-600 mb-3 text-clamp-2">
                          {complaint.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <span>📍 {complaint.location.address || 'Location marked on map'}</span>
                          <span>📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
                          {complaint.assignedTo && (
                            <span>👷 Assigned to staff</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {complaint.images?.length > 0 && (
                          <span className="text-sm text-neutral-500">
                            📷 {complaint.images.length} image(s)
                          </span>
                        )}
                        <span className="text-sm text-neutral-500">
                          👍 {complaint.upvotes || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
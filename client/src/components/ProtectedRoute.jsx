import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [], requireActive = true }) => {
  const { user, loading, isAuthenticated, hasRole, isActive } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is active (if required)
  if (requireActive && !isActive()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-danger-600 mb-4">Account Disabled</h2>
          <p className="text-neutral-600 mb-6">
            Your account has been disabled. Please contact the administrator for assistance.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-warning-600 mb-4">Access Denied</h2>
          <p className="text-neutral-600 mb-4">
            You don't have permission to view this page.
          </p>
          <p className="text-sm text-neutral-500 mb-6">
            Required role: {allowedRoles.join(' or ')}
            <br />
            Your role: {user?.role}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary w-full"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-primary w-full"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
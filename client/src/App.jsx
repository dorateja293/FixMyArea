import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import ResidentDashboard from './pages/ResidentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintForm from './pages/ComplaintForm';
import AnalyticsPage from './pages/AnalyticsPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleSelectionPage from './pages/RoleSelectionPage';
import ProfilePage from './pages/ProfilePage';
import DogManagementPage from './pages/DogManagementPage';

function App() {
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/role-selection" element={<RoleSelectionPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Role-based Auth Routes */}
      <Route path="/auth/resident" element={<RegisterPage role="resident" />} />
      <Route path="/auth/staff" element={<RegisterPage role="staff" />} />

      {/* Protected Routes - Resident */}
      <Route
        path="/resident/dashboard"
        element={
          <ProtectedRoute allowedRoles={['resident', 'staff', 'admin']}>
            <ResidentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/complaints/new"
        element={
          <ProtectedRoute allowedRoles={['resident']}>
            <ComplaintForm />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Staff */}
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dogs"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <DogManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - All Users */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Fallback route - redirect to homepage */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
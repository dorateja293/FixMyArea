import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout, hasRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const getNavigationLinks = () => {
    if (!user) return [];

    const links = [];
    
    // Dashboard links based on role
    if (hasRole(['resident', 'staff', 'admin'])) {
      links.push({
        to: '/resident/dashboard',
        label: '🏠 Dashboard',
        icon: '🏠'
      });
    }

    if (hasRole(['resident'])) {
      links.push({
        to: '/resident/complaints/new',
        label: '📝 New Complaint',
        icon: '📝'
      });
    }

    if (hasRole(['staff', 'admin'])) {
      links.push({
        to: '/staff/dashboard',
        label: '👷 Staff Dashboard',
        icon: '👷'
      });
    }

    if (hasRole(['admin'])) {
      links.push({
        to: '/admin/dashboard',
        label: '👑 Admin Dashboard',
        icon: '👑'
      });
      links.push({
        to: '/admin/analytics',
        label: '📊 Analytics',
        icon: '📊'
      });
    }

    // Dog management for staff and admin
    if (hasRole(['staff', 'admin'])) {
      links.push({
        to: '/admin/dogs',
        label: '🐕 Dog Records',
        icon: '🐕'
      });
    }

    return links;
  };

  if (!user) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🏠</span>
              </div>
              <span className="text-xl font-bold text-primary-900 hidden sm:block">
                FixMyArea
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {getNavigationLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-neutral-900">
                  {user.name}
                </div>
                <div className="text-xs text-neutral-500 capitalize">
                  {user.role}
                </div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                title="Profile"
              >
                👤
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-neutral-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all duration-200"
                title="Logout"
              >
                🚪
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-primary-600 rounded-lg"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <div className="space-y-2">
              {getNavigationLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {/* Profile link in mobile menu */}
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
              >
                <span>👤</span>
                <span>Profile</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

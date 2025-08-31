import React from 'react';
import { Link } from 'react-router-dom';

const RoleSelectionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-4xl font-bold font-heading text-primary-900 mb-4">
            Welcome to FixMyArea
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Choose your account type to get started with managing area issues and stray dog complaints
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Resident Card */}
          <div className="group">
            <Link to="/auth/resident" className="block">
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 group-hover:border-primary-200">
                <div className="text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  🏠
                </div>
                <h2 className="text-2xl font-bold text-primary-900 mb-4">
                  Resident
                </h2>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Report issues in your area, track complaint progress, and stay updated on local developments
                </p>
                <div className="space-y-3 text-sm text-neutral-500">
                  <div className="flex items-center justify-center gap-2">
                    <span>📝</span>
                    <span>Submit complaints</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>📊</span>
                    <span>Track progress</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>👍</span>
                    <span>Upvote issues</span>
                  </div>
                </div>
                <div className="mt-6 text-primary-600 font-semibold group-hover:text-primary-700 transition-colors">
                  Continue as Resident →
                </div>
              </div>
            </Link>
          </div>

          {/* Staff/Admin Card */}
          <div className="group">
            <Link to="/auth/staff" className="block">
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 group-hover:border-primary-200">
                <div className="text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  👷
                </div>
                <h2 className="text-2xl font-bold text-primary-900 mb-4">
                  Staff & Admin
                </h2>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Handle complaints, manage dog records, update statuses, and oversee operations
                </p>
                <div className="space-y-3 text-sm text-neutral-500">
                  <div className="flex items-center justify-center gap-2">
                    <span>🔧</span>
                    <span>Resolve complaints</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>🐕</span>
                    <span>Manage dog records</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>📈</span>
                    <span>Generate reports</span>
                  </div>
                </div>
                <div className="mt-6 text-primary-600 font-semibold group-hover:text-primary-700 transition-colors">
                  Continue as Staff/Admin →
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-neutral-500 mb-4">
            Already have an account? 
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium ml-1">
              Sign in here
            </Link>
          </p>
          <Link to="/" className="text-neutral-500 hover:text-neutral-700 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

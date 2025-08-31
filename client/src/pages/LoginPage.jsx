import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateField, getFieldError, hasFieldError } from '../utils/validation';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: null }));
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate phone
    const phoneErrors = validateField('phone', formData.phone, 'phone');
    if (phoneErrors.length > 0) newErrors.phone = phoneErrors[0];

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('🔑 Attempting login with phone:', formData.phone);
    
    const result = await login(formData.phone, formData.password);
    
    if (result.success) {
      console.log('✅ Login successful');
      } else {
      console.log('❌ Login failed:', result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
      <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-6 shadow-lg animate-fade-in">
              <span className="text-white text-3xl font-bold">🏠</span>
            </div>
            <h1 className="text-4xl font-bold font-heading text-primary-900 mb-3 animate-fade-in-up">
              Welcome Back
            </h1>
            <p className="text-neutral-600 text-lg animate-fade-in-up animation-delay-100">
              Sign in to your FixMyArea account
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in-up animation-delay-200">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-transparent"></div>
              <div className="relative">
                <h2 className="text-2xl font-semibold text-white font-heading mb-2">
                  Sign In
                </h2>
                <p className="text-primary-100 text-sm">
                  Access your community dashboard
                </p>
              </div>
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="p-8 space-y-6">
              {/* Phone Number Input */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
              <input 
                id="phone" 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={`form-input ${hasFieldError(errors, 'phone') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                required 
                  disabled={loading}
              />
                {hasFieldError(errors, 'phone') && (
                  <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'phone')}</p>
                )}
            </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
              <input 
                id="password" 
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`form-input pr-12 ${hasFieldError(errors, 'password') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                required 
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {hasFieldError(errors, 'password') && (
                  <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'password')}</p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-danger-500 text-xl">❌</div>
                    <div>
                      <h3 className="text-danger-800 font-semibold">Login Failed</h3>
                      <p className="text-danger-600 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">New to FixMyArea?</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <Link 
                  to="/role-selection" 
                  className="btn btn-secondary w-full"
                >
                  Create Account
                </Link>
            </div>
          </form>

            {/* Footer */}
            <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-200">
              <p className="text-center text-neutral-600 text-sm">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-primary-600 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span>🏠</span>
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
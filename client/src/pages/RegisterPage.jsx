import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LocationService from '../services/locationService';
import { validateField, getFieldError, hasFieldError } from '../utils/validation';
import OTPVerification from '../components/OTPVerification';

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  
  // Get role from URL params or default to resident
  const urlParams = new URLSearchParams(location.search);
  const defaultRole = urlParams.get('role') || 'resident';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: defaultRole,
    password: '',
    confirmPassword: '',
    gender: '',
    dob: '',
    location: {
      state: null,
      district: null,
      village: null
    }
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Location data
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Load states on component mount
  useEffect(() => {
    loadStates();
  }, []);

  // Load districts when state changes
  useEffect(() => {
    if (formData.location.state?.id) {
      loadDistricts(formData.location.state.id);
    } else {
      setDistricts([]);
      setVillages([]);
    }
  }, [formData.location.state]);

  // Load villages when district changes
  useEffect(() => {
    if (formData.location.district?.id) {
      loadVillages(formData.location.district.id);
    } else {
      setVillages([]);
    }
  }, [formData.location.district]);

  const loadStates = async () => {
    try {
      setLoadingLocations(true);
      const statesData = await LocationService.getStates();
      setStates(statesData);
    } catch (error) {
      console.error('Error loading states:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadDistricts = async (stateId) => {
    try {
      setLoadingLocations(true);
      const districtsData = await LocationService.getDistricts(stateId);
      setDistricts(districtsData);
      // Reset district and village selection
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          district: null,
          village: null
        }
      }));
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadVillages = async (districtId) => {
    try {
      setLoadingLocations(true);
      console.log(`🌍 Loading villages for district ID: ${districtId}`);
      const villagesData = await LocationService.getVillages(districtId);
      console.log(`✅ Villages loaded:`, villagesData);
      setVillages(villagesData);
      // Reset village selection
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          village: null
        }
      }));
    } catch (error) {
      console.error('🚨 Error loading villages:', error);
      setVillages([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: null }));

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationChange = (type, value) => {
    setErrors(prev => ({ ...prev, [`location.${type}`]: null }));
    
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [type]: value
      }
    }));
  };

  const validateStep = (step) => {
    console.log('🔍 Validating step:', step);
    console.log('📱 Form data for validation:', formData);
    
    const newErrors = {};

    if (step === 1) {
      // Validate personal information
      const nameErrors = validateField('name', formData.name, 'name');
      if (nameErrors.length > 0) newErrors.name = nameErrors[0];

      const phoneErrors = validateField('phone', formData.phone, 'phone');
      if (phoneErrors.length > 0) newErrors.phone = phoneErrors[0];

      const emailErrors = validateField('email', formData.email, 'email');
      if (emailErrors.length > 0) newErrors.email = emailErrors[0];

      const passwordErrors = validateField('password', formData.password, 'password');
      if (passwordErrors.length > 0) newErrors.password = passwordErrors[0];

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.role) {
        newErrors.role = 'Please select a role';
      }
    } else if (step === 2) {
      // Validate location
      console.log('📍 Validating location...');
      console.log('📍 State:', formData.location.state);
      console.log('📍 District:', formData.location.district);
      console.log('📍 Village:', formData.location.village);
      
      if (!formData.location.state) {
        newErrors['location.state'] = 'Please select a state';
        console.log('❌ State validation failed');
      }
      if (!formData.location.district) {
        newErrors['location.district'] = 'Please select a district';
        console.log('❌ District validation failed');
      }
      if (!formData.location.village) {
        newErrors['location.village'] = 'Please select a village';
        console.log('❌ Village validation failed');
      }
    }

    console.log('❌ Validation errors:', newErrors);
    console.log('✅ Validation result:', Object.keys(newErrors).length === 0);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    console.log('➡️ nextStep called for step:', currentStep);
    const isValid = validateStep(currentStep);
    console.log('✅ Step validation result:', isValid);
    
    if (isValid) {
      if (currentStep === 2) {
        console.log('📱 Step 2 validated, calling sendOTP...');
        // Send OTP before moving to step 3
        sendOTP();
      } else {
        console.log('➡️ Moving to next step...');
        setCurrentStep(currentStep + 1);
      }
    } else {
      console.log('❌ Step validation failed, not proceeding');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const sendOTP = async () => {
    try {
      console.log('🚀 Starting OTP send process...');
      console.log('🔍 Current step:', currentStep);
      console.log('📱 Phone:', formData.phone);
      console.log('📧 Email:', formData.email);
      console.log('📍 Location:', formData.location);
      
      // Validate required fields
      if (!formData.phone || !formData.phone.trim()) {
        console.log('❌ Phone number is required');
        setErrors({ phone: 'Phone number is required' });
        return;
      }
      
      if (!formData.location.state || !formData.location.district || !formData.location.village) {
        console.log('❌ Location is required');
        setErrors({ location: 'Please complete location selection' });
        return;
      }
      
      console.log('✅ Validation passed, proceeding with OTP send...');
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('🌐 API URL:', apiUrl);
      
      setOtpLoading(true);
      
      const requestBody = {
        phone: formData.phone.replace(/\s/g, ''),
        email: formData.email || undefined
      };
      
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`${apiUrl}/otp/send-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);

      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success) {
        setOtpSent(true);
        setCurrentStep(3);
        console.log('✅ OTP sent successfully');
      } else {
        setErrors({ otp: data.message });
        console.log('❌ OTP send failed:', data.message);
      }
    } catch (error) {
      console.error('🚨 Error sending OTP:', error);
      setErrors({ otp: 'Failed to send OTP. Please try again.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    try {
      console.log('🔍 Starting OTP verification...');
      console.log('📱 Phone:', formData.phone);
      console.log('📧 Email:', formData.email);
      console.log('🔢 OTP to verify:', otp);
      
      setOtpLoading(true);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('🌐 API URL for verification:', apiUrl);
      
      const requestBody = {
        phone: formData.phone.replace(/\s/g, ''),
        email: formData.email || undefined,
        otp,
        type: 'registration'
      };
      
      console.log('📤 Verification request body:', requestBody);
      
      // Verify OTP first
      const verifyResponse = await fetch(`${apiUrl}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Verification response status:', verifyResponse.status);
      console.log('📥 Verification response headers:', verifyResponse.headers);

      const verifyData = await verifyResponse.json();
      console.log('📥 Verification response data:', verifyData);
      
      if (!verifyData.success) {
        console.log('❌ OTP verification failed:', verifyData.message);
        setErrors({ otp: verifyData.message });
        return;
      }

      console.log('✅ OTP verified successfully, proceeding with registration...');
      
      // If OTP is verified, proceed with registration
      await handleRegistration();
      
    } catch (error) {
      console.error('🚨 Error verifying OTP:', error);
      setErrors({ otp: 'Failed to verify OTP. Please try again.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPResend = async () => {
    await sendOTP();
  };

  const testButton = () => {
    console.log('🧪 Test button clicked!');
    console.log('📱 Form data:', formData);
    console.log('🔍 Current step:', currentStep);
  };

  const handleRegistration = async () => {
    // Prepare data for API
    const userData = {
      name: formData.name.trim(),
      phone: formData.phone.replace(/\s/g, ''),
      email: formData.email || undefined,
      role: formData.role,
      password: formData.password,
      gender: formData.gender || undefined,
      dob: formData.dob || undefined,
      location: {
        state: formData.location.state.name,
        district: formData.location.district.name,
        village: formData.location.village.name
      }
    };

    console.log('📝 Submitting registration data:', userData);
    
    // Note: The OTP verification is already done in handleOTPVerify
    // The backend should not require OTP again for registration
    // Let me check if we need to modify the backend or frontend
    
    const result = await register(userData);
    
    if (result.success) {
      console.log('✅ Registration successful');
    } else {
      console.log('❌ Registration failed:', result.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === 2) {
      // Send OTP instead of submitting directly
      await sendOTP();
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
        <div className="w-full max-w-2xl">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-6 shadow-lg animate-fade-in">
              <span className="text-white text-3xl font-bold">🏠</span>
            </div>
            <h1 className="text-4xl font-bold font-heading text-primary-900 mb-3 animate-fade-in-up">
              Join FixMyArea
            </h1>
            <p className="text-neutral-600 text-lg animate-fade-in-up animation-delay-100">
              Create your account and start making a difference
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 animate-fade-in-up animation-delay-200">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-lg">
              <div className="flex items-center justify-between text-sm text-neutral-600 mb-2 px-2">
                <span>Step {currentStep} of 3</span>
                <span>
                  {currentStep === 1 && 'Personal Info'}
                  {currentStep === 2 && 'Location'}
                  {currentStep === 3 && 'OTP Verification'}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Registration Form Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in-up animation-delay-300">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-transparent"></div>
              <div className="relative">
                <h2 className="text-2xl font-semibold text-white font-heading mb-2">
                  {currentStep === 1 && 'Personal Information'}
                  {currentStep === 2 && 'Location Details'}
                  {currentStep === 3 && 'OTP Verification'}
                </h2>
                <p className="text-primary-100 text-sm">
                  {currentStep === 1 && 'Tell us about yourself'}
                  {currentStep === 2 && 'Where are you located?'}
                  {currentStep === 3 && 'Verify your phone number'}
                </p>
              </div>
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              {currentStep === 1 && (
                /* Step 1: Personal Information */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Input */}
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">
                        Full Name *
                      </label>
          <input
                        id="name"
            type="text"
            name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`form-input ${hasFieldError(errors, 'name') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            required
                        disabled={loading}
          />
                      {hasFieldError(errors, 'name') && (
                        <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'name')}</p>
                      )}
        </div>

                    {/* Phone Input */}
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Phone Number *
                      </label>
          <input
                        id="phone"
                        type="tel"
            name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit phone number"
                        className={`form-input ${hasFieldError(errors, 'phone') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            required
                        disabled={loading}
                      />
                      {hasFieldError(errors, 'phone') && (
                        <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'phone')}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address (optional)"
                      className={`form-input ${hasFieldError(errors, 'email') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                      disabled={loading}
                    />
                    {hasFieldError(errors, 'email') && (
                      <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'email')}</p>
                    )}
                    <p className="text-neutral-500 text-sm mt-1">
                      Email is optional but recommended for OTP delivery
                    </p>
                  </div>

                  {/* Role Selection */}
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['resident', 'staff', 'admin'].map((role) => (
                        <label key={role} className="relative">
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={formData.role === role}
            onChange={handleChange}
                            className="sr-only"
                            disabled={loading}
                          />
                          <div className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            formData.role === role
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-neutral-200 hover:border-primary-300'
                          }`}>
                            <div className="text-center">
                              <div className="text-2xl mb-2">
                                {role === 'resident' && '🏠'}
                                {role === 'staff' && '👷'}
                                {role === 'admin' && '👨‍💼'}
                              </div>
                              <div className="font-semibold capitalize">{role}</div>
                              <div className="text-xs text-neutral-500 mt-1">
                                {role === 'resident' && 'Report issues'}
                                {role === 'staff' && 'Handle complaints'}
                                {role === 'admin' && 'Manage system'}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {hasFieldError(errors, 'role') && (
                      <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'role')}</p>
                    )}
        </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Password Input */}
                    <div className="form-group">
                      <label htmlFor="password" className="form-label">
                        Password *
                      </label>
                      <div className="relative">
          <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
            name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a strong password"
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

                    {/* Confirm Password Input */}
                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
            onChange={handleChange}
                          placeholder="Confirm your password"
                          className={`form-input pr-12 ${hasFieldError(errors, 'confirmPassword') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      {hasFieldError(errors, 'confirmPassword') && (
                        <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'confirmPassword')}</p>
                      )}
                    </div>
        </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gender Selection */}
                    <div className="form-group">
                      <label htmlFor="gender" className="form-label">
                        Gender
                      </label>
          <select
                        id="gender"
            name="gender"
                        value={formData.gender}
            onChange={handleChange}
                        className="form-input"
                        disabled={loading}
          >
                        <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

                    {/* Date of Birth */}
                    <div className="form-group">
                      <label htmlFor="dob" className="form-label">
                        Date of Birth
                      </label>
          <input
                        id="dob"
            type="date"
            name="dob"
                        value={formData.dob}
            onChange={handleChange}
                        className="form-input"
                        disabled={loading}
          />
        </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-end pt-6">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                /* Step 2: Location Information */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* State Selection */}
                    <div className="form-group">
                      <label htmlFor="state" className="form-label">
                        State *
                      </label>
                      <select
                        id="state"
                        value={formData.location.state?.id || ''}
                        onChange={(e) => {
                          const selectedState = states.find(s => s.id === parseInt(e.target.value));
                          handleLocationChange('state', selectedState);
                        }}
                        className={`form-input ${hasFieldError(errors, 'location.state') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                        disabled={loading || loadingLocations}
                      >
            <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
            ))}
          </select>
                      {hasFieldError(errors, 'location.state') && (
                        <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'location.state')}</p>
                      )}
        </div>

                    {/* District Selection */}
                    <div className="form-group">
                      <label htmlFor="district" className="form-label">
                        District *
                      </label>
                      <select
                        id="district"
                        value={formData.location.district?.id || ''}
                        onChange={(e) => {
                          const selectedDistrict = districts.find(d => d.id === parseInt(e.target.value));
                          handleLocationChange('district', selectedDistrict);
                        }}
                        className={`form-input ${hasFieldError(errors, 'location.district') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                        disabled={loading || loadingLocations || !formData.location.state}
                      >
              <option value="">Select District</option>
                        {districts.map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
              ))}
            </select>
                      {hasFieldError(errors, 'location.district') && (
                        <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'location.district')}</p>
                      )}
          </div>

                    {/* Village Selection */}
                    <div className="form-group">
                      <label htmlFor="village" className="form-label">
                        Village *
                      </label>
                      <select
                        id="village"
                        value={formData.location.village?.id || ''}
                        onChange={(e) => {
                          const selectedVillage = villages.find(v => v.id === parseInt(e.target.value));
                          handleLocationChange('village', selectedVillage);
                        }}
                        className={`form-input ${hasFieldError(errors, 'location.village') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                        disabled={loading || loadingLocations || !formData.location.district}
                      >
              <option value="">Select Village</option>
                        {villages.map((village) => (
                          <option key={village.id} value={village.id}>
                            {village.name}
                          </option>
              ))}
            </select>
                      {hasFieldError(errors, 'location.village') && (
                        <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'location.village')}</p>
                      )}
                    </div>
          </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      Previous Step
                    </button>
          <button
                      type="button"
                      onClick={() => {
                        console.log('🧪 Test button clicked!');
                        console.log('📱 Form data:', formData);
                        console.log('🔍 Current step:', currentStep);
                        console.log('📧 Email field:', formData.email);
                        console.log('📍 Location state:', formData.location.state);
                        console.log('📍 Location district:', formData.location.district);
                        console.log('📍 Location village:', formData.location.village);
                        console.log('🔒 Button disabled state:', loading || otpLoading);
                        alert('Test button works! Check console for details.');
                      }}
                      className="btn btn-outline"
            disabled={loading}
                    >
                      Test Button
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🔘 Button clicked!');
                        console.log('📱 Form data:', formData);
                        console.log('🔍 Current step:', currentStep);
                        console.log('📧 Email field:', formData.email);
                        console.log('📍 Location state:', formData.location.state);
                        console.log('📍 Location district:', formData.location.district);
                        console.log('📍 Location village:', formData.location.village);
                        console.log('🔒 Button disabled state:', loading || otpLoading);
                        sendOTP();
                      }}
                      className="btn btn-primary"
                      disabled={loading || otpLoading}
                    >
                      {otpLoading ? 'Sending OTP...' : 'Send OTP & Continue'}
          </button>
        </div>
                </div>
              )}
              
              {currentStep === 3 && (
                /* Step 3: OTP Verification */
                <div className="p-6">
                  <OTPVerification
                    phone={formData.phone}
                    email={formData.email}
                    type="registration"
                    onVerify={handleOTPVerify}
                    onResend={handleOTPResend}
                    onCancel={() => setCurrentStep(2)}
                    isLoading={otpLoading}
                  />
                </div>
              )}
      </form>

            {/* Error Display */}
            {error && (
              <div className="px-8 pb-6">
                <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-danger-500 text-xl">❌</div>
                    <div>
                      <h3 className="text-danger-800 font-semibold">Registration Failed</h3>
                      <p className="text-danger-600 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-200">
              <p className="text-center text-neutral-600 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
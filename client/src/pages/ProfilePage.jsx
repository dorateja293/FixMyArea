import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import LocationService from '../services/locationService';
import { validateField, getFieldError, hasFieldError } from '../utils/validation';
import axios from 'axios';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    dob: '',
    location: {
      state: null,
      district: null,
      village: null
    }
  });

  // Location data
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Load user data and locations
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        location: {
          state: user.location?.state ? { name: user.location.state } : null,
          district: user.location?.district ? { name: user.location.district } : null,
          village: user.location?.village ? { name: user.location.village } : null
        }
      });
    }
    loadStates();
  }, [user]);

  // Load districts when state changes
  useEffect(() => {
    if (isEditing && formData.location.state?.id) {
      loadDistricts(formData.location.state.id);
    }
  }, [formData.location.state, isEditing]);

  // Load villages when district changes
  useEffect(() => {
    if (isEditing && formData.location.district?.id) {
      loadVillages(formData.location.district.id);
    }
  }, [formData.location.district, isEditing]);

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

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    const nameErrors = validateField('name', formData.name, 'name');
    if (nameErrors.length > 0) newErrors.name = nameErrors[0];

    // Validate phone
    const phoneErrors = validateField('phone', formData.phone, 'phone');
    if (phoneErrors.length > 0) newErrors.phone = phoneErrors[0];

    // Validate location if editing
    if (isEditing) {
      if (!formData.location.state) {
        newErrors['location.state'] = 'Please select a state';
      }
      if (!formData.location.district) {
        newErrors['location.district'] = 'Please select a district';
      }
      if (!formData.location.village) {
        newErrors['location.village'] = 'Please select a village';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.replace(/\s/g, ''),
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
        location: {
          state: formData.location.state?.name || formData.location.state,
          district: formData.location.district?.name || formData.location.district,
          village: formData.location.village?.name || formData.location.village
        }
      };

      console.log('📝 Updating profile with data:', updateData);

      const response = await axios.put('http://localhost:5000/api/users/profile', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ Profile updated successfully');
        setIsEditing(false);
        // You might want to refresh user data here
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        location: {
          state: user.location?.state ? { name: user.location.state } : null,
          district: user.location?.district ? { name: user.location.district } : null,
          village: user.location?.village ? { name: user.location.village } : null
        }
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-4">
              My Profile
            </h1>
            <p className="text-neutral-600">
              View and edit your personal information
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-2xl font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
                    <p className="text-primary-100 capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-secondary"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className="btn btn-secondary"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary-900 border-b border-neutral-200 pb-2">
                    Personal Information
                  </h3>

                  {/* Name */}
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-input ${hasFieldError(errors, 'name') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                      disabled={!isEditing}
                    />
                    {hasFieldError(errors, 'name') && (
                      <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'name')}</p>
                    )}
                  </div>

                  {/* Phone */}
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
                      className={`form-input ${hasFieldError(errors, 'phone') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                      disabled={!isEditing}
                    />
                    {hasFieldError(errors, 'phone') && (
                      <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'phone')}</p>
                    )}
                  </div>

                  {/* Gender */}
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
                      disabled={!isEditing}
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
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary-900 border-b border-neutral-200 pb-2">
                    Location Information
                  </h3>

                  {isEditing ? (
                    <>
                      {/* State Selection */}
                      <div className="form-group">
                        <label htmlFor="state" className="form-label">
                          State
                        </label>
                        <select
                          id="state"
                          value={formData.location.state?.id || ''}
                          onChange={(e) => {
                            const selectedState = states.find(s => s.id === parseInt(e.target.value));
                            handleLocationChange('state', selectedState);
                          }}
                          className={`form-input ${hasFieldError(errors, 'location.state') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                          disabled={loadingLocations}
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
                          District
                        </label>
                        <select
                          id="district"
                          value={formData.location.district?.id || ''}
                          onChange={(e) => {
                            const selectedDistrict = districts.find(d => d.id === parseInt(e.target.value));
                            handleLocationChange('district', selectedDistrict);
                          }}
                          className={`form-input ${hasFieldError(errors, 'location.district') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                          disabled={loadingLocations || !formData.location.state}
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
                          Village
                        </label>
                        <select
                          id="village"
                          value={formData.location.village?.id || ''}
                          onChange={(e) => {
                            const selectedVillage = villages.find(v => v.id === parseInt(e.target.value));
                            handleLocationChange('village', selectedVillage);
                          }}
                          className={`form-input ${hasFieldError(errors, 'location.village') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                          disabled={loadingLocations || !formData.location.district}
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
                    </>
                  ) : (
                    <>
                      {/* Read-only location display */}
                      <div className="space-y-4">
                        <div>
                          <label className="form-label">State</label>
                          <p className="text-neutral-700">{formData.location.state?.name || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="form-label">District</label>
                          <p className="text-neutral-700">{formData.location.district?.name || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="form-label">Village</label>
                          <p className="text-neutral-700">{formData.location.village?.name || 'Not specified'}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="text-xl font-semibold text-primary-900 mb-4">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="form-label">Account Type</label>
                    <p className="text-neutral-700 capitalize">{user.role}</p>
                  </div>
                  <div>
                    <label className="form-label">Account Status</label>
                    <p className="text-neutral-700 capitalize">{user.status}</p>
                  </div>
                  <div>
                    <label className="form-label">Member Since</label>
                    <p className="text-neutral-700">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

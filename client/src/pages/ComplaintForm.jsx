import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateField, getFieldError, hasFieldError } from '../utils/validation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: {
      lat: null,
      lng: null,
      address: '',
      state: '',
      district: '',
      village: ''
    },
    images: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Map refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Complaint categories
  const categories = [
    {
      id: 'aggressive_dogs',
      name: 'Aggressive Dogs',
      description: 'Dogs showing aggressive behavior',
      icon: '🐕‍🦺'
    },
    {
      id: 'stray_dogs',
      name: 'Stray Dogs',
      description: 'Unattended dogs in public areas',
      icon: '🐕'
    },
    {
      id: 'injured_dogs',
      name: 'Injured Dogs',
      description: 'Dogs that appear to be hurt',
      icon: '🩹'
    },
    {
      id: 'rabid_dogs',
      name: 'Rabid Dogs',
      description: 'Dogs showing signs of rabies',
      icon: '⚠️'
    },
    {
      id: 'dog_bite',
      name: 'Dog Bite Incident',
      description: 'Report of dog bite attack',
      icon: '🦷'
    },
    {
      id: 'other',
      name: 'Other Issues',
      description: 'Other dog-related problems',
      icon: '❓'
    }
  ];

  // Initialize map with Leaflet
  useEffect(() => {
    if (!mapRef.current) return;

    try {
      // Initialize Leaflet map
      const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // India center

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);

      // Add click listener to map
      map.on('click', (event) => {
        const { lat, lng } = event.latlng;
        
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            lat,
            lng
          }
        }));

        // Add or update marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        markerRef.current = L.marker([lat, lng], {
          draggable: true,
          title: 'Selected Location'
        }).addTo(map);

        // Get address from coordinates
        getAddressFromCoordinates(lat, lng);

        // Add drag end listener
        markerRef.current.on('dragend', (event) => {
          const newLat = event.target.getLatLng().lat;
          const newLng = event.target.getLatLng().lng;
          
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              lat: newLat,
              lng: newLng
            }
          }));

          getAddressFromCoordinates(newLat, newLng);
        });
      });

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 15);
            
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                lat: latitude,
                lng: longitude
              }
            }));

            // Add marker for current location
            if (markerRef.current) {
              map.removeLayer(markerRef.current);
            }

            markerRef.current = L.marker([latitude, longitude], {
              draggable: true,
              title: 'Current Location'
            }).addTo(map);

            getAddressFromCoordinates(latitude, longitude);
          },
          (error) => {
            console.log('Geolocation error:', error);
          }
        );
      }

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to load map. Please try refreshing the page.');
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            address: data.display_name
          }
        }));
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const detectCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15);
            
            setFormData(prev => ({
      ...prev,
              location: {
                ...prev.location,
                lat: latitude,
                lng: longitude
              }
            }));

            // Add or update marker
            if (markerRef.current) {
              mapInstanceRef.current.removeLayer(markerRef.current);
            }

            markerRef.current = L.marker([latitude, longitude], {
              draggable: true,
              title: 'Current Location'
            }).addTo(mapInstanceRef.current);

            getAddressFromCoordinates(latitude, longitude);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to detect your location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    // Supported image formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const formatNames = ['JPEG', 'JPG', 'PNG', 'WebP', 'GIF'];

    if (files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      if (!supportedFormats.includes(file.type.toLowerCase())) {
        alert(`File ${file.name} is not a supported image format. Supported formats: ${formatNames.join(', ')}`);
        return false;
      }
      
      return true;
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Please select a complaint category';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    if (!formData.location.lat || !formData.location.lng) {
      newErrors.location = 'Please select a location on the map or use "Detect My Location"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic form fields
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', JSON.stringify(formData.location));

      // Add images - make sure they are File objects
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          if (image instanceof File) {
            formDataToSend.append('images', image);
          } else {
            console.warn('Skipping non-File object:', image);
          }
        });
      }

      console.log('📤 Submitting complaint with data:', {
        category: formData.category,
        description: formData.description,
        location: formData.location,
        imageCount: formData.images.length,
        hasToken: !!token,
        formDataEntries: Array.from(formDataToSend.entries()).map(([key, value]) => ({
          key,
          type: typeof value,
          isFile: value instanceof File,
          size: value instanceof File ? value.size : 'N/A'
        }))
      });

      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser will set it automatically with boundary
        },
        body: formDataToSend
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Complaint submission response:', data);

      if (data.success) {
        alert('Complaint submitted successfully!');
        navigate('/resident/dashboard');
      } else {
        throw new Error(data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('🚨 Error submitting complaint:', error);
      alert(`Failed to submit complaint: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return <div>Please log in to submit complaints.</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation component would go here if it were imported */}
      {/* <Navigation /> */}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-4">
              Submit a Complaint
            </h1>
            <p className="text-neutral-600">
              Report issues related to stray dogs in your area
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">
                Complaint Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <label key={category.id} className="relative">
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={formData.category === category.id}
                      onChange={handleChange}
                      className="sr-only"
                      disabled={loading}
                    />
                    <div className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.category === category.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}>
                      <div className="text-center">
                        <div className="text-3xl mb-2">{category.icon}</div>
                        <div className="font-semibold">{category.name}</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {hasFieldError(errors, 'category') && (
                <p className="text-danger-500 text-sm mt-2">{getFieldError(errors, 'category')}</p>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">
                Description
              </h2>
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Please describe the issue in detail
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue, including any relevant details like time, behavior, number of dogs, etc."
                  className={`form-textarea h-32 ${hasFieldError(errors, 'description') ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  required
                  disabled={loading}
                />
                {hasFieldError(errors, 'description') && (
                  <p className="text-danger-500 text-sm mt-1">{getFieldError(errors, 'description')}</p>
                )}
              </div>
        </div>

            {/* Location Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">
                Location
              </h2>
              
              {/* Map */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-neutral-600">
                    Click on the map to select location or use "Detect My Location"
                  </p>
                  <button
                    type="button"
                    onClick={detectCurrentLocation}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    {loading ? 'Detecting...' : '📍 Detect My Location'}
                  </button>
        </div>
                
                <div 
                  ref={mapRef}
                  className="w-full h-64 rounded-lg border-2 border-neutral-200"
                  style={{ minHeight: '256px' }}
                >
                  {!mapLoaded && !mapError && (
                    <div className="flex items-center justify-center h-full bg-neutral-100">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🗺️</div>
                        <p className="text-neutral-600">Loading OpenStreetMap...</p>
                      </div>
                    </div>
                  )}
                  
                  {mapError && (
                    <div className="flex items-center justify-center h-full bg-neutral-100">
                      <div className="text-center p-4">
                        <div className="text-2xl mb-2">⚠️</div>
                        <p className="text-neutral-600 mb-2">Map not available</p>
                        <p className="text-sm text-neutral-500">{mapError}</p>
                        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                          <p className="text-sm text-primary-700">
                            <strong>Manual Location Entry:</strong> You can still submit complaints by manually entering your location details below.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label htmlFor="state" className="form-label">State</label>
                  <input
                    id="state"
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="form-input"
                    readOnly={mapLoaded && !mapError}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="district" className="form-label">District</label>
                  <input
                    id="district"
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleChange}
                    placeholder="District"
                    className="form-input"
                    readOnly={mapLoaded && !mapError}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="village" className="form-label">Village</label>
                  <input
                    id="village"
                    type="text"
                    name="location.village"
                    value={formData.location.village}
                    onChange={handleChange}
                    placeholder="Village"
                    className="form-input"
                    readOnly={mapLoaded && !mapError}
                  />
                </div>
              </div>

              <div className="form-group mt-4">
                <label htmlFor="address" className="form-label">Full Address</label>
                <input
                  id="address"
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  placeholder="Full address will be auto-filled or enter manually"
                  className="form-input"
                  readOnly={mapLoaded && !mapError}
                />
          </div>

              {hasFieldError(errors, 'location') && (
                <p className="text-danger-500 text-sm mt-2">{getFieldError(errors, 'location')}</p>
          )}
        </div>

            {/* Image Upload */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">
                Images (Optional)
              </h2>
              <div className="form-group">
                <label htmlFor="images" className="form-label">
                  Upload photos of the issue (Max 5 images, 5MB each)
                </label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="form-input"
                  disabled={loading}
                />
                <p className="text-sm text-neutral-500 mt-1">
                  Supported formats: JPG, JPEG, PNG, WebP, GIF
                </p>
              </div>

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-primary-900 mb-2">Uploaded Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-danger-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-danger-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {/* No longer needed for Leaflet map */}
              {/* {uploading && (
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-neutral-600">{uploadProgress}%</span>
                  </div>
                </div>
              )} */}
        </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/resident/dashboard')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
        <button
          type="submit"
                className="btn btn-primary"
                disabled={loading}
        >
                {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
            </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import axios from 'axios';

const DogManagementPage = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedDog, setSelectedDog] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch dog records
  const { data: dogs, isLoading, isError } = useQuery({
    queryKey: ['dogRecords'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/dogs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!token
  });

  // Add new dog record
  const addDogMutation = useMutation({
    mutationFn: async (dogData) => {
      const response = await axios.post('http://localhost:5000/api/dogs', dogData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dogRecords']);
      setShowAddForm(false);
    }
  });

  // Update dog record
  const updateDogMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`http://localhost:5000/api/dogs/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dogRecords']);
      setShowEditForm(false);
      setSelectedDog(null);
    }
  });

  // Filter dogs based on search and status
  const filteredDogs = dogs?.filter(dog => {
    const matchesSearch = dog.dogId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dog.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dog.location.village.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || dog.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { color: 'bg-success-100 text-success-800 border-success-200', icon: '✅' },
      'Transferred to Shelter': { color: 'bg-warning-100 text-warning-800 border-warning-200', icon: '🏠' },
      'Adopted': { color: 'bg-info-100 text-info-800 border-info-200', icon: '🏡' },
      'Deceased': { color: 'bg-danger-100 text-danger-800 border-danger-200', icon: '💔' },
      'Lost': { color: 'bg-neutral-100 text-neutral-800 border-neutral-200', icon: '❓' }
    };
    
    const config = statusConfig[status] || statusConfig['Active'];
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <span>{config.icon}</span>
        {status}
      </span>
    );
  };

  const getVaccinationBadge = (status) => {
    const config = {
      'Not Vaccinated': { color: 'bg-danger-100 text-danger-800 border-danger-200', icon: '❌' },
      'Partially Vaccinated': { color: 'bg-warning-100 text-warning-800 border-warning-200', icon: '⚠️' },
      'Fully Vaccinated': { color: 'bg-success-100 text-success-800 border-success-200', icon: '✅' }
    };
    
    const badgeConfig = config[status] || config['Not Vaccinated'];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badgeConfig.color}`}>
        <span>{badgeConfig.icon}</span>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Navigation />
        <div className="p-6">
          <div className="container mx-auto max-w-7xl">
            <div className="animate-pulse">
              <div className="h-12 bg-neutral-200 rounded-lg mb-8"></div>
              <div className="h-16 bg-neutral-200 rounded-lg mb-6"></div>
              <div className="h-96 bg-neutral-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Navigation />
        <div className="p-6">
          <div className="container mx-auto max-w-7xl text-center">
            <div className="text-danger-600 text-xl mb-4">Failed to load dog records</div>
            <button
              onClick={() => queryClient.invalidateQueries(['dogRecords'])}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navigation />
      
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐕</div>
          <h1 className="text-3xl font-bold font-heading text-primary-900 mb-2">
            Dog Records Management
          </h1>
          <p className="text-neutral-600 text-lg">
            Manage stray dog records, track health status, and coordinate care
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stats-card">
            <div className="stats-icon bg-primary-100 text-primary-600">
              🐕
            </div>
            <div className="stats-content">
              <div className="stats-number">{dogs?.length || 0}</div>
              <div className="stats-label">Total Dogs</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-success-100 text-success-600">
              ✅
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {dogs?.filter(d => d.vaccinationStatus === 'Fully Vaccinated').length || 0}
              </div>
              <div className="stats-label">Vaccinated</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-info-100 text-info-600">
              🔧
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {dogs?.filter(d => d.sterilizationStatus === 'Sterilized').length || 0}
              </div>
              <div className="stats-label">Sterilized</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-warning-100 text-warning-600">
              ⚠️
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {dogs?.filter(d => d.isAggressive).length || 0}
              </div>
              <div className="stats-label">Aggressive</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary px-6 py-3"
              >
                ➕ Add New Dog
              </button>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Transferred to Shelter">In Shelter</option>
                <option value="Adopted">Adopted</option>
                <option value="Deceased">Deceased</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search by ID, breed, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-64"
              />
            </div>
          </div>
        </div>

        {/* Dogs Table */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Dog ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Breed</th>
                  <th className="px-6 py-4 text-left font-semibold">Location</th>
                  <th className="px-6 py-4 text-left font-semibold">Vaccination</th>
                  <th className="px-6 py-4 text-left font-semibold">Sterilization</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredDogs.map((dog) => (
                  <tr key={dog._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-semibold text-primary-600">
                        {dog.dogId}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {dog.age} years, {dog.gender}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-medium">{dog.breed}</div>
                      <div className="text-sm text-neutral-500">{dog.color}, {dog.size}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-medium">{dog.location.village}</div>
                      <div className="text-sm text-neutral-500">
                        {dog.location.district}, {dog.location.state}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {getVaccinationBadge(dog.vaccinationStatus)}
                      {dog.nextVaccinationDue && (
                        <div className="text-xs text-neutral-500 mt-1">
                          Due: {new Date(dog.nextVaccinationDue).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        dog.sterilizationStatus === 'Sterilized' 
                          ? 'bg-success-100 text-success-800 border-success-200' 
                          : 'bg-warning-100 text-warning-800 border-warning-200'
                      }`}>
                        {dog.sterilizationStatus === 'Sterilized' ? '✅' : '❌'}
                        {dog.sterilizationStatus}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      {getStatusBadge(dog.status)}
                      {dog.isAggressive && (
                        <div className="text-xs text-danger-600 mt-1 font-medium">
                          ⚠️ Aggressive
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDog(dog);
                            setShowEditForm(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setSelectedDog(dog)}
                          className="btn btn-info btn-sm"
                          title="View Details"
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredDogs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐕</div>
                <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                  No dogs found
                </h3>
                <p className="text-neutral-500 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start by adding your first dog record'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-primary px-6 py-3"
                  >
                    Add First Dog
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Dog Form Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-3xl">
              <h2 className="text-xl font-semibold text-white">
                {showAddForm ? 'Add New Dog Record' : 'Edit Dog Record'}
              </h2>
            </div>
            
            <div className="p-6">
              {/* Form content will go here - simplified for now */}
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🐕</div>
                <p className="text-neutral-600 mb-4">
                  {showAddForm ? 'Add new dog record form' : 'Edit dog record form'}
                </p>
                <p className="text-sm text-neutral-500">
                  Form implementation coming soon...
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setSelectedDog(null);
                  }}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DogManagementPage;

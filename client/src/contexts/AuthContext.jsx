import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Get user role from token
  const getUserRole = (token) => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch {
      return null;
    }
  };

  // Get user status from token
  const getUserStatus = (token) => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.status;
    } catch {
      return null;
    }
  };

  // Set up axios interceptor for automatic token handling
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Token expired or invalid, logout user
          logout();
          // Don't automatically redirect - let users stay on landing page
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, navigate]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        if (!token || isTokenExpired(token)) {
          console.log('🔍 No token or token expired, logging out');
          logout();
          setLoading(false);
          return;
        }

        console.log('🔍 Checking authentication with backend...');
        // Verify token with backend
        const response = await axios.get('http://localhost:5000/api/auth/me');
        
        if (response.data.success) {
          console.log('✅ Authentication verified:', response.data.data);
          setUser(response.data.data);
          setError(null);
          // Don't automatically redirect - let users stay on landing page if they want
        } else {
          console.log('❌ Authentication failed:', response.data);
          logout();
        }
      } catch (error) {
        console.error('🚨 Auth check failed:', error);
        console.error('📍 Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  // Login function
  const login = async (phone, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔑 Attempting login for phone:', phone);
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        phone,
        password,
      });

      console.log('📨 Login response received:', {
        success: response.data.success,
        hasData: !!response.data.data,
        hasToken: !!response.data.data?.token
      });

      if (response.data.success) {
        const { token: newToken, ...userData } = response.data.data;
        
        console.log('✅ Login successful, storing data:', {
          userId: userData._id,
          role: userData.role,
          hasToken: !!newToken
        });
        
        // Store token and user data
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);

        // Don't automatically redirect - let users choose where to go
        console.log('✅ Login successful, user can now navigate to dashboard or stay on landing page');
        // Users can manually navigate to their dashboard using navigation links

        return { success: true };
      } else {
        const errorMsg = response.data.message || 'Login failed';
        console.log('❌ Login failed:', errorMsg);
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      console.log('❌ Login error message:', message);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📝 Attempting registration with data:', {
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        hasLocation: !!userData.location
      });

      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      console.log('📨 Registration response received:', {
        success: response.data.success,
        hasData: !!response.data.data,
        hasToken: !!response.data.data?.token
      });

      if (response.data.success) {
        const { token: newToken, ...userInfo } = response.data.data;
        
        console.log('✅ Registration successful, storing data:', {
          userId: userInfo._id,
          role: userInfo.role,
          hasToken: !!newToken
        });
        
        // Store token and user data
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        setToken(newToken);
        setUser(userInfo);

        // Don't automatically redirect - let users choose where to go
        console.log('✅ Registration successful, user can now navigate to dashboard or stay on landing page');

        return { success: true };
      } else {
        const errorMsg = response.data.message || 'Registration failed';
        console.log('❌ Registration failed:', errorMsg);
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('🚨 Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      console.log('❌ Registration error message:', message);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
    // Don't automatically redirect - let users stay on landing page
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      console.log('🔄 Attempting token refresh...');
      const response = await axios.post('http://localhost:5000/api/auth/refresh');
      
      if (response.data.success) {
        const newToken = response.data.data.token;
        console.log('✅ Token refreshed successfully');
        localStorage.setItem('token', newToken);
        setToken(newToken);
        return { success: true };
      }
    } catch (error) {
      console.error('🚨 Token refresh failed:', error);
      logout();
      return { success: false };
    }
  };

  // Check if user has required role
  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  // Check if user is active
  const isActive = () => {
    return user && user.status === 'active';
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    hasRole,
    isActive,
    isAuthenticated: !!token && !!user && !isTokenExpired(token),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

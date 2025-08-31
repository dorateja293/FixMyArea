// Validation utility for form fields
export const validationRules = {
  // Name validation
  name: {
    required: 'Name is required',
    minLength: (min) => `Name must be at least ${min} characters`,
    maxLength: (max) => `Name must be less than ${max} characters`,
    pattern: 'Name can only contain letters, spaces, and hyphens'
  },
  
  // Phone validation
  phone: {
    required: 'Phone number is required',
    pattern: 'Please enter a valid 10-digit phone number',
    format: 'Phone number should be 10 digits without spaces or special characters'
  },
  
  // Password validation
  password: {
    required: 'Password is required',
    minLength: (min) => `Password must be at least ${min} characters`,
    maxLength: (max) => `Password must be less than ${max} characters`,
    pattern: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  },
  
  // Email validation (if needed later)
  email: {
    required: 'Email is required',
    pattern: 'Please enter a valid email address',
    format: 'Email should be in format: example@domain.com'
  },
  
  // Location validation
  location: {
    state: 'Please select a state',
    district: 'Please select a district',
    village: 'Please select a village'
  },
  
  // Complaint validation
  complaint: {
    category: 'Please select a complaint category',
    description: 'Please describe the issue',
    descriptionMinLength: (min) => `Description must be at least ${min} characters`,
    location: 'Please select or detect your location'
  },
  
  // Role validation
  role: {
    required: 'Role is required',
    valid: ['resident', 'staff', 'admin']
  },
  
  // Gender validation
  gender: {
    required: 'Gender is required',
    valid: ['Male', 'Female', 'Other']
  },
  
  // Date of birth validation
  dob: {
    required: 'Date of birth is required',
    format: 'Please enter a valid date'
  }
};

// Validation functions
export const validators = {
  name: (name) => {
    const errors = [];
    if (!name || name.trim() === '') {
      errors.push('Name is required');
    } else {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        errors.push('Name must be at least 2 characters');
      }
      if (trimmedName.length > 50) {
        errors.push('Name must be less than 50 characters');
      }
      if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
        errors.push('Name can only contain letters and spaces');
      }
    }
    return errors;
  },

  phone: (phone) => {
    const errors = [];
    if (!phone || phone.trim() === '') {
      errors.push('Phone number is required');
    } else {
      const cleanPhone = phone.replace(/\s/g, '');
      if (!/^[+]?[\d\s\-\(\)]{10,15}$/.test(cleanPhone)) {
        errors.push('Please enter a valid phone number');
      }
    }
    return errors;
  },

  email: (email) => {
    const errors = [];
    if (email && email.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address');
      }
    }
    return errors;
  },

  password: (password) => {
    const errors = [];
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
      }
      if (password.length > 50) {
        errors.push('Password must be less than 50 characters');
      }
    }
    return errors;
  },

  otp: (otp) => {
    const errors = [];
    if (!otp || otp.trim() === '') {
      errors.push('OTP is required');
    } else {
      if (!/^\d{6}$/.test(otp)) {
        errors.push('OTP must be a 6-digit number');
      }
    }
    return errors;
  },

  location: (location) => {
    const errors = [];
    if (!location) {
      errors.push('Location is required');
    } else {
      if (!location.state || !location.state.id) {
        errors.push('Please select a state');
      }
      if (!location.district || !location.district.id) {
        errors.push('Please select a district');
      }
      if (!location.village || !location.village.id) {
        errors.push('Please select a village');
      }
    }
    return errors;
  },

  complaint: (complaint) => {
    const errors = [];
    
    if (!complaint.category) {
      errors.push('Please select a complaint category');
    }
    
    if (!complaint.description || complaint.description.trim() === '') {
      errors.push('Please describe the issue');
    } else if (complaint.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    }
    
    if (!complaint.location || !complaint.location.lat || !complaint.location.lng) {
      errors.push('Please select or detect your location');
    }
    
    return errors;
  },
  
  // Role validation
  validateRole: (role) => {
    const validRoles = ['resident', 'staff', 'admin'];
    return validRoles.includes(role) ? [] : ['Please select a valid role'];
  },
  
  // Gender validation
  validateGender: (gender) => {
    const validGenders = ['Male', 'Female', 'Other'];
    return gender && validGenders.includes(gender) ? [] : ['Please select a valid gender'];
  },
  
  // Date of birth validation
  validateDOB: (dob) => {
    const errors = [];
    
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        errors.push('Please enter a valid date');
      } else if (birthDate > today) {
        errors.push('Date of birth cannot be in the future');
      } else if (today.getFullYear() - birthDate.getFullYear() < 13) {
        errors.push('You must be at least 13 years old');
      }
    }
    
    return errors;
  }
};

// Form validation helper
export const validateForm = (formData, fields) => {
  const errors = {};
  
  fields.forEach(field => {
    const value = formData[field.name];
    let fieldErrors = [];
    
    switch (field.type) {
      case 'name':
        fieldErrors = validators.name(value);
        break;
      case 'phone':
        fieldErrors = validators.phone(value);
        break;
      case 'password':
        fieldErrors = validators.password(value);
        break;
      case 'email':
        fieldErrors = validators.email(value);
        break;
      case 'location':
        fieldErrors = validators.location(value);
        break;
      case 'role':
        fieldErrors = validators.validateRole(value);
        break;
      case 'gender':
        fieldErrors = validators.validateGender(value);
        break;
      case 'dob':
        fieldErrors = validators.validateDOB(value);
        break;
      case 'complaint':
        fieldErrors = validators.complaint(value);
        break;
      default:
        if (field.required && (!value || value.trim() === '')) {
          fieldErrors.push(`${field.label || field.name} is required`);
        }
    }
    
    if (fieldErrors.length > 0) {
      errors[field.name] = fieldErrors;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time validation helper
export const validateField = (fieldName, value, fieldType) => {
  switch (fieldType) {
    case 'name':
      return validators.name(value);
    case 'phone':
      return validators.phone(value);
    case 'password':
      return validators.password(value);
    case 'email':
      return validators.email(value);
    case 'otp':
      return validators.otp(value);
    case 'location':
      return validators.location(value);
    case 'role':
      return validators.validateRole(value);
    case 'gender':
      return validators.validateGender(value);
    case 'dob':
      return validators.validateDOB(value);
    case 'complaint':
      return validators.complaint(value);
    default:
      return [];
  }
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

// Format date for display
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get field error message
export const getFieldError = (errors, fieldName) => {
  if (!errors || !errors[fieldName]) return '';
  return Array.isArray(errors[fieldName]) ? errors[fieldName][0] : errors[fieldName];
};

// Check if field has error
export const hasFieldError = (errors, fieldName) => {
  return !!(errors && errors[fieldName] && errors[fieldName].length > 0);
};

export default {
  validationRules,
  validators,
  validateForm,
  validateField,
  formatPhoneNumber,
  formatDate,
  getFieldError,
  hasFieldError
};

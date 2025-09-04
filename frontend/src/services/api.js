// =============================================================================
// API SERVICE - Centralized API calls
// =============================================================================

// Use Vite proxy when VITE_API_URL is not set (Docker setup)
// Use direct URL when VITE_API_URL is set (local development)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get JWT token from localStorage
 */
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (process.env.NODE_ENV === 'development') {
    console.log('🔑 Getting token from localStorage:', token ? 'Token available' : 'null');
  }
  return token;
};

/**
 * Base API call function with authentication headers and error handling
 */
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🌐 Making API call to:', url);
    console.log('🔐 Token available:', !!token);
  }
  
  // Default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if token exists
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Authorization header added');
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ No token available - making unauthenticated request');
    }
  }
  
  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };
  
  // Setup request configuration
  const config = {
    method: 'GET',
    ...options,
    headers,
  };
  
  // Add body if it's not GET request and body exists
  if (config.method !== 'GET' && options.body) {
    config.body = typeof options.body === 'string' 
      ? options.body 
      : JSON.stringify(options.body);
  }
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    config.signal = controller.signal;
    
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
    
  } catch (error) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection');
    }
    
    // Handle authentication errors
    if (error.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      throw new Error('Session expired - please login again');
    }
    
    // Handle forbidden access
    if (error.status === 403) {
      throw new Error('Access denied - insufficient permissions');
    }
    
    // Handle not found
    if (error.status === 404) {
      throw new Error('Resource not found');
    }
    
    // Handle server errors
    if (error.status >= 500) {
      throw new Error('Server error - please try again later');
    }
    
    // Re-throw the error with original message
    throw error;
  }
};

// =============================================================================
// AUTHENTICATION API
// =============================================================================

const auth = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  login: async (email, password) => {
    const response = await apiCall('/login', {
      method: 'POST',
      body: { email, password }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 Login response received');
    }
    
    // Store token if login successful
    if (response.success && response.data && response.data.token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Storing token in localStorage');
      }
      localStorage.setItem('token', response.data.token);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No token received in login response');
      }
    }
    
    return response;
  },

  /**
   * Register new user
   * @param {Object} data - User registration data
   * @returns {Promise<Object>} User data and token
   */
  register: async (data) => {
    const response = await apiCall('/register', {
      method: 'POST',
      body: data
    });
    
    // Store token if registration successful
    if (response.success && response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  },

  /**
   * Logout user (clear local token)
   */
  logout: () => {
    localStorage.removeItem('token');
  }
};

// =============================================================================
// EMPLOYEES API
// =============================================================================

const employees = {
  /**
   * Get all employees for admin/manager
   * @returns {Promise<Array>} All employees list
   */
  getAll: async () => {
    return await apiCall('/employees');
  },

  /**
   * Get team members for the logged-in leader
   * @returns {Promise<Array>} Team members list
   */
  getTeamMembers: async () => {
    return await apiCall('/employees/team-members');
  },

  /**
   * Get employee details with project information
   * @param {string} id - Employee ID
   * @returns {Promise<Object>} Employee details
   */
  getDetails: async (id) => {
    return await apiCall(`/employees/${id}/details`);
  },

  /**
   * Create new employee
   * @param {Object} data - Employee data
   * @returns {Promise<Object>} Created employee
   */
  create: async (data) => {
    return await apiCall('/employees', {
      method: 'POST',
      body: data
    });
  }
};

// =============================================================================
// MOVEMENTS API
// =============================================================================

const movements = {
  /**
   * Get all movements
   * @returns {Promise<Array>} Movements list
   */
  getAll: async () => {
    return await apiCall('/movements');
  },

  /**
   * Create entry movement
   * @param {Object} data - Entry movement data
   * @returns {Promise<Object>} Created entry movement
   */
  createEntry: async (data) => {
    return await apiCall('/movements/entries', {
      method: 'POST',
      body: data
    });
  },

  /**
   * Create exit movement
   * @param {Object} data - Exit movement data
   * @returns {Promise<Object>} Created exit movement
   */
  createExit: async (data) => {
    return await apiCall('/movements/exits', {
      method: 'POST',
      body: data
    });
  }
};

// =============================================================================
// PROJECTS API
// =============================================================================

const projects = {
  /**
   * Get all projects
   */
  getAll: async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Fetching projects...');
    }
    try {
      const response = await apiCall('/projects');
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Projects fetched successfully');
      }
      return response;
    } catch (error) {
      console.error('❌ Error fetching projects:', error.message);
      throw error;
    }
  }
};

// =============================================================================
// ROLES API
// =============================================================================

const roles = {
  /**
   * Get all roles
   * @returns {Promise<Array>} Roles list
   */
  getAll: async () => {
    return await apiCall('/movements/roles');
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export { 
  apiCall, 
  auth, 
  employees, 
  movements,
  projects,
  roles
};

export default {
  apiCall,
  auth,
  employees,
  movements,
  projects,
  roles
};

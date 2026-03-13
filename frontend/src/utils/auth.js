// Authentication utility functions

// Role definitions
export const ROLES = {
  ADMIN: 'ADMIN',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  SALESPERSON: 'SALESPERSON',
  CUSTOMER: 'CUSTOMER'
};

// Role hierarchy - higher roles can access lower role features
const ROLE_HIERARCHY = {
  ADMIN: 4,
  INVENTORY_MANAGER: 3,
  SALESPERSON: 2,
  CUSTOMER: 1
};

// Check if user has specific role
export const hasRole = (userRole, requiredRole) => {
  return userRole === requiredRole;
};

// Check if user has role or higher (for hierarchical access)
export const hasRoleOrHigher = (userRole, minimumRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
};

// Get user from localStorage
export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Save user to localStorage
export const setUser = (userData) => {
  try {
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Remove user from localStorage
export const removeUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getUser();
  return user && user.id && user.role;
};

// Get redirect path based on user role
export const getRedirectPath = (role) => {
  const paths = {
    [ROLES.ADMIN]: '/admin/dashboard',
    [ROLES.INVENTORY_MANAGER]: '/inventory/dashboard',
    [ROLES.SALESPERSON]: '/sales/dashboard',
    [ROLES.CUSTOMER]: '/customer/dashboard'
  };

  return paths[role] || '/dashboard';
};

// Check if user can access a specific route
export const canAccessRoute = (userRole, routeRole) => {
  if (!userRole || !routeRole) return false;

  // Admin can access everything
  if (userRole === ROLES.ADMIN) return true;

  // Otherwise, exact role match required
  return userRole === routeRole;
};

// API call with automatic logout on 401
export const apiCall = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };

    // Don't set Content-Type for FormData, browser will set it with boundary
    const isFormData = options.body instanceof FormData || 
                       (options.body && options.body.constructor && options.body.constructor.name === 'FormData');

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      credentials: 'include', // Include session cookies
      ...options,
      headers
    });

    // If unauthorized, remove user and redirect to login
    if (response.status === 401) {
      removeUser();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};
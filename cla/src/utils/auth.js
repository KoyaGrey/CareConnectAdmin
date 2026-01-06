/**
 * Centralized Authentication Utility
 * Handles role-based authentication and authorization
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

/**
 * Get the current user role from localStorage
 * @returns {string|null} The user role or null if not logged in
 */
export const getCurrentRole = () => {
  return localStorage.getItem('userRole');
};

/**
 * Set the user role in localStorage
 * @param {string} role - The role to set
 */
export const setUserRole = (role) => {
  localStorage.setItem('userRole', role);
};

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getCurrentRole();
};

/**
 * Check if user has a specific role
 * @param {string} role - The role to check
 * @returns {boolean}
 */
export const hasRole = (role) => {
  return getCurrentRole() === role;
};

/**
 * Check if user is admin (including super admin)
 * @returns {boolean}
 */
export const isAdmin = () => {
  const role = getCurrentRole();
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
};

/**
 * Check if user is super admin
 * @returns {boolean}
 */
export const isSuperAdmin = () => {
  return hasRole(ROLES.SUPER_ADMIN);
};

/**
 * Check if user has access to a resource (super admin has access to everything)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {boolean}
 */
export const hasAccess = (allowedRoles) => {
  const currentRole = getCurrentRole();
  if (!currentRole) return false;
  
  // Super admin has access to everything
  if (currentRole === ROLES.SUPER_ADMIN) return true;
  
  // Check if current role is in allowed roles
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(currentRole);
};

/**
 * Logout user by clearing authentication data
 */
export const logout = () => {
  localStorage.removeItem('userRole');
};

/**
 * Determine user role from login credentials (mock implementation)
 * In production, this would make an API call
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<string>} The user role
 */
export const authenticate = async (username, password) => {
  // Mock authentication - in production, this would be an API call
  // For now, superadmin username gives SUPER_ADMIN role
  if (username === 'superadmin' && password) {
    return ROLES.SUPER_ADMIN;
  }
  
  // Default to ADMIN role for other users
  if (username && password) {
    return ROLES.ADMIN;
  }
  
  throw new Error('Invalid credentials');
};


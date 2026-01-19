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
  try {
    return localStorage.getItem('userRole');
  } catch (error) {
    console.warn('Error reading userRole from localStorage:', error);
    return null;
  }
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
 * Logout user by clearing authentication data and updating Firestore
 */
export const logout = () => {
  // Get admin profile before clearing localStorage
  const adminProfileStr = localStorage.getItem('adminProfile');
  const adminId = adminProfileStr ? JSON.parse(adminProfileStr).adminId : null;
  
  // Clear localStorage first (non-blocking)
  localStorage.removeItem('userRole');
  localStorage.removeItem('adminProfile');
  
  // Update isActive flag in Firestore (non-blocking, fire and forget)
  if (adminId) {
    // Use dynamic import to avoid circular dependencies
    import('./firebase').then(({ db }) => {
      return Promise.all([
        import('firebase/firestore'),
        import('./firestoreService')
      ]).then(([{ doc, updateDoc }, { COLLECTIONS, SUPER_ADMIN_CREDENTIALS }]) => {
        // Don't update super admin's isActive (it's always active)
        if (adminId !== SUPER_ADMIN_CREDENTIALS.DOC_ID) {
          const adminRef = doc(db, COLLECTIONS.ADMINS, adminId);
          updateDoc(adminRef, {
            isActive: false
          }).then(() => {
            console.log('Admin isActive flag set to false on logout');
          }).catch((error) => {
            console.warn('Could not update isActive flag on logout (non-critical):', error);
          });
        }
      });
    }).catch((error) => {
        console.warn('Could not update isActive flag on logout (non-critical):', error);
    });
  }
};

import { authenticateAdmin, initializeSuperAdmin } from './firestoreService';

/**
 * Determine user role from login credentials
 * Authenticates against Firestore database
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<string>} The user role
 */
export const authenticate = async (username, password) => {
  try {
    console.log('Attempting login with username:', username);
    
    // Initialize super admin if it doesn't exist (non-blocking)
    initializeSuperAdmin().catch(err => {
      console.warn('Could not initialize super admin (non-critical):', err);
    });
    
    // Authenticate against Firestore
    const adminData = await authenticateAdmin(username, password);
    
    if (adminData) {
      console.log('Authentication successful. Role:', adminData.role);
      return adminData.role === 'SUPER_ADMIN' ? ROLES.SUPER_ADMIN : ROLES.ADMIN;
    }
    
    throw new Error('Invalid credentials');
  } catch (error) {
    console.error('Authentication error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(error.message || 'Invalid credentials');
  }
};


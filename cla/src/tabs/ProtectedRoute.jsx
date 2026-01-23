import { Navigate, useLocation } from "react-router-dom";
import { hasAccess, isAuthenticated, getCurrentRole, ROLES } from "../utils/auth";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccessToRoute, setHasAccessToRoute] = useState(false);

  useEffect(() => {
    // Small delay to ensure localStorage/sessionStorage is fully loaded
    // This prevents race conditions on page refresh or browser back button
    const checkAuth = () => {
      try {
        // Check role from sessionStorage first (tab-specific), then localStorage
        let userRole = null;
        if (typeof sessionStorage !== 'undefined') {
          userRole = sessionStorage.getItem('sessionRole');
        }
        if (!userRole) {
          userRole = getCurrentRole();
        }
        
        // Check if user is authenticated
        if (!userRole) {
          setHasAccessToRoute(false);
          setIsChecking(false);
          return;
        }

        // Check if user has access to this route
        // Super admin has access to everything
        if (userRole === ROLES.SUPER_ADMIN) {
          setHasAccessToRoute(true);
          setIsChecking(false);
          return;
        }
        
        // Check if current role is in allowed roles
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const access = roles.includes(userRole);
        setHasAccessToRoute(access);
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setHasAccessToRoute(false);
        setIsChecking(false);
      }
    };

    // Small timeout to ensure storage is ready (especially on browser back button)
    const timer = setTimeout(checkAuth, 50);
    
    return () => clearTimeout(timer);
  }, [location.pathname, allowedRoles]);

  // Show nothing while checking (prevents flash of login page)
  if (isChecking) {
    return null;
  }

  // Not logged in or wrong role - redirect to login
  // Use replace to prevent back button from going to unauthenticated state
  if (!hasAccessToRoute) {
    return <Navigate to="/tab/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

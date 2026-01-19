import { Navigate, useLocation } from "react-router-dom";
import { hasAccess, isAuthenticated } from "../utils/auth";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccessToRoute, setHasAccessToRoute] = useState(false);

  useEffect(() => {
    // Small delay to ensure localStorage is fully loaded
    // This prevents race conditions on page refresh or browser back button
    const checkAuth = () => {
      // Check if user is authenticated first
      if (!isAuthenticated()) {
        setHasAccessToRoute(false);
        setIsChecking(false);
        return;
      }

      // Then check if user has access to this route
      const access = hasAccess(allowedRoles);
      setHasAccessToRoute(access);
      setIsChecking(false);
    };

    // Small timeout to ensure localStorage is ready
    const timer = setTimeout(checkAuth, 50);
    
    return () => clearTimeout(timer);
  }, [location.pathname, allowedRoles]);

  // Show nothing while checking (prevents flash of login page)
  if (isChecking) {
    return null;
  }

  // Not logged in or wrong role - redirect to login
  if (!hasAccessToRoute) {
    return <Navigate to="/tab/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;

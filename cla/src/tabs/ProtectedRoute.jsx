import { Navigate } from "react-router-dom";
import { hasAccess } from "../utils/auth";

const ProtectedRoute = ({ allowedRoles, children }) => {
  // Use centralized auth utility
  if (!hasAccess(allowedRoles)) {
    // Not logged in or wrong role - redirect to login
    return <Navigate to="/tab/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

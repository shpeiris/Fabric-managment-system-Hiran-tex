import { Navigate, useLocation } from "react-router-dom";
import { getUser, canAccessRoute, ROLES } from "../utils/auth.js";

const ProtectedRoute = ({ role, children }) => {
  const user = getUser();
  const location = useLocation();

  // Not logged in - redirect to login with return URL
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (role && !canAccessRoute(user.role, role)) {
    // Redirect to appropriate dashboard based on user role  
    const userDashboard = {
      [ROLES.ADMIN]: '/admin/dashboard',
      [ROLES.INVENTORY_MANAGER]: '/inventory/dashboard',
      [ROLES.SALESPERSON]: '/sales/dashboard',
      [ROLES.CUSTOMER]: '/customer/dashboard'
    }[user.role] || '/';

    return <Navigate to={userDashboard} replace />;
  }

  // Correct role - allow access
  return children;
};

export default ProtectedRoute;

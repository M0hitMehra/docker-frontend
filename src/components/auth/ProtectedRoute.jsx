import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { LoadingSpinner } from "../ui/index.js";
import { ROUTES } from "../../utils/constants.js";

const ProtectedRoute = ({
  children,
  redirectTo = ROUTES.LOGIN,
  requireAuth = true,
  roles = [],
  permissions = [],
}) => {
  const {
    isAuthenticated,
    loading,
    initialized,
    user,
    hasRole,
    hasPermission,
  } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <LoadingSpinner
          size="large"
          text="Checking authentication..."
          color="white"
        />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated but shouldn't be (e.g., login page when already logged in)
  if (!requireAuth && isAuthenticated) {
    // Redirect to home or the intended destination
    const from = location.state?.from?.pathname || ROUTES.HOME;
    return <Navigate to={from} replace />;
  }

  // Check role-based access
  if (requireAuth && roles.length > 0) {
    const hasRequiredRole = roles.some((role) => hasRole(role));
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <p className="text-white/60 mb-6">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Check permission-based access
  if (requireAuth && permissions.length > 0) {
    const hasRequiredPermission = permissions.some((permission) =>
      hasPermission(permission)
    );
    if (!hasRequiredPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Insufficient Permissions
            </h1>
            <p className="text-white/60 mb-6">
              You don't have the required permissions to access this feature.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render the protected content
  return children;
};

// Higher-order component for easier usage
export const withAuth = (Component, options = {}) => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific route protection components
export const RequireAuth = ({ children, ...props }) => (
  <ProtectedRoute requireAuth={true} {...props}>
    {children}
  </ProtectedRoute>
);

export const RequireGuest = ({ children, ...props }) => (
  <ProtectedRoute requireAuth={false} {...props}>
    {children}
  </ProtectedRoute>
);

export const RequireRole = ({ children, roles, ...props }) => (
  <ProtectedRoute requireAuth={true} roles={roles} {...props}>
    {children}
  </ProtectedRoute>
);

export const RequirePermission = ({ children, permissions, ...props }) => (
  <ProtectedRoute requireAuth={true} permissions={permissions} {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;

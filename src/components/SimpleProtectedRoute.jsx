import React from "react";
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "../contexts/SimpleAuthContext.jsx";

const SimpleProtectedRoute = ({ children }) => {
  const { user, loading } = useSimpleAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log("🚫 SimpleProtectedRoute: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ SimpleProtectedRoute: User authenticated:", user.email);

  // Render protected content
  return children;
};

export const SimpleGuestRoute = ({ children, redirectTo = "/" }) => {
  const { user, loading } = useSimpleAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Redirect to home if already authenticated
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render guest content
  return children;
};

export default SimpleProtectedRoute;

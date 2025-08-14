import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";
import {
  isPublicRoute,
  isProtectedRoute,
  requiresGuest,
} from "../../config/routes.js";

const NavigationGuard = ({ children }) => {
  const { isAuthenticated, initialized, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run navigation guards after auth is initialized
    if (!initialized || loading) return;

    const currentPath = location.pathname;

    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && isProtectedRoute(currentPath)) {
      // Save the intended destination
      const from = location.pathname + location.search;
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { from: from !== ROUTES.LOGIN ? from : ROUTES.HOME },
      });
      return;
    }

    // If user is authenticated and trying to access guest-only route
    if (isAuthenticated && requiresGuest(currentPath)) {
      // Redirect to intended destination or home
      const from = location.state?.from || ROUTES.HOME;
      navigate(from, { replace: true });
      return;
    }

    // Handle root path redirect
    if (currentPath === "/") {
      navigate(isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN, { replace: true });
      return;
    }

    // Handle unknown routes - redirect to appropriate default
    if (
      !isPublicRoute(currentPath) &&
      !isProtectedRoute(currentPath) &&
      currentPath !== "/"
    ) {
      navigate(isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN, { replace: true });
      return;
    }
  }, [isAuthenticated, initialized, loading, location, navigate]);

  return children;
};

export default NavigationGuard;

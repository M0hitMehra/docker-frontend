import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
import {
  loginUser,
  registerUser,
  logoutUser,
  verifyToken,
  initializeAuth,
  clearError,
  setCredentials,
} from "../store/slices/authSlice.js";
import { authService } from "../services/authService.js";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading, error, initialized } =
    useAppSelector((state) => state.auth);

  // Initialize auth state on mount
  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, initialized]);

  // Login function
  const login = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const result = await dispatch(registerUser(userData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      dispatch(setCredentials({ user: updatedUser, token }));
      return { success: true, data: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Clear error function
  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Check if user has specific role (for future use)
  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  // Check if user has specific permission (for future use)
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  // Get user display name
  const getDisplayName = () => {
    if (!user) return "";
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.email;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error,
    initialized,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearAuthError,

    // Utilities
    hasRole,
    hasPermission,
    getDisplayName,
    getUserInitials,
  };
};

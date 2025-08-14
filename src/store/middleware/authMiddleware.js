import { createListenerMiddleware } from "@reduxjs/toolkit";
import { clearCredentials } from "../slices/authSlice.js";
import { addNotification } from "../slices/uiSlice.js";

// Create the middleware instance
export const authMiddleware = createListenerMiddleware();

// Listen for auth errors and handle token expiration
authMiddleware.startListening({
  predicate: (action) => {
    return (
      action.type.endsWith("/rejected") &&
      (action.payload === "Token invalid" ||
        action.payload === "Token expired" ||
        action.payload === "Unauthorized")
    );
  },
  effect: async (action, listenerApi) => {
    // Clear credentials on auth failure
    listenerApi.dispatch(clearCredentials());

    // Show notification
    listenerApi.dispatch(
      addNotification({
        message: "Your session has expired. Please log in again.",
        type: "error",
        duration: 5000,
      })
    );

    // Redirect to login (this would be handled by the router)
    window.location.href = "/login";
  },
});

// Listen for successful login/register to show welcome message
authMiddleware.startListening({
  predicate: (action) => {
    return (
      action.type === "auth/loginUser/fulfilled" ||
      action.type === "auth/registerUser/fulfilled"
    );
  },
  effect: async (action, listenerApi) => {
    const isLogin = action.type === "auth/loginUser/fulfilled";
    const user = action.payload.user;

    listenerApi.dispatch(
      addNotification({
        message: isLogin
          ? `Welcome back, ${user.firstName || user.email}!`
          : `Welcome to Gorgeous Notes, ${user.firstName || user.email}!`,
        type: "success",
        duration: 3000,
      })
    );
  },
});

// Listen for logout to show goodbye message
authMiddleware.startListening({
  predicate: (action) => action.type === "auth/logoutUser/fulfilled",
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(
      addNotification({
        message: "You have been logged out successfully.",
        type: "info",
        duration: 2000,
      })
    );
  },
});

// Auto-save user preferences
authMiddleware.startListening({
  predicate: (action) =>
    action.type === "ui/toggleDarkMode" || action.type === "ui/setDarkMode",
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState();
    if (state.auth.isAuthenticated) {
      // This would save preferences to the server
      // For now, we just save to localStorage (already handled in the slice)
    }
  },
});

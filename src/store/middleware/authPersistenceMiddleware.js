import { authPersistenceService } from "../../services/authPersistence.js";

// Middleware to automatically persist auth state changes
export const authPersistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Get current auth state after action
  const state = store.getState();
  const authState = state.auth;

  // Actions that should trigger persistence
  const persistActions = [
    "auth/loginUser/fulfilled",
    "auth/registerUser/fulfilled",
    "auth/verifyToken/fulfilled",
    "auth/initializeAuth/fulfilled",
    "auth/setCredentials",
  ];

  // Actions that should clear persistence
  const clearActions = [
    "auth/logoutUser/fulfilled",
    "auth/clearCredentials",
    "auth/loginUser/rejected",
    "auth/registerUser/rejected",
    "auth/verifyToken/rejected",
  ];

  if (persistActions.includes(action.type)) {
    // Persist auth state
    if (authState.isAuthenticated && authState.user && authState.token) {
      authPersistenceService.saveAuthState({
        user: authState.user,
        token: authState.token,
        isAuthenticated: authState.isAuthenticated,
        expiresIn: action.payload?.expiresIn,
      });

      // Update session activity
      authPersistenceService.updateSessionActivity();
    }
  } else if (clearActions.includes(action.type)) {
    // Clear persisted auth data
    authPersistenceService.clearAuthData();
    authPersistenceService.endSession();
  }

  return result;
};

// Middleware to handle token expiration
export const tokenExpirationMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Check for token expiration on API errors
  if (
    action.type.endsWith("/rejected") &&
    action.payload?.code === "AUTH_ERROR"
  ) {
    const state = store.getState();

    if (state.auth.isAuthenticated) {
      // Token might be expired, clear auth data
      authPersistenceService.clearAuthData();

      // Dispatch logout action
      store.dispatch({ type: "auth/clearCredentials" });
    }
  }

  return result;
};

// Middleware to track user activity
export const activityTrackingMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Track user activity for session management
  const activityActions = [
    "notes/createNote",
    "notes/updateNote",
    "notes/deleteNote",
    "notes/fetchNotes",
    "auth/updateProfile",
  ];

  if (
    activityActions.some((actionType) => action.type.startsWith(actionType))
  ) {
    const state = store.getState();

    if (state.auth.isAuthenticated) {
      authPersistenceService.updateSessionActivity();
    }
  }

  return result;
};

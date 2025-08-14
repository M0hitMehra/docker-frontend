import { useState, useCallback, useEffect } from "react";
import { authPersistenceService } from "../services/authPersistence.js";

export const useRememberMe = () => {
  const [rememberMe, setRememberMeState] = useState(false);

  // Initialize remember me state from storage
  useEffect(() => {
    const stored = authPersistenceService.getRememberMe();
    setRememberMeState(stored);
  }, []);

  // Set remember me preference
  const setRememberMe = useCallback((remember) => {
    setRememberMeState(remember);
    authPersistenceService.setRememberMe(remember);

    // If turning off remember me and user is logged in,
    // we might want to clear stored credentials on next logout
    if (!remember) {
      // Mark for cleanup on logout
      authPersistenceService.setRememberMe(false);
    }
  }, []);

  // Toggle remember me
  const toggleRememberMe = useCallback(() => {
    setRememberMe(!rememberMe);
  }, [rememberMe, setRememberMe]);

  // Check if should auto-login
  const shouldAutoLogin = useCallback(() => {
    return authPersistenceService.shouldAutoLogin();
  }, []);

  // Get session info
  const getSessionInfo = useCallback(() => {
    return {
      current: authPersistenceService.getCurrentSession(),
      history: authPersistenceService.getSessionHistory(),
      deviceFingerprint: authPersistenceService.getDeviceFingerprint(),
    };
  }, []);

  // Clear all stored auth data
  const clearStoredAuth = useCallback(() => {
    authPersistenceService.clearAuthData();
    setRememberMeState(false);
  }, []);

  return {
    rememberMe,
    setRememberMe,
    toggleRememberMe,
    shouldAutoLogin,
    getSessionInfo,
    clearStoredAuth,
  };
};

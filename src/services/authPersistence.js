import { storageService } from "./storageService.js";
import { STORAGE_KEYS } from "../utils/constants.js";

// Token expiration buffer (5 minutes before actual expiration)
const TOKEN_EXPIRATION_BUFFER = 5 * 60 * 1000;

export const authPersistenceService = {
  // Enhanced token storage with expiration
  setAuthToken(token, expiresIn = null) {
    const tokenData = {
      token,
      timestamp: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
    };

    return storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, tokenData);
  },

  getAuthToken() {
    const tokenData = storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (!tokenData) return null;

    // Handle legacy token format (just string)
    if (typeof tokenData === "string") {
      return tokenData;
    }

    // Check if token is expired
    if (
      tokenData.expiresAt &&
      Date.now() > tokenData.expiresAt - TOKEN_EXPIRATION_BUFFER
    ) {
      this.clearAuthData();
      return null;
    }

    return tokenData.token;
  },

  isTokenExpired() {
    const tokenData = storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (!tokenData || typeof tokenData === "string") {
      return false; // Can't determine expiration for legacy tokens
    }

    return tokenData.expiresAt && Date.now() > tokenData.expiresAt;
  },

  getTokenExpirationTime() {
    const tokenData = storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (!tokenData || typeof tokenData === "string") {
      return null;
    }

    return tokenData.expiresAt;
  },

  // Enhanced user data storage with validation
  setUserData(userData) {
    const userDataWithMeta = {
      ...userData,
      _meta: {
        storedAt: Date.now(),
        version: "1.0",
      },
    };

    return storageService.setItem(STORAGE_KEYS.USER_DATA, userDataWithMeta);
  },

  getUserData() {
    const userData = storageService.getItem(STORAGE_KEYS.USER_DATA);

    if (!userData) return null;

    // Remove metadata before returning
    if (userData._meta) {
      const { _meta, ...cleanUserData } = userData;
      return cleanUserData;
    }

    return userData;
  },

  // Session management
  createSession(sessionData) {
    const session = {
      id: this.generateSessionId(),
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ...sessionData,
    };

    storageService.setItem("current_session", session);
    this.addToSessionHistory(session);

    return session;
  },

  updateSessionActivity() {
    const session = storageService.getItem("current_session");
    if (session) {
      session.lastActivity = Date.now();
      storageService.setItem("current_session", session);
    }
  },

  getCurrentSession() {
    return storageService.getItem("current_session");
  },

  endSession() {
    const session = this.getCurrentSession();
    if (session) {
      session.endedAt = Date.now();
      this.addToSessionHistory(session);
    }

    storageService.removeItem("current_session");
  },

  addToSessionHistory(session) {
    const history = storageService.getItem("session_history", []);
    history.unshift(session);

    // Keep only last 10 sessions
    const recentHistory = history.slice(0, 10);
    storageService.setItem("session_history", recentHistory);
  },

  getSessionHistory() {
    return storageService.getItem("session_history", []);
  },

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Authentication state persistence
  saveAuthState(authState) {
    const persistedState = {
      user: authState.user,
      token: authState.token,
      isAuthenticated: authState.isAuthenticated,
      timestamp: Date.now(),
    };

    // Store token separately with expiration handling
    if (authState.token) {
      this.setAuthToken(authState.token, authState.expiresIn);
    }

    // Store user data
    if (authState.user) {
      this.setUserData(authState.user);
    }

    return storageService.setItem("auth_state", persistedState);
  },

  restoreAuthState() {
    const token = this.getAuthToken();
    const userData = this.getUserData();
    const authState = storageService.getItem("auth_state");

    if (!token || !userData) {
      this.clearAuthData();
      return null;
    }

    return {
      user: userData,
      token,
      isAuthenticated: true,
      timestamp: authState?.timestamp || Date.now(),
    };
  },

  // Clear all authentication data
  clearAuthData() {
    storageService.removeAuthToken();
    storageService.removeUserData();
    storageService.removeItem("auth_state");
    storageService.removeItem("current_session");
  },

  // Remember me functionality
  setRememberMe(remember = true) {
    storageService.setPreference("remember_me", remember);
  },

  getRememberMe() {
    return storageService.getPreference("remember_me", false);
  },

  // Auto-login check
  shouldAutoLogin() {
    const rememberMe = this.getRememberMe();
    const token = this.getAuthToken();
    const userData = this.getUserData();

    return rememberMe && token && userData && !this.isTokenExpired();
  },

  // Device fingerprinting for security
  generateDeviceFingerprint() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Device fingerprint", 2, 2);

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      timestamp: Date.now(),
    };

    return btoa(JSON.stringify(fingerprint));
  },

  setDeviceFingerprint() {
    const fingerprint = this.generateDeviceFingerprint();
    storageService.setItem("device_fingerprint", fingerprint);
    return fingerprint;
  },

  getDeviceFingerprint() {
    return storageService.getItem("device_fingerprint");
  },

  // Security checks
  validateStoredData() {
    const issues = [];

    // Check if token exists but user data doesn't
    const token = this.getAuthToken();
    const userData = this.getUserData();

    if (token && !userData) {
      issues.push("Token exists but user data is missing");
    }

    if (!token && userData) {
      issues.push("User data exists but token is missing");
    }

    // Check token expiration
    if (token && this.isTokenExpired()) {
      issues.push("Token is expired");
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },

  // Migration utilities
  migrateFromLegacyStorage() {
    // Check for legacy token format
    const legacyToken = localStorage.getItem("auth_token");
    const legacyUser = localStorage.getItem("user_data");

    if (legacyToken && legacyUser) {
      try {
        const userData = JSON.parse(legacyUser);

        // Migrate to new format
        this.setAuthToken(legacyToken);
        this.setUserData(userData);

        // Remove legacy items
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");

        return true;
      } catch (error) {
        console.error("Failed to migrate legacy auth data:", error);
        return false;
      }
    }

    return false;
  },

  // Cleanup expired data
  cleanup() {
    // Remove expired tokens
    if (this.isTokenExpired()) {
      this.clearAuthData();
    }

    // Clean old session history
    const history = this.getSessionHistory();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentHistory = history.filter(
      (session) => session.createdAt > thirtyDaysAgo
    );

    if (recentHistory.length !== history.length) {
      storageService.setItem("session_history", recentHistory);
    }
  },

  // Initialize persistence service
  initialize() {
    // Migrate legacy data
    this.migrateFromLegacyStorage();

    // Set device fingerprint if not exists
    if (!this.getDeviceFingerprint()) {
      this.setDeviceFingerprint();
    }

    // Cleanup expired data
    this.cleanup();

    // Update session activity
    this.updateSessionActivity();

    // Set up periodic cleanup
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Every hour
  },
};

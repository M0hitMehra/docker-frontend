/**
 * Simple token storage utility
 * Handles secure token storage and validation
 */

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export const tokenStorage = {
  /**
   * Store authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    try {
      if (!token || typeof token !== "string") {
        console.warn("Invalid token provided to setToken");
        return false;
      }

      localStorage.setItem(TOKEN_KEY, token);
      return true;
    } catch (error) {
      console.error("Error storing token:", error);
      return false;
    }
  },

  /**
   * Get stored authentication token
   * @returns {string|null} Token or null if not found/invalid
   */
  getToken() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        return null;
      }

      // Basic token validation
      if (!this.isValidToken(token)) {
        this.clearToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  },

  /**
   * Store user data
   * @param {object} user - User object
   */
  setUser(user) {
    try {
      if (!user || typeof user !== "object") {
        console.warn("Invalid user data provided to setUser");
        return false;
      }

      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error("Error storing user data:", error);
      return false;
    }
  },

  /**
   * Get stored user data
   * @returns {object|null} User object or null if not found/invalid
   */
  getUser() {
    try {
      const userData = localStorage.getItem(USER_KEY);

      if (!userData) {
        return null;
      }

      return JSON.parse(userData);
    } catch (error) {
      console.error("Error retrieving user data:", error);
      this.clearUser();
      return null;
    }
  },

  /**
   * Clear authentication token
   */
  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  },

  /**
   * Clear user data
   */
  clearUser() {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  },

  /**
   * Clear all authentication data
   */
  clearAll() {
    this.clearToken();
    this.clearUser();

    // Also clear any legacy keys
    try {
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    } catch (error) {
      console.error("Error clearing legacy auth data:", error);
    }
  },

  /**
   * Basic token validation
   * @param {string} token - Token to validate
   * @returns {boolean} True if token appears valid
   */
  isValidToken(token) {
    if (!token || typeof token !== "string") {
      return false;
    }

    // Check if token has JWT structure (3 parts separated by dots)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    try {
      // Try to decode the payload
      const payload = JSON.parse(atob(parts[1]));

      // Check if token has expired (with 1 minute buffer)
      if (payload.exp && payload.exp * 1000 < Date.now() - 60 * 1000) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if valid token and user data exist
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  },
};

export default tokenStorage;

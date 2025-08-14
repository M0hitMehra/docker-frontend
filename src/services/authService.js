import { apiService } from "./api.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const authService = {
  // User registration
  async register(userData) {
    try {
      const response = await apiService.post("/api/auth/register", userData);
      const { user, accessToken, refreshToken } =
        response.data.data || response.data;

      // Store tokens and user data using API service helper
      apiService.setAuthToken(accessToken);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { user, token: accessToken, refreshToken };
    } catch (error) {
      throw new Error(error.message || "Registration failed");
    }
  },

  // User login
  async login(credentials) {
    try {
      const response = await apiService.post("/api/auth/login", credentials);
      const { user, accessToken, refreshToken } =
        response.data.data || response.data;

      // Store tokens and user data using API service helper
      apiService.setAuthToken(accessToken);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { user, token: accessToken, refreshToken };
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  },

  // User logout
  async logout() {
    try {
      // Call logout endpoint if it exists
      await apiService.post("/api/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error.message);
    } finally {
      // Always clear authentication data using API service helper
      apiService.clearAuth();
    }
  },

  // Verify token
  async verifyToken() {
    try {
      const response = await apiService.get("/api/auth/verify");
      const { user } = response.data.data || response.data;

      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { user };
    } catch (error) {
      // Clear invalid token using API service helper
      apiService.clearAuth();
      throw new Error(error.message || "Token verification failed");
    }
  },

  // Refresh token (if implemented on server)
  async refreshToken() {
    try {
      const response = await apiService.post("/api/auth/refresh");
      const { token } = response.data.data || response.data;

      // Update token using API service helper
      apiService.setAuthToken(token);

      return { token };
    } catch (error) {
      // Clear invalid token using API service helper
      apiService.clearAuth();
      throw new Error(error.message || "Token refresh failed");
    }
  },

  // Get current user profile
  async getProfile() {
    try {
      const response = await apiService.get("/api/user/profile");
      const user = response.data.data || response.data;

      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return user;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch profile");
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put("/api/user/profile", profileData);
      const user = response.data.data || response.data;

      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return user;
    } catch (error) {
      throw new Error(error.message || "Failed to update profile");
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiService.put("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to change password");
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiService.post("/api/auth/forgot-password", {
        email,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to send reset email");
    }
  },

  // Reset password
  async resetPassword(resetData) {
    try {
      const response = await apiService.post(
        "/api/auth/reset-password",
        resetData
      );
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to reset password");
    }
  },

  // Get stored user data
  getStoredUser() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  },

  // Get stored token
  getStoredToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  },
};

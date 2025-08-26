import { apiService } from "./api.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const userService = {
  // Get user profile
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

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      const response = await apiService.put("/api/user/preferences", {
        preferences,
      });
      const user = response.data.data || response.data;

      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return user;
    } catch (error) {
      throw new Error(error.message || "Failed to update preferences");
    }
  },

  // Upload user avatar
  async uploadAvatar(file) {
    try {
      // For now, create a placeholder avatar URL since server expects URL not file
      // In a real implementation, you would upload to a file storage service first
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        file.name
      )}&background=667eea&color=fff&size=200`;

      const response = await apiService.post("/api/user/avatar", {
        avatarUrl: avatarUrl,
      });

      const user = response.data.data || response.data;

      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return user;
    } catch (error) {
      // Don't let avatar upload errors cause logout
      console.error("Avatar upload error:", error);
      throw new Error(error.message || "Failed to upload avatar");
    }
  },

  // Delete user avatar
  async deleteAvatar() {
    try {
      const response = await apiService.delete("/api/user/avatar");
      const user = response.data.data || response.data;

      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return user;
    } catch (error) {
      throw new Error(error.message || "Failed to delete avatar");
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const response = await apiService.get("/api/user/stats");
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch user statistics");
    }
  },

  // Export user data
  async exportUserData() {
    try {
      const response = await apiService.get("/api/user/export");
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to export user data");
    }
  },

  // Delete user account
  async deleteAccount(password) {
    try {
      const response = await apiService.delete("/api/user/account", {
        data: { password },
      });

      // Clear all stored data
      apiService.clearAuth();

      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to delete account");
    }
  },

  // Request account deletion (with email confirmation)
  async requestAccountDeletion() {
    try {
      const response = await apiService.post("/api/user/request-deletion");
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to request account deletion");
    }
  },

  // Cancel account deletion request
  async cancelAccountDeletion() {
    try {
      const response = await apiService.post("/api/user/cancel-deletion");
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to cancel account deletion");
    }
  },

  // Get user activity log
  async getActivityLog(options = {}) {
    try {
      const { page = 1, limit = 50, type } = options;

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (type) params.append("type", type);

      const response = await apiService.get(
        `/api/user/activity?${params.toString()}`
      );
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch activity log");
    }
  },

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const response = await apiService.put(
        "/api/user/notifications",
        settings
      );
      const user = response.data.data || response.data;

      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return user;
    } catch (error) {
      throw new Error(
        error.message || "Failed to update notification settings"
      );
    }
  },

  // Get user sessions
  async getSessions() {
    try {
      const response = await apiService.get("/api/user/sessions");
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch sessions");
    }
  },

  // Revoke user session
  async revokeSession(sessionId) {
    try {
      const response = await apiService.delete(
        `/api/user/sessions/${sessionId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to revoke session");
    }
  },

  // Revoke all other sessions
  async revokeAllOtherSessions() {
    try {
      const response = await apiService.delete("/api/user/sessions/others");
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to revoke sessions");
    }
  },
};

import { useCallback } from "react";
import { useSimpleAuth } from "../contexts/SimpleAuthContext.jsx";
import { useNotifications } from "./useNotifications.js";
import { userService } from "../services/userService.js";

export const useProfile = () => {
  const { user, updateProfile: updateAuthProfile } = useSimpleAuth();
  const { showSuccess, showError } = useNotifications();

  // Update user profile
  const updateProfile = useCallback(
    async (profileData) => {
      try {
        const updatedUser = await userService.updateProfile(profileData);

        // Update auth state with new user data
        await updateAuthProfile(profileData);

        return { success: true, data: updatedUser };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [updateAuthProfile]
  );

  // Update user preferences
  const updatePreferences = useCallback(
    async (preferences) => {
      try {
        const updatedUser = await userService.updatePreferences(preferences);

        showSuccess("Preferences updated successfully! ⚙️");
        return { success: true, data: updatedUser };
      } catch (error) {
        showError(error.message || "Failed to update preferences");
        return { success: false, error: error.message };
      }
    },
    [showSuccess, showError]
  );

  // Upload avatar
  const uploadAvatar = useCallback(
    async (file) => {
      try {
        // Validate file
        if (!file) {
          throw new Error("No file selected");
        }

        if (!file.type.startsWith("image/")) {
          throw new Error("Please select an image file");
        }

        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          throw new Error("File size must be less than 5MB");
        }

        showSuccess("Uploading avatar... 📷");
        const updatedUser = await userService.uploadAvatar(file);

        showSuccess("Avatar updated successfully! ✨");
        return { success: true, data: updatedUser };
      } catch (error) {
        console.error("Avatar upload error:", error);

        // Don't trigger logout for upload errors - just show error message
        const errorMessage = error.message || "Failed to upload avatar";
        showError(`Upload failed: ${errorMessage}`);

        return { success: false, error: errorMessage };
      }
    },
    [showSuccess, showError]
  );

  // Delete avatar
  const deleteAvatar = useCallback(async () => {
    try {
      const updatedUser = await userService.deleteAvatar();

      showSuccess("Avatar removed successfully! 🗑️");
      return { success: true, data: updatedUser };
    } catch (error) {
      showError(error.message || "Failed to remove avatar");
      return { success: false, error: error.message };
    }
  }, [showSuccess, showError]);

  // Get user statistics
  const getUserStats = useCallback(async () => {
    try {
      const stats = await userService.getUserStats();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Export user data
  const exportUserData = useCallback(async () => {
    try {
      const data = await userService.exportUserData();

      // Create and download file
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `gorgeous-notes-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess("Data exported successfully! 📁");
      return { success: true, data };
    } catch (error) {
      showError(error.message || "Failed to export data");
      return { success: false, error: error.message };
    }
  }, [showSuccess, showError]);

  // Delete account
  const deleteAccount = useCallback(
    async (password) => {
      try {
        await userService.deleteAccount(password);

        showSuccess("Account deleted successfully");
        return { success: true };
      } catch (error) {
        showError(error.message || "Failed to delete account");
        return { success: false, error: error.message };
      }
    },
    [showSuccess, showError]
  );

  // Get activity log
  const getActivityLog = useCallback(async (options = {}) => {
    try {
      const activities = await userService.getActivityLog(options);
      return { success: true, data: activities };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Update notification settings
  const updateNotificationSettings = useCallback(
    async (settings) => {
      try {
        const updatedUser = await userService.updateNotificationSettings(
          settings
        );

        showSuccess("Notification settings updated! 🔔");
        return { success: true, data: updatedUser };
      } catch (error) {
        showError(error.message || "Failed to update notification settings");
        return { success: false, error: error.message };
      }
    },
    [showSuccess, showError]
  );

  // Get user sessions
  const getSessions = useCallback(async () => {
    try {
      const sessions = await userService.getSessions();
      return { success: true, data: sessions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Revoke session
  const revokeSession = useCallback(
    async (sessionId) => {
      try {
        await userService.revokeSession(sessionId);

        showSuccess("Session revoked successfully! 🔒");
        return { success: true };
      } catch (error) {
        showError(error.message || "Failed to revoke session");
        return { success: false, error: error.message };
      }
    },
    [showSuccess, showError]
  );

  // Revoke all other sessions
  const revokeAllOtherSessions = useCallback(async () => {
    try {
      await userService.revokeAllOtherSessions();

      showSuccess("All other sessions revoked! 🔒");
      return { success: true };
    } catch (error) {
      showError(error.message || "Failed to revoke sessions");
      return { success: false, error: error.message };
    }
  }, [showSuccess, showError]);

  return {
    // State
    user,

    // Profile actions
    updateProfile,
    updatePreferences,
    uploadAvatar,
    deleteAvatar,

    // Data actions
    getUserStats,
    exportUserData,
    getActivityLog,

    // Account actions
    deleteAccount,

    // Settings actions
    updateNotificationSettings,

    // Session actions
    getSessions,
    revokeSession,
    revokeAllOtherSessions,
  };
};

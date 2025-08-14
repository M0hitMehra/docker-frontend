import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
import {
  addNotification,
  removeNotification,
  clearNotifications,
} from "../store/slices/uiSlice.js";

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.ui);

  // Auto-remove notifications after their duration
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);

        // Cleanup timer if component unmounts or notification changes
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  // Show success notification
  const showSuccess = useCallback(
    (message, options = {}) => {
      dispatch(
        addNotification({
          message,
          type: "success",
          duration: 3000,
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Show error notification
  const showError = useCallback(
    (message, options = {}) => {
      dispatch(
        addNotification({
          message,
          type: "error",
          duration: 5000,
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Show warning notification
  const showWarning = useCallback(
    (message, options = {}) => {
      dispatch(
        addNotification({
          message,
          type: "warning",
          duration: 4000,
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Show info notification
  const showInfo = useCallback(
    (message, options = {}) => {
      dispatch(
        addNotification({
          message,
          type: "info",
          duration: 3000,
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Show loading notification
  const showLoading = useCallback(
    (message, options = {}) => {
      dispatch(
        addNotification({
          message,
          type: "loading",
          duration: 0, // Don't auto-remove loading notifications
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Show custom notification
  const showNotification = useCallback(
    (notification) => {
      dispatch(
        addNotification({
          type: "info",
          duration: 3000,
          ...notification,
        })
      );
    },
    [dispatch]
  );

  // Remove specific notification
  const removeNotificationById = useCallback(
    (id) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  // Show notification with action button
  const showNotificationWithAction = useCallback(
    (message, actionText, actionCallback, options = {}) => {
      dispatch(
        addNotification({
          message,
          type: "info",
          duration: 0, // Don't auto-remove notifications with actions
          action: {
            text: actionText,
            callback: actionCallback,
          },
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Show undo notification
  const showUndoNotification = useCallback(
    (message, undoCallback, options = {}) => {
      dispatch(
        addNotification({
          message,
          type: "success",
          duration: 5000,
          action: {
            text: "Undo",
            callback: undoCallback,
          },
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Predefined notification messages
  const showNoteCreated = useCallback(() => {
    showSuccess("Note created successfully! 🎉");
  }, [showSuccess]);

  const showNoteUpdated = useCallback(() => {
    showSuccess("Note updated successfully! ✨");
  }, [showSuccess]);

  const showNoteDeleted = useCallback(
    (undoCallback) => {
      showUndoNotification("Note deleted! 🗑️", undoCallback);
    },
    [showUndoNotification]
  );

  const showNoteArchived = useCallback(() => {
    showSuccess("Note archived! 🗄️");
  }, [showSuccess]);

  const showNoteUnarchived = useCallback(() => {
    showSuccess("Note unarchived! 📤");
  }, [showSuccess]);

  const showNotePinned = useCallback(() => {
    showSuccess("Note pinned! 📍");
  }, [showSuccess]);

  const showNoteUnpinned = useCallback(() => {
    showSuccess("Note unpinned! 📌");
  }, [showSuccess]);

  const showLoginSuccess = useCallback(
    (userName) => {
      showSuccess(`Welcome back, ${userName}! 👋`);
    },
    [showSuccess]
  );

  const showRegisterSuccess = useCallback(
    (userName) => {
      showSuccess(`Welcome to Gorgeous Notes, ${userName}! 🎉`);
    },
    [showSuccess]
  );

  const showLogoutSuccess = useCallback(() => {
    showInfo("You have been logged out successfully. 👋");
  }, [showInfo]);

  const showNetworkError = useCallback(() => {
    showError("Network error. Please check your connection. 🌐");
  }, [showError]);

  const showAuthError = useCallback(() => {
    showError("Your session has expired. Please log in again. 🔐");
  }, [showError]);

  const showValidationError = useCallback(
    (message) => {
      showError(`Validation error: ${message} ⚠️`);
    },
    [showError]
  );

  const showSaveError = useCallback(() => {
    showError("Failed to save changes. Please try again. 💾");
  }, [showError]);

  const showLoadError = useCallback(() => {
    showError("Failed to load data. Please refresh the page. 🔄");
  }, [showError]);

  // Batch notifications for bulk operations
  const showBulkOperationSuccess = useCallback(
    (count, operation) => {
      showSuccess(`${count} notes ${operation} successfully! ✅`);
    },
    [showSuccess]
  );

  const showBulkOperationError = useCallback(
    (operation) => {
      showError(`Bulk ${operation} operation failed. Please try again. ❌`);
    },
    [showError]
  );

  // Progress notifications
  const showProgress = useCallback(
    (message, progress) => {
      dispatch(
        addNotification({
          message: `${message} (${progress}%)`,
          type: "loading",
          duration: 0,
          progress,
        })
      );
    },
    [dispatch]
  );

  // Update existing notification
  const updateNotification = useCallback(
    (id, updates) => {
      // Remove old notification and add updated one
      dispatch(removeNotification(id));
      dispatch(
        addNotification({
          id,
          ...updates,
        })
      );
    },
    [dispatch]
  );

  // Check if specific notification type exists
  const hasNotificationType = useCallback(
    (type) => {
      return notifications.some((notification) => notification.type === type);
    },
    [notifications]
  );

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter((notification) => notification.type === type);
    },
    [notifications]
  );

  return {
    // State
    notifications,

    // Basic notification actions
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showNotification,

    // Management actions
    removeNotificationById,
    clearAllNotifications,

    // Advanced notifications
    showNotificationWithAction,
    showUndoNotification,
    showProgress,
    updateNotification,

    // Predefined notifications
    showNoteCreated,
    showNoteUpdated,
    showNoteDeleted,
    showNoteArchived,
    showNoteUnarchived,
    showNotePinned,
    showNoteUnpinned,
    showLoginSuccess,
    showRegisterSuccess,
    showLogoutSuccess,
    showNetworkError,
    showAuthError,
    showValidationError,
    showSaveError,
    showLoadError,
    showBulkOperationSuccess,
    showBulkOperationError,

    // Utilities
    hasNotificationType,
    getNotificationsByType,
  };
};

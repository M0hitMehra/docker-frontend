import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "../ui/index.js";
import {
  validatePassword,
  validateConfirmPassword,
  validateRequired,
} from "../../utils/validators.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import { storageService } from "../../services/storageService.js";

const AccountSettings = ({ user, onPasswordChange, onDeleteAccount }) => {
  const { showSuccess, showError, showInfo } = useNotifications();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    const currentPasswordError = validateRequired(
      passwordData.currentPassword,
      "Current password"
    );
    if (currentPasswordError) errors.currentPassword = currentPasswordError;

    const newPasswordError = validatePassword(passwordData.newPassword);
    if (newPasswordError) errors.newPassword = newPasswordError;

    const confirmPasswordError = validateConfirmPassword(
      passwordData.newPassword,
      passwordData.confirmPassword
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    // Check if new password is different from current
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword =
        "New password must be different from current password";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    const success = await onPasswordChange?.(passwordData);

    if (success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      setShowPasswordModal(false);
    }

    setPasswordLoading(false);
  };

  const handleExportData = () => {
    try {
      const appData = storageService.exportAppData();
      const dataStr = JSON.stringify(
        {
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            preferences: user.preferences,
            createdAt: user.createdAt,
          },
          appData,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      );

      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `gorgeous-notes-profile-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess("Profile data exported successfully! 📁");
      setShowExportModal(false);
    } catch (error) {
      showError("Failed to export profile data");
    }
  };

  const handleClearCache = () => {
    try {
      // Clear app preferences but keep auth data
      storageService.removeItem("app_preferences");
      storageService.removeItem("recent_searches");
      storageService.removeDraft();

      showSuccess("Cache cleared successfully! 🧹");
    } catch (error) {
      showError("Failed to clear cache");
    }
  };

  const settingSections = [
    {
      title: "Security",
      icon: "🔐",
      items: [
        {
          title: "Change Password",
          description: "Update your account password",
          action: () => setShowPasswordModal(true),
          buttonText: "Change Password",
          variant: "primary",
        },
        {
          title: "Two-Factor Authentication",
          description: "Add an extra layer of security to your account",
          action: () => showInfo("Two-factor authentication coming soon!"),
          buttonText: "Enable 2FA",
          variant: "secondary",
          disabled: true,
        },
      ],
    },
    {
      title: "Data & Privacy",
      icon: "📊",
      items: [
        {
          title: "Export Profile Data",
          description: "Download a copy of your profile and app data",
          action: () => setShowExportModal(true),
          buttonText: "Export Data",
          variant: "secondary",
        },
        {
          title: "Clear Cache",
          description: "Clear stored preferences and temporary data",
          action: handleClearCache,
          buttonText: "Clear Cache",
          variant: "secondary",
        },
      ],
    },
    {
      title: "Account Management",
      icon: "⚠️",
      items: [
        {
          title: "Delete Account",
          description: "Permanently delete your account and all data",
          action: onDeleteAccount,
          buttonText: "Delete Account",
          variant: "danger",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {settingSections.map((section) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl backdrop-blur-xl border border-white/20 bg-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>{section.icon}</span>
            {section.title}
          </h3>

          <div className="space-y-4">
            {section.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-white/60">{item.description}</p>
                </div>

                <Button
                  variant={item.variant}
                  size="medium"
                  onClick={item.action}
                  disabled={item.disabled}
                  className="ml-4"
                >
                  {item.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="medium"
      >
        <form onSubmit={handlePasswordSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <Input
                name="currentPassword"
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                error={passwordErrors.currentPassword}
                placeholder="Enter your current password"
                fullWidth
                required
              />

              <Input
                name="newPassword"
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                error={passwordErrors.newPassword}
                placeholder="Enter your new password"
                helperText="Password must be at least 6 characters long"
                fullWidth
                required
              />

              <Input
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                error={passwordErrors.confirmPassword}
                placeholder="Confirm your new password"
                fullWidth
                required
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={passwordLoading}
              disabled={passwordLoading}
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Export Data Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Profile Data"
        size="medium"
      >
        <ModalHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Export Your Data
            </h3>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <p className="text-white/80 text-center">
              This will download a JSON file containing your profile information
              and app preferences.
            </p>

            <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
              <h4 className="font-medium text-blue-400 mb-2">
                What's included:
              </h4>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>• Profile information (name, email, preferences)</li>
                <li>• App settings and preferences</li>
                <li>• Recent searches and cached data</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> Your notes are not included in this
                export. Use the main export feature to download your notes.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExportData}>
            Export Data
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AccountSettings;

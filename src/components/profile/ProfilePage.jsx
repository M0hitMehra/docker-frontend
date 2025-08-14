import React, { useState } from "react";
import { motion } from "framer-motion";
import ProfileForm from "./ProfileForm.jsx";
import AccountSettings from "./AccountSettings.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useProfile } from "../../hooks/useProfile.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "../ui/index.js";
import { fadeInVariants } from "../../utils/animations.js";
import { formatDate } from "../../utils/dateUtils.js";

const ProfilePage = () => {
  const { user, getDisplayName, getUserInitials, changePassword } = useAuth();
  const { updateProfile, uploadAvatar, deleteAvatar, deleteAccount } =
    useProfile();
  const { showSuccess, showError } = useNotifications();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleProfileUpdate = async (profileData) => {
    const result = await updateProfile(profileData);

    if (result.success) {
      showSuccess("Profile updated successfully! ✨");
      setIsEditing(false);
      return true;
    } else {
      showError(result.error || "Failed to update profile");
      return false;
    }
  };

  const handlePasswordChange = async (passwordData) => {
    const result = await changePassword(passwordData);

    if (result.success) {
      showSuccess("Password changed successfully! 🔐");
      return true;
    } else {
      showError(result.error || "Failed to change password");
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    // This would typically require password confirmation
    // For now, we'll just show a placeholder
    showError("Account deletion requires additional confirmation");
    setShowDeleteModal(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/60">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Profile Header */}
      <div className="mb-8 p-6 rounded-2xl backdrop-blur-xl border border-white/20 bg-white/10">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
              {getUserInitials()}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-blue-600 transition-colors cursor-pointer">
              📷
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              {getDisplayName()}
            </h1>
            <p className="text-white/60 mb-2">{user.email}</p>
            <p className="text-white/40 text-sm">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>

          {/* Edit Button */}
          <Button
            variant={isEditing ? "secondary" : "primary"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 p-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white/20 text-white border border-white/30"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {isEditing ? (
              <ProfileForm
                user={user}
                onSubmit={handleProfileUpdate}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="p-6 rounded-2xl backdrop-blur-xl border border-white/20 bg-white/10">
                <h2 className="text-xl font-bold text-white mb-6">
                  Profile Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">
                      First Name
                    </label>
                    <p className="text-white text-lg">
                      {user.firstName || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">
                      Last Name
                    </label>
                    <p className="text-white text-lg">
                      {user.lastName || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">
                      Email Address
                    </label>
                    <p className="text-white text-lg">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">
                      Account Created
                    </label>
                    <p className="text-white text-lg">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Preferences */}
                {user.preferences && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-1">
                          Theme
                        </label>
                        <p className="text-white capitalize">
                          {user.preferences.theme || "Dark"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-1">
                          Default Category
                        </label>
                        <p className="text-white">
                          {user.preferences.defaultCategory || "Others"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-1">
                          Default Priority
                        </label>
                        <p className="text-white capitalize">
                          {user.preferences.defaultPriority || "Medium"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AccountSettings
              user={user}
              onPasswordChange={handlePasswordChange}
              onDeleteAccount={() => setShowDeleteModal(true)}
            />
          </motion.div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="medium"
      >
        <ModalHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Are you absolutely sure?
            </h3>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="text-center space-y-4">
            <p className="text-white/80">
              This action cannot be undone. This will permanently delete your
              account and remove all your notes from our servers.
            </p>
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm font-medium">
                All your notes, preferences, and account data will be
                permanently lost.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
};

export default ProfilePage;

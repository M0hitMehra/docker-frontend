import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Input } from "../ui/index.js";
import { validateRequired, validateEmail } from "../../utils/validators.js";
import { CATEGORIES, PRIORITIES } from "../../utils/constants.js";
import { useUI } from "../../hooks/useUI.js";

const ProfileForm = ({ user, onSubmit, onCancel, loading = false }) => {
  const { darkMode } = useUI();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    preferences: {
      theme: "dark",
      defaultCategory: "Others",
      defaultPriority: "medium",
    },
  });
  const [errors, setErrors] = useState({});

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        preferences: {
          theme: user.preferences?.theme || "dark",
          defaultCategory: user.preferences?.defaultCategory || "Others",
          defaultPriority: user.preferences?.defaultPriority || "medium",
        },
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("preferences.")) {
      const prefKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const firstNameError = validateRequired(formData.firstName, "First name");
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateRequired(formData.lastName, "Last name");
    if (lastNameError) newErrors.lastName = lastNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await onSubmit?.(formData);
    // Form will be closed by parent component on success
  };

  const handleCancel = () => {
    // Reset form to original values
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        preferences: {
          theme: user.preferences?.theme || "dark",
          defaultCategory: user.preferences?.defaultCategory || "Others",
          defaultPriority: user.preferences?.defaultPriority || "medium",
        },
      });
    }
    setErrors({});
    onCancel?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl backdrop-blur-xl border border-white/20 bg-white/10"
    >
      <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              placeholder="Enter your first name"
              fullWidth
              required
            />

            <Input
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              placeholder="Enter your last name"
              fullWidth
              required
            />
          </div>

          <div className="mt-4">
            <Input
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter your email address"
              fullWidth
              required
              helperText="This will be used for login and notifications"
            />
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Theme Preference */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Theme
              </label>
              <select
                name="preferences.theme"
                value={formData.preferences.theme}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none bg-white/10 text-white focus:border-white/40 focus:ring-2 focus:ring-white/50"
              >
                <option
                  value="dark"
                  style={{
                    background: darkMode ? "#333" : "#fff",
                    color: darkMode ? "#fff" : "#333",
                  }}
                >
                  Dark
                </option>
                <option
                  value="light"
                  style={{
                    background: darkMode ? "#333" : "#fff",
                    color: darkMode ? "#fff" : "#333",
                  }}
                >
                  Light
                </option>
              </select>
            </div>

            {/* Default Category */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Default Category
              </label>
              <select
                name="preferences.defaultCategory"
                value={formData.preferences.defaultCategory}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none bg-white/10 text-white focus:border-white/40 focus:ring-2 focus:ring-white/50"
              >
                {CATEGORIES.slice(1).map((category) => (
                  <option
                    key={category}
                    value={category}
                    style={{
                      background: darkMode ? "#333" : "#fff",
                      color: darkMode ? "#fff" : "#333",
                    }}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Priority */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Default Priority
              </label>
              <select
                name="preferences.defaultPriority"
                value={formData.preferences.defaultPriority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none bg-white/10 text-white focus:border-white/40 focus:ring-2 focus:ring-white/50"
              >
                {PRIORITIES.slice(1).map((priority) => (
                  <option
                    key={priority}
                    value={priority}
                    style={{
                      background: darkMode ? "#333" : "#fff",
                      color: darkMode ? "#fff" : "#333",
                    }}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-white/10">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="large"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProfileForm;

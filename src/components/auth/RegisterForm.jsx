import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input } from "../ui/index.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
} from "../../utils/validators.js";
import { fadeInVariants } from "../../utils/animations.js";

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const { register, loading, error, clearAuthError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear auth error when user starts typing
    if (error) {
      clearAuthError();
    }
  };

  const validateForm = () => {
    const errors = {};

    const firstNameError = validateRequired(formData.firstName, "First name");
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateRequired(formData.lastName, "Last name");
    if (lastNameError) errors.lastName = lastNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      onSuccess?.(result.data);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-white/60">Join us and start organizing your notes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            name="firstName"
            label="First Name"
            placeholder="John"
            value={formData.firstName}
            onChange={handleInputChange}
            error={formErrors.firstName}
            fullWidth
          />
          <Input
            type="text"
            name="lastName"
            label="Last Name"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleInputChange}
            error={formErrors.lastName}
            fullWidth
          />
        </div>

        {/* Email Field */}
        <Input
          type="email"
          name="email"
          label="Email Address"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleInputChange}
          error={formErrors.email}
          fullWidth
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          }
        />

        {/* Password Field */}
        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          label="Password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleInputChange}
          error={formErrors.password}
          helperText="Password must be at least 6 characters long"
          fullWidth
          icon={
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-white/60 hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          }
          iconPosition="right"
        />

        {/* Confirm Password Field */}
        <Input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={formErrors.confirmPassword}
          fullWidth
          icon={
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="text-white/60 hover:text-white transition-colors"
            >
              {showConfirmPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          }
          iconPosition="right"
        />

        {/* Auth Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-red-500/20 border border-red-500/30"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Terms and Conditions */}
        <div className="text-xs text-white/60">
          By creating an account, you agree to our{" "}
          <button
            type="button"
            className="text-white hover:text-purple-300 underline"
            onClick={() => {
              // TODO: Show terms modal
              console.log("Terms clicked");
            }}
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="text-white hover:text-purple-300 underline"
            onClick={() => {
              // TODO: Show privacy modal
              console.log("Privacy clicked");
            }}
          >
            Privacy Policy
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        {/* Switch to Login */}
        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-white/60 text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-white hover:text-purple-300 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default RegisterForm;

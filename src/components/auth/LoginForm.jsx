import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input } from "../ui/index.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useRememberMe } from "../../hooks/useRememberMe.js";
import { validateEmail, validatePassword } from "../../utils/validators.js";
import { fadeInVariants } from "../../utils/animations.js";

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { login, loading, error, clearAuthError } = useAuth();
  const { rememberMe, setRememberMe } = useRememberMe();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Set remember me preference before login
    setRememberMe(rememberMe);

    const result = await login(formData);

    if (result.success) {
      onSuccess?.(result.data);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-white/60">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <Input
          type="email"
          name="email"
          label="Email Address"
          placeholder="Enter your email"
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
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          error={formErrors.password}
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

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-white/80">
            Remember me for 30 days
          </label>
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
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        {/* Forgot Password Link */}
        <div className="text-center">
          <button
            type="button"
            className="text-white/60 hover:text-white text-sm transition-colors"
            onClick={() => {
              // TODO: Implement forgot password functionality
              console.log("Forgot password clicked");
            }}
          >
            Forgot your password?
          </button>
        </div>

        {/* Switch to Register */}
        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-white/60 text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-white hover:text-purple-300 font-medium transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default LoginForm;

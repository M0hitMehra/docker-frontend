import React from "react";
import { motion } from "framer-motion";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = "left",
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 focus:ring-purple-500",
    secondary:
      "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 focus:ring-white/50",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-red-500",
    success:
      "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 focus:ring-green-500",
    warning:
      "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 focus:ring-yellow-500",
    ghost: "text-white hover:bg-white/10 focus:ring-white/50",
    outline:
      "border-2 border-white/30 text-white hover:bg-white/10 focus:ring-white/50",
  };

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  const disabledClasses = "opacity-50 cursor-not-allowed";
  const fullWidthClasses = fullWidth ? "w-full" : "";

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled || loading ? disabledClasses : ""}
    ${fullWidthClasses}
    ${className}
  `.trim();

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full ${
            iconPosition === "right" ? "ml-2" : "mr-2"
          }`}
        />
      );
    }

    if (icon) {
      return (
        <span className={iconPosition === "right" ? "ml-2" : "mr-2"}>
          {icon}
        </span>
      );
    }

    return null;
  };

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      {...props}
    >
      {iconPosition === "left" && renderIcon()}
      {loading ? "Loading..." : children}
      {iconPosition === "right" && renderIcon()}
    </motion.button>
  );
};

export default Button;

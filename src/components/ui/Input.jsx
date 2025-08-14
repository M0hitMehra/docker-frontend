import React, { forwardRef } from "react";
import { motion } from "framer-motion";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = "left",
      variant = "default",
      size = "medium",
      fullWidth = false,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-xl";

    const variantClasses = {
      default:
        "bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-white/40 focus:ring-white/50",
      filled:
        "bg-white/20 border-transparent text-white placeholder-white/60 focus:bg-white/30 focus:ring-white/50",
      outlined:
        "bg-transparent border-white/30 text-white placeholder-white/60 focus:border-white/60 focus:ring-white/50",
    };

    const sizeClasses = {
      small: "px-3 py-2 text-sm",
      medium: "px-4 py-3 text-base",
      large: "px-5 py-4 text-lg",
    };

    const errorClasses = error
      ? "border-red-400 focus:border-red-400 focus:ring-red-400"
      : "";

    const iconClasses = icon
      ? iconPosition === "left"
        ? "pl-12"
        : "pr-12"
      : "";

    const fullWidthClasses = fullWidth ? "w-full" : "";

    const inputClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${errorClasses}
    ${iconClasses}
    ${fullWidthClasses}
    ${className}
  `.trim();

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-white/80 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div
              className={`absolute inset-y-0 ${
                iconPosition === "left" ? "left-0" : "right-0"
              } flex items-center ${
                iconPosition === "left" ? "pl-4" : "pr-4"
              } pointer-events-none`}
            >
              <span className="text-white/60">{icon}</span>
            </div>
          )}

          <motion.input
            ref={ref}
            className={inputClasses}
            whileFocus={{ scale: 1.01 }}
            {...props}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-white/60">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

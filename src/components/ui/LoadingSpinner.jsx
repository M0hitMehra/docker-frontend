import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = ({
  size = "medium",
  color = "white",
  className = "",
  text = "",
  fullScreen = false,
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
    xlarge: "w-16 h-16",
  };

  const colorClasses = {
    white: "text-white",
    primary: "text-purple-500",
    secondary: "text-gray-500",
    success: "text-green-500",
    danger: "text-red-500",
    warning: "text-yellow-500",
  };

  const spinnerClasses = `
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${className}
  `.trim();

  const Spinner = () => (
    <motion.svg
      className={spinnerClasses}
      fill="none"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );

  const PulsingDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`w-2 h-2 rounded-full ${colorClasses[color]} bg-current`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );

  const BouncingBalls = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`w-3 h-3 rounded-full ${colorClasses[color]} bg-current`}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );

  const WaveLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={`w-1 h-8 ${colorClasses[color]} bg-current rounded-full`}
          animate={{
            scaleY: [1, 2, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Spinner />
      {text && (
        <motion.p
          className={`text-sm ${colorClasses[color]} font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Different spinner variants
export const SpinnerVariants = {
  circular: LoadingSpinner,
  dots: ({ size = "medium", color = "white", className = "", text = "" }) => (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full bg-current ${
              color === "white" ? "text-white" : `text-${color}-500`
            }`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
      {text && <p className="text-sm text-white/80">{text}</p>}
    </div>
  ),
  bouncing: ({
    size = "medium",
    color = "white",
    className = "",
    text = "",
  }) => (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-full bg-current ${
              color === "white" ? "text-white" : `text-${color}-500`
            }`}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.1,
            }}
          />
        ))}
      </div>
      {text && <p className="text-sm text-white/80">{text}</p>}
    </div>
  ),
  wave: ({ size = "medium", color = "white", className = "", text = "" }) => (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className={`w-1 h-8 bg-current rounded-full ${
              color === "white" ? "text-white" : `text-${color}-500`
            }`}
            animate={{
              scaleY: [1, 2, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.1,
            }}
          />
        ))}
      </div>
      {text && <p className="text-sm text-white/80">{text}</p>}
    </div>
  ),
};

export default LoadingSpinner;

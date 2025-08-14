import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button.jsx";
import {
  getErrorMessage,
  getErrorSeverity,
  ERROR_SEVERITY,
} from "../../utils/errorHandler.js";

const ErrorNotification = ({
  error,
  onClose,
  onRetry,
  showDetails = false,
  autoClose = true,
  duration = 5000,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const severity = getErrorSeverity(error);
  const message = getErrorMessage(error);

  // Auto close for low severity errors
  React.useEffect(() => {
    if (autoClose && severity === ERROR_SEVERITY.LOW) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, severity, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const getSeverityStyles = () => {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
        return {
          bg: "bg-red-500/20",
          border: "border-red-500/50",
          text: "text-red-400",
          icon: "🚨",
        };
      case ERROR_SEVERITY.HIGH:
        return {
          bg: "bg-orange-500/20",
          border: "border-orange-500/50",
          text: "text-orange-400",
          icon: "⚠️",
        };
      case ERROR_SEVERITY.MEDIUM:
        return {
          bg: "bg-yellow-500/20",
          border: "border-yellow-500/50",
          text: "text-yellow-400",
          icon: "⚡",
        };
      default:
        return {
          bg: "bg-blue-500/20",
          border: "border-blue-500/50",
          text: "text-blue-400",
          icon: "ℹ️",
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={`
            fixed top-4 right-4 z-50 max-w-md w-full
            ${styles.bg} ${styles.border} backdrop-blur-xl
            border rounded-xl p-4 shadow-lg
          `}
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="text-2xl">{styles.icon}</div>

            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold ${styles.text} mb-1`}>
                {severity === ERROR_SEVERITY.CRITICAL
                  ? "Critical Error"
                  : severity === ERROR_SEVERITY.HIGH
                  ? "Error"
                  : severity === ERROR_SEVERITY.MEDIUM
                  ? "Warning"
                  : "Notice"}
              </h4>

              <p className="text-white/80 text-sm leading-relaxed">{message}</p>

              {/* Error Code */}
              {error.code && (
                <p className="text-white/50 text-xs mt-1 font-mono">
                  Code: {error.code}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors p-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            {onRetry && (
              <Button
                variant="outline"
                size="small"
                onClick={onRetry}
                className="text-xs"
              >
                Try Again
              </Button>
            )}

            {showDetails && error.stack && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                {isExpanded ? "Hide Details" : "Show Details"}
              </Button>
            )}

            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                // Copy error details to clipboard
                const errorDetails = `
Error: ${error.message}
Code: ${error.code || "N/A"}
Time: ${new Date().toISOString()}
URL: ${window.location.href}
${error.stack ? `\nStack: ${error.stack}` : ""}
                `.trim();

                navigator.clipboard.writeText(errorDetails).then(() => {
                  // Could show a small toast here
                });
              }}
              className="text-xs"
            >
              Copy Details
            </Button>
          </div>

          {/* Expandable Error Details */}
          <AnimatePresence>
            {isExpanded && error.stack && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <h5 className="text-white/70 text-xs font-semibold mb-2">
                  Technical Details:
                </h5>
                <pre className="text-white/60 text-xs bg-black/20 p-3 rounded-lg overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bar for Auto-close */}
          {autoClose && severity === ERROR_SEVERITY.LOW && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorNotification;

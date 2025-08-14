import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants, fadeInVariants } from "../../utils/animations.js";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = "",
  overlayClassName = "",
}) => {
  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
    xlarge: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm ${overlayClassName}`}
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlayClick}
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className={`
                relative w-full ${sizeClasses[size]} 
                bg-white/10 backdrop-blur-xl border border-white/20 
                rounded-2xl shadow-2xl
                ${className}
              `}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  {title && (
                    <h2 className="text-xl font-semibold text-white">
                      {title}
                    </h2>
                  )}

                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                      aria-label="Close modal"
                    >
                      <svg
                        className="w-5 h-5 text-white/60"
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
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Modal Header Component
export const ModalHeader = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

// Modal Body Component
export const ModalBody = ({ children, className = "" }) => (
  <div className={`mb-6 ${className}`}>{children}</div>
);

// Modal Footer Component
export const ModalFooter = ({ children, className = "" }) => (
  <div
    className={`flex items-center justify-end space-x-3 pt-4 border-t border-white/10 ${className}`}
  >
    {children}
  </div>
);

export default Modal;

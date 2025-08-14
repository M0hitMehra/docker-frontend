import { useCallback } from "react";
import { useError } from "../contexts/ErrorContext.jsx";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  ValidationError,
  createErrorContext,
} from "../utils/errorHandler.js";

export const useErrorHandler = (componentName) => {
  const { addError } = useError();

  // Handle different types of errors
  const handleError = useCallback(
    (error, action = "unknown", options = {}) => {
      const context = createErrorContext(componentName, action);

      // Add retry action if provided
      const errorOptions = {
        context: { ...context, ...options.context },
        retryAction: options.retryAction,
        showDetails: options.showDetails || false,
        autoClose: options.autoClose !== false,
        duration: options.duration || 5000,
      };

      addError(error, errorOptions);
    },
    [addError, componentName]
  );

  // Specific error handlers
  const handleAuthError = useCallback(
    (error, retryAction) => {
      handleError(error, "authentication", {
        retryAction,
        showDetails: false,
        autoClose: false,
      });
    },
    [handleError]
  );

  const handleNetworkError = useCallback(
    (error, retryAction) => {
      handleError(error, "network", {
        retryAction,
        showDetails: false,
        autoClose: false,
      });
    },
    [handleError]
  );

  const handleValidationError = useCallback(
    (error) => {
      handleError(error, "validation", {
        showDetails: true,
        autoClose: true,
        duration: 8000,
      });
    },
    [handleError]
  );

  const handleApiError = useCallback(
    (error, action, retryAction) => {
      // Route to specific handlers based on error type
      if (
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError
      ) {
        handleAuthError(error, retryAction);
      } else if (error instanceof NetworkError) {
        handleNetworkError(error, retryAction);
      } else if (error instanceof ValidationError) {
        handleValidationError(error);
      } else {
        handleError(error, action, { retryAction });
      }
    },
    [handleError, handleAuthError, handleNetworkError, handleValidationError]
  );

  // Async operation wrapper with error handling
  const withErrorHandling = useCallback(
    (asyncOperation, action = "operation", options = {}) => {
      return async (...args) => {
        try {
          return await asyncOperation(...args);
        } catch (error) {
          handleApiError(error, action, options.retryAction);

          // Re-throw if specified
          if (options.rethrow) {
            throw error;
          }

          return options.fallbackValue || null;
        }
      };
    },
    [handleApiError]
  );

  // Form submission error handler
  const handleFormError = useCallback(
    (error, formName) => {
      if (error instanceof ValidationError) {
        // Return validation errors for form handling
        return {
          hasErrors: true,
          errors: error.errors || {},
          message: error.message,
        };
      } else {
        handleApiError(error, `form_${formName}`);
        return {
          hasErrors: true,
          errors: {},
          message: error.message,
        };
      }
    },
    [handleApiError]
  );

  // Batch operation error handler
  const handleBatchError = useCallback(
    (errors, action) => {
      if (Array.isArray(errors)) {
        errors.forEach((error, index) => {
          handleError(error, `${action}_item_${index}`);
        });
      } else {
        handleError(errors, action);
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAuthError,
    handleNetworkError,
    handleValidationError,
    handleApiError,
    handleFormError,
    handleBatchError,
    withErrorHandling,
  };
};

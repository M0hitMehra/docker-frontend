// Global error handling utilities

export class AppError extends Error {
  constructor(
    message,
    code = "UNKNOWN_ERROR",
    statusCode = 500,
    isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NetworkError extends AppError {
  constructor(message = "Network error occurred") {
    super(message, "NETWORK_ERROR", 0);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, "AUTH_ERROR", 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, "AUTHORIZATION_ERROR", 403);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = []) {
    super(message, "VALIDATION_ERROR", 422);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, "NOT_FOUND_ERROR", 404);
  }
}

export class ServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, "SERVER_ERROR", 500);
  }
}

// Error type detection
export const getErrorType = (error) => {
  if (error instanceof AppError) {
    return error.code;
  }

  if (error.name === "TypeError" || error.name === "ReferenceError") {
    return "CLIENT_ERROR";
  }

  if (error.message?.includes("fetch")) {
    return "NETWORK_ERROR";
  }

  return "UNKNOWN_ERROR";
};

// User-friendly error messages
export const getErrorMessage = (error) => {
  if (error instanceof AppError) {
    return error.message;
  }

  const errorType = getErrorType(error);

  switch (errorType) {
    case "NETWORK_ERROR":
      return "Unable to connect to the server. Please check your internet connection and try again.";
    case "AUTH_ERROR":
      return "Your session has expired. Please log in again.";
    case "AUTHORIZATION_ERROR":
      return "You don't have permission to perform this action.";
    case "VALIDATION_ERROR":
      return "Please check your input and try again.";
    case "NOT_FOUND_ERROR":
      return "The requested resource was not found.";
    case "SERVER_ERROR":
      return "Something went wrong on our end. Please try again later.";
    case "CLIENT_ERROR":
      return "Something went wrong. Please refresh the page and try again.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const getErrorSeverity = (error) => {
  if (error instanceof AppError) {
    switch (error.code) {
      case "AUTH_ERROR":
      case "AUTHORIZATION_ERROR":
        return ERROR_SEVERITY.HIGH;
      case "SERVER_ERROR":
        return ERROR_SEVERITY.CRITICAL;
      case "NETWORK_ERROR":
        return ERROR_SEVERITY.MEDIUM;
      case "VALIDATION_ERROR":
      case "NOT_FOUND_ERROR":
        return ERROR_SEVERITY.LOW;
      default:
        return ERROR_SEVERITY.MEDIUM;
    }
  }

  return ERROR_SEVERITY.MEDIUM;
};

// Error logging
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    code: error.code || "UNKNOWN",
    severity: getErrorSeverity(error),
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error logged:", errorInfo);
  }

  // Store in localStorage for debugging
  try {
    const existingLogs = JSON.parse(localStorage.getItem("error_logs") || "[]");
    existingLogs.push(errorInfo);
    // Keep only last 50 errors
    const recentLogs = existingLogs.slice(-50);
    localStorage.setItem("error_logs", JSON.stringify(recentLogs));
  } catch (e) {
    console.error("Failed to store error log:", e);
  }

  // In production, you would send this to your error reporting service
  if (process.env.NODE_ENV === "production") {
    // Example: Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: errorInfo });
  }
};

// Retry mechanism for failed operations
export const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry certain types of errors
      if (
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError ||
        error instanceof ValidationError
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    logError(event.reason, { type: "unhandledrejection" });

    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    console.error("Uncaught error:", event.error);
    logError(event.error, {
      type: "uncaught",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
};

// Error recovery utilities
export const recoverFromError = (error, fallbackAction) => {
  logError(error, { recovery: "attempted" });

  if (typeof fallbackAction === "function") {
    try {
      return fallbackAction();
    } catch (fallbackError) {
      logError(fallbackError, { recovery: "failed" });
      throw fallbackError;
    }
  }

  throw error;
};

// Error context provider
export const createErrorContext = (component, action) => ({
  component,
  action,
  timestamp: new Date().toISOString(),
  userId: localStorage.getItem("user_data")
    ? JSON.parse(localStorage.getItem("user_data")).id
    : null,
});

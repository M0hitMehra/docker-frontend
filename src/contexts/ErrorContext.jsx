import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import ErrorNotification from "../components/ui/ErrorNotification.jsx";
import {
  logError,
  getErrorSeverity,
  ERROR_SEVERITY,
} from "../utils/errorHandler.js";

// Error context
const ErrorContext = createContext();

// Error action types
const ERROR_ACTIONS = {
  ADD_ERROR: "ADD_ERROR",
  REMOVE_ERROR: "REMOVE_ERROR",
  CLEAR_ERRORS: "CLEAR_ERRORS",
  SET_GLOBAL_ERROR: "SET_GLOBAL_ERROR",
  CLEAR_GLOBAL_ERROR: "CLEAR_GLOBAL_ERROR",
};

// Error reducer
const errorReducer = (state, action) => {
  switch (action.type) {
    case ERROR_ACTIONS.ADD_ERROR:
      return {
        ...state,
        errors: [...state.errors, action.payload],
      };

    case ERROR_ACTIONS.REMOVE_ERROR:
      return {
        ...state,
        errors: state.errors.filter((error) => error.id !== action.payload),
      };

    case ERROR_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: [],
      };

    case ERROR_ACTIONS.SET_GLOBAL_ERROR:
      return {
        ...state,
        globalError: action.payload,
      };

    case ERROR_ACTIONS.CLEAR_GLOBAL_ERROR:
      return {
        ...state,
        globalError: null,
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  errors: [],
  globalError: null,
};

// Error provider component
export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Add error
  const addError = useCallback((error, options = {}) => {
    const errorId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);
    const severity = getErrorSeverity(error);

    const errorItem = {
      id: errorId,
      error,
      severity,
      timestamp: new Date().toISOString(),
      context: options.context || {},
      retryAction: options.retryAction,
      showDetails: options.showDetails || false,
      autoClose: options.autoClose !== false, // Default to true
      duration: options.duration || 5000,
    };

    // Log the error
    logError(error, options.context);

    // For critical errors, set as global error instead of notification
    if (severity === ERROR_SEVERITY.CRITICAL) {
      dispatch({
        type: ERROR_ACTIONS.SET_GLOBAL_ERROR,
        payload: errorItem,
      });
    } else {
      dispatch({
        type: ERROR_ACTIONS.ADD_ERROR,
        payload: errorItem,
      });
    }

    return errorId;
  }, []);

  // Remove error
  const removeError = useCallback((errorId) => {
    dispatch({
      type: ERROR_ACTIONS.REMOVE_ERROR,
      payload: errorId,
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({ type: ERROR_ACTIONS.CLEAR_ERRORS });
  }, []);

  // Clear global error
  const clearGlobalError = useCallback(() => {
    dispatch({ type: ERROR_ACTIONS.CLEAR_GLOBAL_ERROR });
  }, []);

  // Handle retry action
  const handleRetry = useCallback(
    async (errorItem) => {
      if (errorItem.retryAction) {
        try {
          await errorItem.retryAction();
          removeError(errorItem.id);
        } catch (retryError) {
          // Replace with new error
          removeError(errorItem.id);
          addError(retryError, {
            context: { ...errorItem.context, retry: true },
          });
        }
      }
    },
    [addError, removeError]
  );

  const value = {
    errors: state.errors,
    globalError: state.globalError,
    addError,
    removeError,
    clearErrors,
    clearGlobalError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}

      {/* Render error notifications */}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
        {state.errors.map((errorItem) => (
          <ErrorNotification
            key={errorItem.id}
            error={errorItem.error}
            onClose={() => removeError(errorItem.id)}
            onRetry={
              errorItem.retryAction ? () => handleRetry(errorItem) : undefined
            }
            showDetails={errorItem.showDetails}
            autoClose={errorItem.autoClose}
            duration={errorItem.duration}
          />
        ))}
      </div>

      {/* Global error overlay */}
      {state.globalError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full mx-4">
            <ErrorNotification
              error={state.globalError.error}
              onClose={clearGlobalError}
              onRetry={
                state.globalError.retryAction
                  ? () => handleRetry(state.globalError)
                  : undefined
              }
              showDetails={true}
              autoClose={false}
            />
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
};

// Hook to use error context
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

// Higher-order component for error handling
export const withErrorHandling = (Component, defaultErrorHandler) => {
  return function ErrorHandledComponent(props) {
    const { addError } = useError();

    const handleError = (error, context = {}) => {
      if (defaultErrorHandler) {
        defaultErrorHandler(error, context, addError);
      } else {
        addError(error, { context });
      }
    };

    return <Component {...props} onError={handleError} />;
  };
};

// Error boundary hook
export const useErrorBoundary = () => {
  const { addError } = useError();

  return useCallback(
    (error, errorInfo) => {
      addError(error, {
        context: {
          type: "boundary",
          componentStack: errorInfo?.componentStack,
        },
        showDetails: true,
        autoClose: false,
      });
    },
    [addError]
  );
};

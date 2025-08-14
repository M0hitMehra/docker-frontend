import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/index.js";
import { Layout } from "./components/layout/index.js";
import {
  AuthLayout,
  ProtectedRoute,
  RequireGuest,
  NavigationGuard,
} from "./components/auth/index.js";
import { ProfilePage } from "./components/profile/index.js";
import { Notification as NotificationContainer } from "./components/ui/index.js";
import { DocumentTitle, ErrorBoundary } from "./components/common/index.js";
import { ErrorProvider } from "./contexts/ErrorContext.jsx";
import { setupGlobalErrorHandlers } from "./utils/errorHandler.js";
import { logPerformanceMetrics } from "./utils/performance.jsx";
import { runStartupChecks } from "./utils/integrationCheck.js";
import { initializeFinalOptimizations } from "./utils/finalOptimizations.js";
// Lazy load pages for better performance
const LazyNotesPage = React.lazy(() => import("./pages/NotesPage.jsx"));
const LazyProfilePage = React.lazy(() =>
  import("./components/profile/ProfilePage.jsx")
);
const LazyAuthLayout = React.lazy(() =>
  import("./components/auth/AuthLayout.jsx")
);
import { useAuth } from "./hooks/useAuth.js";
import { useUI } from "./hooks/useUI.js";
import { ROUTES } from "./utils/constants.js";

// Main App Content Component
const AppContent = () => {
  const { isAuthenticated, loading, initialized } = useAuth();
  const { loadUIPreferences } = useUI();

  // Initialize UI preferences on app load
  useEffect(() => {
    if (initialized) {
      loadUIPreferences();
    }
  }, [loadUIPreferences, initialized]);

  // Show loading screen while initializing authentication
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">✨</div>
          <h1 className="text-2xl font-bold text-white mb-2">Gorgeous Notes</h1>
          <p className="text-white/60 mb-4">Loading your beautiful notes...</p>
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <DocumentTitle />
      <NavigationGuard>
        <Routes>
          {/* Public Routes */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <RequireGuest redirectTo={ROUTES.HOME}>
                <React.Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                      <div className="text-center">
                        <div className="text-6xl mb-4 animate-pulse">🔐</div>
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    </div>
                  }
                >
                  <LazyAuthLayout />
                </React.Suspense>
              </RequireGuest>
            }
          />

          <Route
            path={ROUTES.REGISTER}
            element={
              <RequireGuest redirectTo={ROUTES.HOME}>
                <React.Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                      <div className="text-center">
                        <div className="text-6xl mb-4 animate-pulse">🔐</div>
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    </div>
                  }
                >
                  <LazyAuthLayout />
                </React.Suspense>
              </RequireGuest>
            }
          />

          {/* Protected Routes */}
          <Route
            path={ROUTES.HOME}
            element={
              <ProtectedRoute>
                <Layout>
                  <React.Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <div className="text-center">
                          <div className="text-6xl mb-4 animate-pulse">📝</div>
                          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                      </div>
                    }
                  >
                    <LazyNotesPage />
                  </React.Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.NOTES}
            element={
              <ProtectedRoute>
                <Layout>
                  <React.Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <div className="text-center">
                          <div className="text-6xl mb-4 animate-pulse">📝</div>
                          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                      </div>
                    }
                  >
                    <LazyNotesPage />
                  </React.Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <Layout>
                  <React.Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <div className="text-center">
                          <div className="text-6xl mb-4 animate-pulse">👤</div>
                          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                      </div>
                    }
                  >
                    <LazyProfilePage />
                  </React.Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to appropriate page */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={ROUTES.HOME} replace />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Page Not Found
                  </h1>
                  <p className="text-white/60 mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            }
          />
        </Routes>

        {/* Global Notification Container */}
        <NotificationContainer />
      </NavigationGuard>
    </Router>
  );
};

// Main App Component
const App = () => {
  // Setup global error handlers, performance monitoring, and final optimizations
  React.useEffect(() => {
    setupGlobalErrorHandlers();
    initializeFinalOptimizations();

    // Run startup checks and log performance metrics in development
    if (process.env.NODE_ENV === "development") {
      setTimeout(async () => {
        await runStartupChecks();
        logPerformanceMetrics();
      }, 2000);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ErrorProvider>
          <AppContent />
        </ErrorProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;

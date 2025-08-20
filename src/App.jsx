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
import { Notification as NotificationContainer } from "./components/ui/index.js";
import { DocumentTitle, ErrorBoundary } from "./components/common/index.js";
import { ErrorProvider } from "./contexts/ErrorContext.jsx";
import { setupGlobalErrorHandlers } from "./utils/errorHandler.js";
// Temporarily disabled to fix console errors
// import { logPerformanceMetrics } from "./utils/performance.jsx";
// import { runStartupChecks } from "./utils/integrationCheck.js";
// import { initializeFinalOptimizations } from "./utils/finalOptimizations.js";

// Simple Auth System
import { SimpleAuthProvider } from "./contexts/SimpleAuthContext.jsx";
import SimpleProtectedRoute, {
  SimpleGuestRoute,
} from "./components/SimpleProtectedRoute.jsx";

// Lazy load pages for better performance
const LazyNotesPage = React.lazy(() => import("./pages/NotesPage.jsx"));
const LazyProfilePage = React.lazy(() =>
  import("./components/profile/ProfilePage.jsx")
);
const LazyAuthLayout = React.lazy(() =>
  import("./components/auth/AuthLayout.jsx")
);

import { useUI } from "./hooks/useUI.js";
import { ROUTES } from "./utils/constants.js";

// Main App Content Component
const AppContent = () => {
  const { loadUIPreferences } = useUI();

  // Initialize UI preferences on app load
  useEffect(() => {
    loadUIPreferences();
  }, [loadUIPreferences]);

  return (
    // return (
    //   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
    //     <div className="text-center">
    //       <div className="text-6xl mb-4 animate-pulse">✨</div>
    //       <h1 className="text-2xl font-bold text-white mb-2">Gorgeous Notes</h1>
    //       <p className="text-white/60 mb-4">Loading your beautiful notes...</p>
    //       <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
    //     </div>
    //   </div>
    // );

    <Router>
      <DocumentTitle />
      <Routes>
        {/* Public Routes */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <SimpleGuestRoute redirectTo={ROUTES.HOME}>
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
            </SimpleGuestRoute>
          }
        />

        <Route
          path={ROUTES.REGISTER}
          element={
            <SimpleGuestRoute redirectTo={ROUTES.HOME}>
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
            </SimpleGuestRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path={ROUTES.HOME}
          element={
            <SimpleProtectedRoute>
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
            </SimpleProtectedRoute>
          }
        />

        <Route
          path={ROUTES.NOTES}
          element={
            <SimpleProtectedRoute>
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
            </SimpleProtectedRoute>
          }
        />

        <Route
          path={ROUTES.PROFILE}
          element={
            <SimpleProtectedRoute>
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
            </SimpleProtectedRoute>
          }
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

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
    </Router>
  );
};

// Main App Component
const App = () => {
  // Setup global error handlers
  React.useEffect(() => {
    setupGlobalErrorHandlers();

    // Skip problematic performance monitoring for now
    // initializeFinalOptimizations();

    // Skip startup checks that might cause console errors
    // if (process.env.NODE_ENV === "development") {
    //   setTimeout(async () => {
    //     await runStartupChecks();
    //     logPerformanceMetrics();
    //   }, 2000);
    // }
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SimpleAuthProvider>
          <ErrorProvider>
            <AppContent />
          </ErrorProvider>
        </SimpleAuthProvider>
      </Provider>
    </ErrorBoundary>
  );
};
export default App;

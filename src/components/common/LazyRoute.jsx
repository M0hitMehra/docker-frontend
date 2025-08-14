import React, { Suspense } from "react";
import { LoadingSpinner } from "../ui/index.js";

// Higher-order component for lazy loading routes
export const LazyRoute = ({
  component: Component,
  fallback,
  errorBoundary = true,
  ...props
}) => {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <LoadingSpinner size="large" text="Loading..." color="white" />
    </div>
  );

  const LoadingComponent = fallback || defaultFallback;

  return (
    <Suspense fallback={LoadingComponent}>
      <Component {...props} />
    </Suspense>
  );
};

// Utility function to create lazy route components
export const createLazyRoute = (importFn, options = {}) => {
  const LazyComponent = React.lazy(importFn);

  return (props) => (
    <LazyRoute component={LazyComponent} {...options} {...props} />
  );
};

// Pre-built lazy route components
export const LazyNotesPage = createLazyRoute(
  () => import("../../pages/NotesPage.jsx"),
  {
    fallback: (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📝</div>
          <LoadingSpinner
            size="large"
            text="Loading your notes..."
            color="white"
          />
        </div>
      </div>
    ),
  }
);

export const LazyProfilePage = createLazyRoute(
  () => import("../profile/ProfilePage.jsx"),
  {
    fallback: (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">👤</div>
          <LoadingSpinner
            size="large"
            text="Loading profile..."
            color="white"
          />
        </div>
      </div>
    ),
  }
);

export const LazyAuthLayout = createLazyRoute(
  () => import("../auth/AuthLayout.jsx"),
  {
    fallback: (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔐</div>
          <LoadingSpinner
            size="large"
            text="Loading authentication..."
            color="white"
          />
        </div>
      </div>
    ),
  }
);

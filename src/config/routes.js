import { ROUTES } from "../utils/constants.js";

// Route configuration with metadata
export const routeConfig = {
  [ROUTES.LOGIN]: {
    path: ROUTES.LOGIN,
    name: "Login",
    title: "Sign In - Gorgeous Notes",
    description: "Sign in to your Gorgeous Notes account",
    requiresAuth: false,
    requiresGuest: true,
    showInNavigation: false,
    meta: {
      layout: "auth",
      theme: "dark",
    },
  },
  [ROUTES.REGISTER]: {
    path: ROUTES.REGISTER,
    name: "Register",
    title: "Sign Up - Gorgeous Notes",
    description: "Create your Gorgeous Notes account",
    requiresAuth: false,
    requiresGuest: true,
    showInNavigation: false,
    meta: {
      layout: "auth",
      theme: "dark",
    },
  },
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    name: "Home",
    title: "Home - Gorgeous Notes",
    description: "Your beautiful notes dashboard",
    requiresAuth: true,
    requiresGuest: false,
    showInNavigation: true,
    icon: "home",
    meta: {
      layout: "app",
      theme: "dark",
    },
  },
  [ROUTES.NOTES]: {
    path: ROUTES.NOTES,
    name: "Notes",
    title: "Notes - Gorgeous Notes",
    description: "Manage your gorgeous notes",
    requiresAuth: true,
    requiresGuest: false,
    showInNavigation: true,
    icon: "notes",
    meta: {
      layout: "app",
      theme: "dark",
    },
  },
  [ROUTES.PROFILE]: {
    path: ROUTES.PROFILE,
    name: "Profile",
    title: "Profile - Gorgeous Notes",
    description: "Manage your account settings",
    requiresAuth: true,
    requiresGuest: false,
    showInNavigation: true,
    icon: "user",
    meta: {
      layout: "app",
      theme: "dark",
    },
  },
};

// Helper functions
export const getRouteConfig = (path) => {
  return routeConfig[path] || null;
};

export const getNavigationRoutes = () => {
  return Object.values(routeConfig).filter((route) => route.showInNavigation);
};

export const getPublicRoutes = () => {
  return Object.values(routeConfig).filter((route) => !route.requiresAuth);
};

export const getProtectedRoutes = () => {
  return Object.values(routeConfig).filter((route) => route.requiresAuth);
};

export const isPublicRoute = (path) => {
  const config = getRouteConfig(path);
  return config ? !config.requiresAuth : false;
};

export const isProtectedRoute = (path) => {
  const config = getRouteConfig(path);
  return config ? config.requiresAuth : false;
};

export const requiresGuest = (path) => {
  const config = getRouteConfig(path);
  return config ? config.requiresGuest : false;
};

// Route metadata helpers
export const getRouteTitle = (path) => {
  const config = getRouteConfig(path);
  return config ? config.title : "Gorgeous Notes";
};

export const getRouteDescription = (path) => {
  const config = getRouteConfig(path);
  return config ? config.description : "Beautiful note-taking application";
};

export const getRouteMeta = (path) => {
  const config = getRouteConfig(path);
  return config ? config.meta : {};
};

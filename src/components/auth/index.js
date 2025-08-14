// Auth component exports for easy importing
export { default as LoginForm } from "./LoginForm.jsx";
export { default as RegisterForm } from "./RegisterForm.jsx";
export { default as AuthLayout } from "./AuthLayout.jsx";
export {
  default as ProtectedRoute,
  withAuth,
  RequireAuth,
  RequireGuest,
  RequireRole,
  RequirePermission,
} from "./ProtectedRoute.jsx";
export { default as NavigationGuard } from "./NavigationGuard.jsx";

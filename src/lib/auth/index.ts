export { auth, signIn, signOut } from "./auth";
export { authConfig } from "./config";

// Server-side utilities
export {
  getServerSession,
  getCurrentUser,
  getCurrentUserId,
  getCurrentUserRole,
  hasRole,
  hasAnyRole,
  requireAuth,
  requireRole,
  requireAnyRole,
  hashPassword,
  verifyPassword,
  isValidPassword,
  validatePasswordStrength,
} from "./utils";

// Client-side utilities
export {
  useSession,
  useCurrentUser,
  useCurrentUserId,
  useCurrentUserRole,
  useHasRole,
  useHasAnyRole,
  useIsAuthenticated,
  useIsSessionLoading,
  isAuthenticated,
} from "./client-utils";

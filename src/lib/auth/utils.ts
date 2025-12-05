import { auth } from "./auth";
import { Session } from "next-auth";
import bcrypt from "bcryptjs";

/**
 * Server-side authentication utilities
 */

/**
 * Get the current session on the server side
 * Use this in Server Components, Server Actions, and API Routes
 * @returns The current session or null if not authenticated
 */
export async function getServerSession(): Promise<Session | null> {
  return await auth();
}

/**
 * Get the current user from the session on the server side
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}

/**
 * Get the current user's ID from the session on the server side
 * @returns The current user's ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user?.id ?? null;
}

/**
 * Get the current user's role from the session on the server side
 * @returns The current user's role or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user?.role ?? null;
}

/**
 * Check if the current user has a specific role
 * @param role - The role to check
 * @returns True if the user has the role, false otherwise
 */
export async function hasRole(role: string): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole === role;
}

/**
 * Check if the current user has any of the specified roles
 * @param roles - Array of roles to check
 * @returns True if the user has any of the roles, false otherwise
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole ? roles.includes(userRole) : false;
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in Server Actions or API Routes that require authentication
 * @returns The current session
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized: Authentication required");
  }
  return session;
}

/**
 * Require a specific role - throws error if user doesn't have the role
 * @param role - The required role
 * @returns The current session
 * @throws Error if not authenticated or doesn't have the role
 */
export async function requireRole(role: string): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== role) {
    throw new Error(`Unauthorized: ${role} role required`);
  }
  return session;
}

/**
 * Require any of the specified roles - throws error if user doesn't have any of them
 * @param roles - Array of acceptable roles
 * @returns The current session
 * @throws Error if not authenticated or doesn't have any of the roles
 */
export async function requireAnyRole(roles: string[]): Promise<Session> {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    throw new Error(`Unauthorized: One of [${roles.join(", ")}] roles required`);
  }
  return session;
}

/**
 * Password hashing utilities
 */

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password - The plain text password to verify
 * @param hash - The hashed password to compare against
 * @returns True if the password matches the hash, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Check if a password meets minimum security requirements
 * @param password - The password to validate
 * @returns True if the password is valid, false otherwise
 */
export function isValidPassword(password: string): boolean {
  // Minimum 8 characters
  return password.length >= 8;
}

/**
 * Validate password strength and return error message if invalid
 * @param password - The password to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePasswordStrength(password: string): string | null {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  return null;
}

/**
 * Session validation utilities
 */

/**
 * Check if a session is expired based on the expires timestamp
 * @param expiresAt - The session expiration timestamp (ISO string or Date)
 * @returns True if the session is expired, false otherwise
 */
export function isSessionExpired(expiresAt: string | Date): boolean {
  const expirationDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  return expirationDate <= now;
}

/**
 * Validate that a session object has all required fields
 * @param session - The session object to validate
 * @returns True if the session is valid, false otherwise
 */
export function isValidSession(session: Session | null): session is Session {
  if (!session) {
    return false;
  }

  // Check that session has user object
  if (!session.user) {
    return false;
  }

  // Check that user has required fields
  if (!session.user.id || !session.user.email || !session.user.role) {
    return false;
  }

  // Check that session has expiration
  if (!session.expires) {
    return false;
  }

  // Check that session is not expired
  if (isSessionExpired(session.expires)) {
    return false;
  }

  return true;
}

/**
 * Validate session and return error message if invalid
 * @param session - The session to validate
 * @returns Error message if invalid, null if valid
 */
export function validateSession(session: Session | null): string | null {
  if (!session) {
    return "No session found";
  }

  if (!session.user) {
    return "Invalid session: missing user data";
  }

  if (!session.user.id) {
    return "Invalid session: missing user ID";
  }

  if (!session.user.email) {
    return "Invalid session: missing user email";
  }

  if (!session.user.role) {
    return "Invalid session: missing user role";
  }

  if (!session.expires) {
    return "Invalid session: missing expiration";
  }

  if (isSessionExpired(session.expires)) {
    return "Session expired";
  }

  return null;
}

/**
 * Check if a user account is active (not disabled)
 * @param status - The user status from the session
 * @returns True if the account is active, false otherwise
 */
export function isAccountActive(status?: string): boolean {
  return status === 'active';
}

/**
 * Validate that a user account is active and return error message if not
 * @param status - The user status from the session
 * @returns Error message if account is disabled, null if active
 */
export function validateAccountStatus(status?: string): string | null {
  if (!status || status.trim() === '') {
    return "Account status unknown";
  }

  if (status === 'disabled') {
    return "Your account has been disabled. Please contact support";
  }

  if (status !== 'active') {
    return "Account is not active";
  }

  return null;
}

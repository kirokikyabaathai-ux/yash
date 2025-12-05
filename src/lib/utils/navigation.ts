/**
 * Navigation utilities for role-based routing
 */

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'office' | 'agent' | 'installer' | 'customer';

/**
 * Get the dashboard route for a specific role
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'office':
      return '/office/dashboard';
    case 'agent':
      return '/agent/dashboard';
    case 'installer':
      return '/installer/dashboard';
    case 'customer':
      return '/customer/dashboard';
    default:
      return '/';
  }
}

/**
 * Navigate to the appropriate dashboard based on user role
 */
export function navigateToDashboard(router: AppRouterInstance, role: UserRole): void {
  const path = getDashboardPath(role);
  router.push(path);
}

/**
 * Get the dashboard URL for a specific role (for use in redirects, links, etc.)
 */
export function getDashboardUrl(role: UserRole): string {
  return getDashboardPath(role);
}

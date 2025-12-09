/**
 * Login Page
 * 
 * Public page for user authentication.
 * Displays LoginForm component.
 * Redirects to dashboard if already logged in.
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getDashboardPath } from '@/lib/utils/navigation';
import { LoginForm } from '@/components/auth/LoginForm';

export default async function LoginPage() {
  // Check if user is already logged in
  const session = await auth();
  
  if (session?.user) {
    // Redirect to role-based dashboard
    const dashboardPath = getDashboardPath(session.user.role as any);
    redirect(dashboardPath);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--penpot-bg-gray-50)] py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

/**
 * Home Page (Root)
 * 
 * Displays the login form as the landing page.
 * Authenticated users will be redirected to their dashboard by middleware.
 */

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

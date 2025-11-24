/**
 * Signup Page
 * 
 * Public page for customer self-registration.
 * Displays CustomerSignupForm component.
 */

import { CustomerSignupForm } from '@/components/auth/CustomerSignupForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <CustomerSignupForm />
    </div>
  );
}

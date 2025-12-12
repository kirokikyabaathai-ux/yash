'use client';

/**
 * Login Form Component
 * 
 * Handles user authentication for all roles (Admin, Agent, Office, Installer, Customer).
 * Uses NextAuth with credentials provider for email/password authentication.
 * 
 * Requirements: 2.1, 2.3, 14.1, 14.2, 14.3, 14.4
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getDashboardPath, type UserRole } from '@/lib/utils/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || null;
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === 'account_disabled' ? 'Your account has been disabled. Please contact support.' : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with NextAuth
      // Use callbackUrl to prevent default redirects
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/login', // Prevent automatic redirect
      });

      if (!result) {
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      if (result.error) {
        // Handle specific error cases
        if (result.error === 'Account disabled') {
          setError('Your account has been disabled. Please contact support.');
        } else if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
        } else {
          setError(result.error);
        }
        setLoading(false);
        return;
      }

      // Authentication successful - wait for session to be fully established
      // Poll for session with retry logic to ensure it's available
      let session = null;
      let retries = 0;
      const maxRetries = 5;
      
      while (!session?.user?.role && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms between retries
        const response = await fetch('/api/auth/session');
        session = await response.json();
        retries++;
      }

      if (!session?.user?.role) {
        setError('Failed to retrieve user information. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to appropriate dashboard based on role
      // router.refresh() ensures the session is available on the next page
      if (redirectTo) {
        router.refresh();
        router.push(redirectTo);
      } else {
        const role = session.user.role as UserRole;
        const dashboardPath = getDashboardPath(role);
        router.refresh();
        router.push(dashboardPath);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="rounded-[var(--penpot-radius-lg)] shadow-[var(--penpot-shadow-md)]">
        <CardHeader className="space-y-[var(--penpot-spacing-2)] p-[var(--penpot-spacing-6)]">
          <CardTitle className="text-[26px] font-bold text-center text-[var(--penpot-neutral-dark)]">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center text-[14px] text-[var(--penpot-neutral-secondary)]">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="p-[var(--penpot-spacing-6)] pt-0">
          <form onSubmit={handleSubmit} className="space-y-[var(--penpot-spacing-4)]">
            {error && (
              <div className="rounded-[var(--penpot-radius-md)] bg-[var(--penpot-error)]/10 border border-[var(--penpot-error)]/20 p-[var(--penpot-spacing-4)] flex items-start gap-[var(--penpot-spacing-3)]">
                <AlertCircle className="h-5 w-5 text-[var(--penpot-error)] mt-0.5 flex-shrink-0" />
                <p className="text-[14px] text-[var(--penpot-error)] font-medium">{error}</p>
              </div>
            )}
            
            <div className="space-y-[var(--penpot-spacing-2)]">
              <Label htmlFor="email-address" className="text-[14px] font-bold text-[var(--penpot-neutral-dark)]">
                Email address
              </Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                size="md"
              />
            </div>

            <div className="space-y-[var(--penpot-spacing-2)]">
              <Label htmlFor="password" className="text-[14px] font-bold text-[var(--penpot-neutral-dark)]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  size="md"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 h-full px-[var(--penpot-spacing-3)] hover:bg-transparent"
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[var(--penpot-neutral-secondary)]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[var(--penpot-neutral-secondary)]" />
                  )}
                </Button>
              </div>
            </div>

            <LoadingButton
              type="submit"
              loading={loading}
              className="w-full mt-[var(--penpot-spacing-6)]"
              size="md"
            >
              Sign in
            </LoadingButton>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-[var(--penpot-spacing-2)] p-[var(--penpot-spacing-6)] pt-0">
          <div className="text-[14px] text-center text-[var(--penpot-neutral-secondary)]">
            Don't have an account?{' '}
            <a
              href="/signup"
              className="font-medium text-[var(--penpot-primary)] hover:underline"
            >
              Sign up as a customer
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

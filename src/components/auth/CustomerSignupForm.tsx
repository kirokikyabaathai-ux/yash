'use client';

/**
 * Customer Signup Form Component (NextAuth Integration)
 * 
 * Handles customer self-registration with automatic lead creation.
 * When a customer registers:
 * 1. Calls customer-signup API to create Supabase Auth account
 * 2. Database trigger creates user profile with 'customer' role
 * 3. Database trigger automatically creates a lead record
 * 4. Signs in the user with NextAuth
 * 
 * Requirements: 2.1, 2.3, 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getDashboardPath, type UserRole } from '@/lib/utils/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function CustomerSignupForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Validates phone number format
   * Must be exactly 10 digits and cannot start with zero
   */
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[1-9][0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Validate phone number format
    if (!validatePhoneNumber(formData.phone)) {
      setError('Phone number must be exactly 10 digits and cannot start with 0');
      setLoading(false);
      return;
    }

    // Validate name is not empty
    if (formData.name.trim().length === 0) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Call customer signup API
      const response = await fetch('/api/auth/customer-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Step 2: Sign in with NextAuth using the credentials
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Account created but sign in failed. Please try logging in.');
        setLoading(false);
        return;
      }

      // Step 3: Get session and redirect to role-based dashboard
      const sessionResponse = await fetch('/api/auth/session');
      const session = await sessionResponse.json();
      const role = (session?.user?.role || 'customer') as UserRole;
      
      router.push(getDashboardPath(role));
      router.refresh(); // Refresh to update session state
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="rounded-[var(--penpot-radius-lg)] shadow-[var(--penpot-shadow-md)]">
        <CardHeader className="space-y-[var(--penpot-spacing-2)] p-[var(--penpot-spacing-6)]">
          <CardTitle className="text-[26px] font-bold text-center text-[var(--penpot-neutral-dark)]">
            Create your customer account
          </CardTitle>
          <CardDescription className="text-center text-[14px] text-[var(--penpot-neutral-secondary)]">
            Register to track your solar installation project
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
              <Label htmlFor="name" className="text-[14px] font-bold text-[var(--penpot-neutral-dark)]">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                size="md"
              />
            </div>

            <div className="space-y-[var(--penpot-spacing-2)]">
              <Label htmlFor="email" className="text-[14px] font-bold text-[var(--penpot-neutral-dark)]">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                size="md"
              />
            </div>

            <div className="space-y-[var(--penpot-spacing-2)]">
              <Label htmlFor="phone" className="text-[14px] font-bold text-[var(--penpot-neutral-dark)]">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="10 digits (e.g., 9876543210)"
                value={formData.phone}
                onChange={handleChange}
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
                  autoComplete="new-password"
                  required
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-[var(--penpot-spacing-2)]">
              <Label htmlFor="confirmPassword" className="text-[14px] font-bold text-[var(--penpot-neutral-dark)]">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  size="md"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 h-full px-[var(--penpot-spacing-3)] hover:bg-transparent"
                  disabled={loading}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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
              Create account
            </LoadingButton>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-[var(--penpot-spacing-2)] p-[var(--penpot-spacing-6)] pt-0">
          <div className="text-[14px] text-center text-[var(--penpot-neutral-secondary)]">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-medium text-[var(--penpot-primary)] hover:underline"
            >
              Sign in
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

'use client';

/**
 * Auth Modal Component
 * 
 * Modal dialog for authentication (login/signup) using shadcn/ui Dialog.
 * 
 * Requirements: 2.4, 9.1, 9.2, 9.3, 9.4, 9.5, 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { getDashboardPath, type UserRole } from '@/lib/utils/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sync mode with initialMode when it changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        // Validate passwords match
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        // Validate password length
        if (password.length < 8) {
          setError('Password must be at least 8 characters long');
          setIsLoading(false);
          return;
        }

        // Validate phone number format (10 digits, cannot start with 0)
        const phoneRegex = /^[1-9][0-9]{9}$/;
        if (!phoneRegex.test(phone)) {
          setError('Phone number must be exactly 10 digits and cannot start with 0');
          setIsLoading(false);
          return;
        }

        // Call customer signup API
        const response = await fetch('/api/auth/customer-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error?.message || 'Signup failed');
          setIsLoading(false);
          return;
        }

        // Sign in with NextAuth
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError('Account created but sign in failed. Please try logging in.');
          setIsLoading(false);
          return;
        }

        // Get session to determine role-based redirect
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        const role = (session?.user?.role || 'customer') as UserRole;
        
        toast.success('Account created successfully!');
        onClose();
        router.push(getDashboardPath(role));
        router.refresh();
      } else {
        // Login with NextAuth
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Invalid email or password');
          setIsLoading(false);
          return;
        }

        // Get session to determine role-based redirect
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        const role = (session?.user?.role || 'customer') as UserRole;
        
        toast.success('Logged in successfully!');
        onClose();
        router.push(getDashboardPath(role));
        router.refresh();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login' 
              ? 'Sign in to your account' 
              : 'Join us for solar solutions'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  placeholder="10 digits (e.g., 9876543210)"
                  required
                  autoComplete="tel"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min 8 characters' : 'Enter your password'}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 h-full px-3 hover:bg-transparent"
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 h-full px-3 hover:bg-transparent"
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <LoadingButton
            type="submit"
            loading={isLoading}
            className="w-full"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </LoadingButton>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary font-medium hover:underline"
              disabled={isLoading}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

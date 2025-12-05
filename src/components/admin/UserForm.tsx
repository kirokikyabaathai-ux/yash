/**
 * User Form Component
 * 
 * Modal form for creating and editing users.
 * Requirements: 1.2, 1.4, 2.1, 2.4, 4.1, 4.2, 4.3
 */

'use client';

import { useState, useEffect } from 'react';
import type { Database } from '@/types/database';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type User = Database['public']['Tables']['users']['Row'];
type UserRole = Database['public']['Tables']['users']['Row']['role'];
type UserStatus = Database['public']['Tables']['users']['Row']['status'];

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  assigned_area: string;
  password?: string;
  sendEmail?: boolean;
  generatePassword?: boolean;
}

export function UserForm({ user, onClose, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
    assigned_area: '',
    password: '',
    sendEmail: true,
    generatePassword: false,
  });
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        assigned_area: user.assigned_area || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = user ? `/api/users/${user.id}` : '/api/users';
      const method = user ? 'PATCH' : 'POST';

      const body: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        assigned_area: formData.assigned_area || null,
      };

      // Include password and email options only for new users
      if (!user && formData.password) {
        body.password = formData.password;
        body.sendEmail = formData.sendEmail;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Extract the error message from the response
        const errorMessage = errorData.error?.message || errorData.message || 'Failed to save user';
        throw new Error(errorMessage);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleGeneratePassword = () => {
    const password = generateSecurePassword();
    setGeneratedPassword(password);
    setFormData((prev) => ({ ...prev, password, generatePassword: true }));
    setShowPassword(true);
  };

  const generateSecurePassword = (length: number = 12): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const copyToClipboard = () => {
    if (formData.password) {
      navigator.clipboard.writeText(formData.password);
      alert('Password copied to clipboard!');
    }
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 border-b bg-muted/30">
          <SheetHeader>
            <SheetTitle className="text-xl">{user ? 'Edit User' : 'Create User'}</SheetTitle>
            <SheetDescription className="text-sm">
              {user ? 'Update user information and settings.' : 'Create a new user account with role and permissions.'}
            </SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-start gap-3">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Basic Information Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!!user}
                    placeholder="user@example.com"
                    className="text-base"
                  />
                  {user && (
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed after creation
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="9876543210"
                    pattern="[1-9][0-9]{9}"
                    title="Phone number must be exactly 10 digits and cannot start with 0"
                    className="text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    10 digits, cannot start with 0
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role & Permissions Section */}
          <div className="space-y-4 pb-6 border-b">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Role & Permissions</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Configure user role and access level
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, role: value as UserRole }))
                  }
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="installer">Installer</SelectItem>
                    <SelectItem value="office">Office Team</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as UserStatus }))
                  }
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_area" className="text-sm font-medium">Assigned Area</Label>
                <Input
                  type="text"
                  id="assigned_area"
                  name="assigned_area"
                  value={formData.assigned_area}
                  onChange={handleChange}
                  placeholder="e.g., North Region"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Specify geographic area or territory
                </p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          {!user && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Security</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Set initial password for the new user
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!user}
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters required
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                user ? 'Update User' : 'Create User'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

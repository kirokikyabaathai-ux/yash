'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Phone, MapPin, Calendar, Shield, Hash } from 'lucide-react';
import type { Tables } from '@/types/database';

type UserProfile = Tables<'users'>;

interface UserProfileViewProps {
  userId?: string;
}

export function UserProfileView({ userId }: UserProfileViewProps) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const targetUserId = userId || session?.user?.id;
        
        if (targetUserId) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', targetUserId)
            .single();
          
          setUser(profile);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchUser();
    }
  }, [userId, session, status, supabase]);

  if (loading || status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">Unable to load user profile information</p>
      </div>
    );
  }

  const roleId = user.customer_id || user.agent_id || user.office_id;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary capitalize">
              {user.role}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              user.status === 'active' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {user.status === 'active' ? '● Active' : '● Inactive'}
            </span>
            {roleId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground font-mono">
                <Hash className="h-3.5 w-3.5" />
                {roleId}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Card */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Contact Information
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{user.phone}</p>
            </div>
          </div>

          {user.assigned_area && (
            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Assigned Area</p>
                <p className="font-medium">{user.assigned_area}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Information Card */}
      {(user.agent_id || user.office_id || user.customer_id) && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Role Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {user.agent_id && (
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Agent ID</p>
                  <p className="font-medium font-mono text-lg">{user.agent_id}</p>
                </div>
              </div>
            )}

            {user.office_id && (
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Office ID</p>
                  <p className="font-medium font-mono text-lg">{user.office_id}</p>
                </div>
              </div>
            )}

            {user.customer_id && (
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Customer ID</p>
                  <p className="font-medium font-mono text-lg">{user.customer_id}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Details Card */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Account Details
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Created</p>
              <p className="font-medium">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.created_at ? new Date(user.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : ''}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Calendar className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {user.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.updated_at ? new Date(user.updated_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

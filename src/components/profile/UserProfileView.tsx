'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/organisms/Card';
import { Badge } from '@/components/ui/atoms';
import { H1, H3, Body, Small } from '@/components/ui/atoms';
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
        <H3 className="mb-2">Profile Not Found</H3>
        <Body color="secondary">Unable to load user profile information</Body>
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
          <H1>{user.name}</H1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant="subtle" colorScheme="blue" size="md" className="capitalize">
              {user.role}
            </Badge>
            <Badge 
              variant="solid" 
              colorScheme={user.status === 'active' ? 'green' : 'red'}
              size="md"
            >
              {user.status === 'active' ? '● Active' : '● Inactive'}
            </Badge>
            {roleId && (
              <Badge variant="subtle" colorScheme="gray" size="md" className="font-mono gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                {roleId}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Card */}
      <Card
        header={{
          title: 'Contact Information',
          icon: <User className="h-5 w-5" />,
        }}
        padding="lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Small color="secondary">Email Address</Small>
              <Body className="font-medium">{user.email}</Body>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Small color="secondary">Phone Number</Small>
              <Body className="font-medium">{user.phone}</Body>
            </div>
          </div>

          {user.assigned_area && (
            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Small color="secondary">Assigned Area</Small>
                <Body className="font-medium">{user.assigned_area}</Body>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Role Information Card */}
      {(user.agent_id || user.office_id || user.customer_id) && (
        <Card
          header={{
            title: 'Role Information',
            icon: <Shield className="h-5 w-5" />,
          }}
          padding="lg"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {user.agent_id && (
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Small color="secondary">Agent ID</Small>
                  <Body className="font-medium font-mono text-lg">{user.agent_id}</Body>
                </div>
              </div>
            )}

            {user.office_id && (
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Small color="secondary">Office ID</Small>
                  <Body className="font-medium font-mono text-lg">{user.office_id}</Body>
                </div>
              </div>
            )}

            {user.customer_id && (
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Small color="secondary">Customer ID</Small>
                  <Body className="font-medium font-mono text-lg">{user.customer_id}</Body>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Account Details Card */}
      <Card
        header={{
          title: 'Account Details',
          icon: <Calendar className="h-5 w-5" />,
        }}
        padding="lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Small color="secondary">Account Created</Small>
              <Body className="font-medium">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </Body>
              <Small color="secondary">
                {user.created_at ? new Date(user.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : ''}
              </Small>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Calendar className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <Small color="secondary">Last Updated</Small>
              <Body className="font-medium">
                {user.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </Body>
              <Small color="secondary">
                {user.updated_at ? new Date(user.updated_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : ''}
              </Small>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

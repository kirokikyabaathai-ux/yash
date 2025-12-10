'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/notifications/NotificationBell';
import type { Tables } from '@/types/database';

type UserProfile = Tables<'users'>;

interface TopBarProps {
  onMobileMenuToggle?: () => void;
}

export function TopBar({ onMobileMenuToggle }: TopBarProps = {}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.id) {
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser(profile);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };

    fetchUser();
  }, [session, supabase]);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase Auth first
      await supabase.auth.signOut();
      
      // Then sign out from NextAuth with redirect
      await signOut({ 
        redirect: true,
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileClick = () => {
    if (user?.role) {
      router.push(`/${user.role}/profile`);
    }
  };

  if (status === 'loading') {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <img 
            src="/yas_logo.jpeg" 
            alt="YAS Natural Logo" 
            className="h-10 w-10 rounded-full object-cover transition-transform hover:scale-[1.02] border-0"
          />
          <span className="font-semibold text-lg hidden sm:inline-block text-foreground">
            YAS Natural
          </span>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {session?.user && user ? (
            <>
              {/* User Info - Hidden on mobile */}
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {user.customer_id || user.agent_id || user.office_id || `${user.role}`}
                </span>
              </div>

              {/* Notification Bell */}
              <NotificationBell />

              {/* Profile Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                aria-label="View profile"
                title="View profile"
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : status === 'unauthenticated' ? (
            <div className="text-sm text-muted-foreground">
              Not authenticated
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

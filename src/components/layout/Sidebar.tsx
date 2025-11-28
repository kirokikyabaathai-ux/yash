'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Activity, 
  ListChecks,
  TrendingUp,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Tables } from '@/types/database';

type UserProfile = Tables<'users'>;

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'office', 'agent', 'installer', 'customer']
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: UserPlus,
    roles: ['admin', 'office', 'agent']
  },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    roles: ['admin']
  },
  {
    label: 'Steps',
    href: '/steps',
    icon: ListChecks,
    roles: ['admin']
  },
  {
    label: 'Activity Log',
    href: '/activity-log',
    icon: Activity,
    roles: ['admin']
  },
  {
    label: 'Performance',
    href: '/performance',
    icon: TrendingUp,
    roles: ['agent']
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['office']
  }
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          setUser(profile);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [supabase]);

  const filteredNavItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const handleNavigation = (href: string) => {
    if (user?.role) {
      router.push(`/${user.role}${href}`);
      onMobileClose();
    }
  };

  const isActive = (href: string) => {
    if (user?.role) {
      const fullPath = `/${user.role}${href}`;
      return pathname === fullPath || pathname.startsWith(fullPath);
    }
    return false;
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-16 h-[calc(100vh-4rem)] border-r border-border bg-card transition-transform duration-300 z-50 w-64',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          <div className="flex justify-between items-center p-2 border-b border-border lg:hidden">
            <span className="text-sm font-medium px-2">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Button
                  key={item.href}
                  variant={active ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

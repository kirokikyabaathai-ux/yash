'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();

  const userRole = session?.user?.role;

  const filteredNavItems = navigationItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  const handleNavigation = (href: string) => {
    if (userRole) {
      router.push(`/${userRole}${href}`);
      onMobileClose();
    }
  };

  const isActive = (href: string) => {
    if (userRole) {
      const fullPath = `/${userRole}${href}`;
      return pathname === fullPath || pathname.startsWith(fullPath);
    }
    return false;
  };

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <aside className="fixed lg:sticky top-16 h-[calc(100vh-4rem)] border-r border-border bg-card w-64 hidden lg:block">
        <div className="flex flex-col h-full p-4 space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </aside>
    );
  }

  // Don't render if no session
  if (!session?.user) {
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

          {/* User Info Section - Bottom of Sidebar */}
          {session?.user && (
            <div className="p-3 border-t border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
              {session.user.role && (
                <div className="mt-2 px-2 py-1 bg-primary/10 rounded text-xs font-medium text-primary text-center">
                  {session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}
                </div>
              )}
            </div>
          )}
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

'use client';

import { useState } from 'react';
import { TopBar, Sidebar } from '@/components/layout';
import { SessionProvider } from '@/components/auth/SessionProvider';
import type { Session } from 'next-auth';

interface ProtectedLayoutClientProps {
  children: React.ReactNode;
  session: Session | null;
}

export function ProtectedLayoutClient({ children, session }: ProtectedLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col bg-background">
        <TopBar onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <div className="flex flex-1">
          <Sidebar 
            mobileOpen={mobileMenuOpen} 
            onMobileClose={() => setMobileMenuOpen(false)} 
          />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

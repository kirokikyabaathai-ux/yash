'use client';

import { useState } from 'react';
import { TopBar, Sidebar } from '@/components/layout';
import { SessionProvider } from '@/components/auth/SessionProvider';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <SessionProvider>
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

import { auth } from '@/lib/auth/auth';
import { ProtectedLayoutClient } from './layout-client';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session on server side
  const session = await auth();

  return (
    <ProtectedLayoutClient session={session}>
      {children}
    </ProtectedLayoutClient>
  );
}

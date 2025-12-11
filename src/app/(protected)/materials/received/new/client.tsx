/**
 * Material Received Wrapper (Client Component)
 * Redirects to new verification page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MaterialReceivedWrapperProps {
  leadId: string;
}

export function MaterialReceivedWrapper({ leadId }: MaterialReceivedWrapperProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new verification page
    router.replace(`/materials/verification/new?leadId=${leadId}`);
  }, [leadId, router]);

  return (
    <div className="container mx-auto p-8">
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}

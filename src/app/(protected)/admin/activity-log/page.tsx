/**
 * Activity Log Admin Page
 * 
 * Displays a complete audit log of all system actions.
 * Refactored to use Penpot design system components.
 * 
 * Requirements: 12.5, 6.1, 6.2, 6.3, 6.4
 */

import { Suspense } from 'react';
import { ActivityLogList } from '@/components/admin/ActivityLogList';
import { Card } from '@/components/ui/organisms/Card';
import { PageLayout } from '@/components/layout/PageLayout';

export default function ActivityLogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageLayout
          title="Activity Log"
          description="Complete audit trail of all system actions"
        >
          <Suspense fallback={<ActivityLogSkeleton />}>
            <ActivityLogList />
          </Suspense>
        </PageLayout>
      </div>
    </div>
  );
}

function ActivityLogSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} padding="md">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}

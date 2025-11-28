/**
 * Activity Log Admin Page
 * 
 * Displays a complete audit log of all system actions.
 * Requirements: 12.5
 */

import { Suspense } from 'react';
import { ActivityLogList } from '@/components/admin/ActivityLogList';

export default function ActivityLogPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Activity Log</h1>
        <p className="text-gray-600">
          Complete audit trail of all system actions
        </p>
      </div>

      <Suspense fallback={<ActivityLogSkeleton />}>
        <ActivityLogList />
      </Suspense>
    </div>
  );
}

function ActivityLogSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

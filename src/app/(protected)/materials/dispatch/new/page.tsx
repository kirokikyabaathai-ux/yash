/**
 * Material Dispatch Page (Server Component)
 */

import { MaterialDispatchWrapper } from './client';

export default async function MaterialDispatchPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const params = await searchParams;
  const leadId = params.leadId;

  if (!leadId) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: Lead ID is required</p>
        </div>
      </div>
    );
  }

  return <MaterialDispatchWrapper leadId={leadId} />;
}

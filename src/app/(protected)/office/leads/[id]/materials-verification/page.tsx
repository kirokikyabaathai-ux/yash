/**
 * Materials Verification Page
 * 
 * Office/Installer verifies materials received for a lead
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { MaterialsVerification } from '@/components/materials';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MaterialsVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href={`/leads/${leadId}`}>
            <Button variant="ghost" size="sm">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Lead
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Verify Materials</h1>
        <p className="text-muted-foreground mt-2">
          Verify materials received for this lead
        </p>
      </div>
      <MaterialsVerification
        leadId={leadId}
        onComplete={() => router.push(`/leads/${leadId}`)}
      />
    </div>
  );
}

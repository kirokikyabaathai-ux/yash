/**
 * Material Dispatch View (Client Component)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';

interface DispatchedMaterial {
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  category: string | null;
}

interface MaterialDispatchData {
  materials: DispatchedMaterial[];
  total_items: number;
  dispatch_date: string;
}

interface MaterialDispatchViewProps {
  leadId: string;
}

export function MaterialDispatchView({ leadId }: MaterialDispatchViewProps) {
  const [dispatchData, setDispatchData] = useState<MaterialDispatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadDispatchData();
  }, [leadId]);

  const loadDispatchData = async () => {
    try {
      setIsLoading(true);

      // Load dispatch document
      const { data: doc, error } = await supabase
        .from('documents')
        .select('form_json, uploaded_at')
        .eq('lead_id', leadId)
        .eq('document_category', 'material_dispatch')
        .eq('status', 'valid')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No dispatch found
          setDispatchData(null);
        } else {
          throw error;
        }
      } else if (doc?.form_json) {
        setDispatchData(doc.form_json as unknown as MaterialDispatchData);
      }
    } catch (error) {
      console.error('Error loading dispatch data:', error);
      toast.error('Failed to load dispatch data');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryBadgeColor = (category: string | null) => {
    switch (category) {
      case 'panel':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'inverter':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'structure':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'cable':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'accessory':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading dispatch data...</p>
        </div>
      </div>
    );
  }

  if (!dispatchData) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold">No dispatch found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Materials have not been dispatched yet
              </p>
              <div className="mt-6">
                <Button onClick={() => router.back()}>Go Back</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Material Dispatch Details</CardTitle>
              <CardDescription>
                Dispatched on {new Date(dispatchData.dispatch_date).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Total Items: {dispatchData.total_items}
            </p>
          </div>

          {/* Materials List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Dispatched Materials</h3>
            {dispatchData.materials.map((material, index) => (
              <div
                key={material.material_id || index}
                className="border rounded-lg p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{material.material_name}</h4>
                      {material.category && (
                        <Badge className={getCategoryBadgeColor(material.category)}>
                          {material.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{material.quantity}</span>
                    <span className="text-sm text-muted-foreground">{material.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

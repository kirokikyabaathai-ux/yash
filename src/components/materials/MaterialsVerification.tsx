/**
 * Materials Verification Component
 * 
 * Verify materials received for a lead.
 * Used in the "Goods Received In Godown" step.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FormField } from '@/components/forms/FormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MaterialWithVerification {
  material_id: string;
  material_name: string;
  category: string | null;
  description: string | null;
  required_quantity: number;
  unit: string;
  received: boolean;
  received_quantity: number | null;
  verification_status: string;
  remarks: string | null;
  verified_by_name: string | null;
  verified_at: string | null;
}

interface VerificationStatus {
  total_materials: number;
  verified_materials: number;
  pending_materials: number;
  issues_count: number;
  all_verified: boolean;
  can_proceed: boolean;
}

interface MaterialsVerificationProps {
  leadId: string;
  onComplete?: () => void;
  readOnly?: boolean;
}

const VERIFICATION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-800' },
  {
    value: 'quantity_mismatch',
    label: 'Quantity Mismatch',
    color: 'bg-yellow-100 text-yellow-800',
  },
  { value: 'missing', label: 'Missing', color: 'bg-red-100 text-red-800' },
  { value: 'damaged', label: 'Damaged', color: 'bg-orange-100 text-orange-800' },
];

export function MaterialsVerification({
  leadId,
  onComplete,
  readOnly = false,
}: MaterialsVerificationProps) {
  const [materials, setMaterials] = useState<MaterialWithVerification[]>([]);
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifications, setVerifications] = useState<
    Map<
      string,
      {
        received_quantity: number;
        verification_status: string;
        remarks: string;
      }
    >
  >(new Map());

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [leadId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load materials with verification
      const { data: materialsData, error: materialsError } = await supabase.rpc(
        'get_lead_materials_with_verification',
        { p_lead_id: leadId }
      );

      if (materialsError) throw materialsError;
      setMaterials(materialsData || []);

      // Initialize verifications map
      const map = new Map();
      materialsData?.forEach((material: MaterialWithVerification) => {
        map.set(material.material_id, {
          received_quantity: material.received_quantity || material.required_quantity,
          verification_status: material.verification_status || 'pending',
          remarks: material.remarks || '',
        });
      });
      setVerifications(map);

      // Load status
      const { data: statusData, error: statusError } = await supabase.rpc(
        'check_materials_verification_status',
        { p_lead_id: leadId }
      );

      if (statusError) throw statusError;
      setStatus(statusData as unknown as VerificationStatus);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationChange = (
    materialId: string,
    field: 'received_quantity' | 'verification_status' | 'remarks',
    value: string | number
  ) => {
    const newMap = new Map(verifications);
    const current = newMap.get(materialId) || {
      received_quantity: 0,
      verification_status: 'pending',
      remarks: '',
    };
    newMap.set(materialId, { ...current, [field]: value });
    setVerifications(newMap);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const verificationsArray = Array.from(verifications.entries()).map(
        ([material_id, data]) => ({
          material_id,
          ...data,
        })
      );

      const { data, error } = await supabase.rpc('verify_lead_materials', {
        p_lead_id: leadId,
        p_verifications: verificationsArray,
      });

      if (error) throw error;

      const result = data as { success: boolean; all_verified: boolean };
      toast.success('Materials verification saved');
      await loadData();
      if (result.all_verified && onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error verifying materials:', error);
      toast.error(error.message || 'Failed to verify materials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (statusValue: string) => {
    const status = VERIFICATION_STATUSES.find((s) => s.value === statusValue);
    return (
      <Badge className={status?.color || 'bg-gray-100 text-gray-800'}>
        {status?.label || statusValue}
      </Badge>
    );
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
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading materials...</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
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
            <h3 className="mt-2 text-sm font-semibold">No materials configured</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Materials must be configured before verification
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      {status && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{status.total_materials}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {status.verified_materials}
                </p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {status.pending_materials}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{status.issues_count}</p>
                <p className="text-sm text-muted-foreground">Issues</p>
              </div>
            </div>
            {status.all_verified && (
              <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-green-800 dark:text-green-100">
                  ✓ All materials verified - Ready to proceed
                </p>
              </div>
            )}
            {!status.all_verified && status.issues_count > 0 && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-red-800 dark:text-red-100">
                  ⚠ Issues detected - Cannot proceed until resolved
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Materials Verification List */}
      <Card>
        <CardHeader>
          <CardTitle>Materials Checklist</CardTitle>
          <CardDescription>
            Verify each material received for this lead
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {materials.map((material) => {
            const verification = verifications.get(material.material_id);
            const requiresRemarks = Boolean(
              verification?.verification_status &&
              verification.verification_status !== 'verified' &&
              verification.verification_status !== 'pending'
            );

            return (
              <div
                key={material.material_id}
                className="border rounded-lg p-4 space-y-4"
              >
                {/* Material Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{material.material_name}</h4>
                      {material.category && (
                        <Badge className={getCategoryBadgeColor(material.category) || ''}>
                          {material.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Required: {material.required_quantity} {material.unit}
                    </p>
                  </div>
                  {readOnly && getStatusBadge(material.verification_status)}
                </div>

                {!readOnly ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Received Quantity */}
                    <FormField label="Received Quantity" htmlFor={`qty-${material.material_id}`}>
                      <div className="flex gap-2">
                        <Input
                          id={`qty-${material.material_id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={verification?.received_quantity || ''}
                          onChange={(e) =>
                            handleVerificationChange(
                              material.material_id,
                              'received_quantity',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          disabled={isSubmitting}
                        />
                        <span className="flex items-center text-sm text-muted-foreground min-w-[60px]">
                          {material.unit}
                        </span>
                      </div>
                    </FormField>

                    {/* Status */}
                    <FormField label="Status" htmlFor={`status-${material.material_id}`}>
                      <Select
                        value={verification?.verification_status || 'pending'}
                        onValueChange={(value) =>
                          handleVerificationChange(
                            material.material_id,
                            'verification_status',
                            value
                          )
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VERIFICATION_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    {/* Remarks */}
                    <FormField
                      label="Remarks"
                      htmlFor={`remarks-${material.material_id}`}
                      required={requiresRemarks}
                    >
                      <Textarea
                        id={`remarks-${material.material_id}`}
                        value={verification?.remarks || ''}
                        onChange={(e) =>
                          handleVerificationChange(
                            material.material_id,
                            'remarks',
                            e.target.value
                          )
                        }
                        placeholder={
                          requiresRemarks ? 'Explain the issue...' : 'Optional notes'
                        }
                        disabled={isSubmitting}
                        rows={2}
                      />
                    </FormField>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Received:</span>{' '}
                      {material.received_quantity || 0} {material.unit}
                    </p>
                    {material.remarks && (
                      <p>
                        <span className="font-medium">Remarks:</span> {material.remarks}
                      </p>
                    )}
                    {material.verified_by_name && (
                      <p className="text-muted-foreground">
                        Verified by {material.verified_by_name} on{' '}
                        {new Date(material.verified_at!).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!readOnly && (
            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Verification'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

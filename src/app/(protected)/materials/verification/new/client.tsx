/**
 * Materials Verification Wrapper (Client Component)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/lib/toast';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Zap,
  ClipboardList,
  Save
} from 'lucide-react';

interface DispatchedMaterial {
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  category: string | null;
}

interface VerificationData {
  received_quantity: number;
  verification_status: string;
  remarks: string;
}

interface MaterialsVerificationWrapperProps {
  leadId: string;
}

const VERIFICATION_STATUSES = [
  { 
    value: 'pending', 
    label: 'Pending', 
    Icon: Clock,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    badgeColor: 'bg-gray-100 text-gray-700 border-gray-300'
  },
  { 
    value: 'verified', 
    label: 'Verified', 
    Icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    badgeColor: 'bg-green-100 text-green-700 border-green-300'
  },
  {
    value: 'quantity_mismatch',
    label: 'Qty Mismatch',
    Icon: AlertTriangle,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  },
  { 
    value: 'missing', 
    label: 'Missing', 
    Icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    badgeColor: 'bg-red-100 text-red-700 border-red-300'
  },
  { 
    value: 'damaged', 
    label: 'Damaged', 
    Icon: Zap,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-300'
  },
];

export function MaterialsVerificationWrapper({ leadId }: MaterialsVerificationWrapperProps) {
  const [materials, setMaterials] = useState<DispatchedMaterial[]>([]);
  const [verifications, setVerifications] = useState<Map<string, VerificationData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [leadId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load dispatched materials
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('form_json')
        .eq('lead_id', leadId)
        .eq('document_category', 'material_dispatch')
        .eq('status', 'valid')
        .single();

      if (docError) {
        if (docError.code === 'PGRST116') {
          toast.error('No materials have been dispatched yet');
          setMaterials([]);
          return;
        }
        throw docError;
      }

      const dispatchData = doc.form_json as unknown as { materials: DispatchedMaterial[] };
      setMaterials(dispatchData.materials || []);

      // Load existing verification data if any
      const { data: verificationDoc } = await supabase
        .from('documents')
        .select('form_json')
        .eq('lead_id', leadId)
        .eq('document_category', 'material_received')
        .eq('status', 'valid')
        .single();

      if (verificationDoc?.form_json) {
        const savedVerifications = verificationDoc.form_json as unknown as {
          verifications: Array<{ material_id: string } & VerificationData>;
        };
        const map = new Map<string, VerificationData>();
        savedVerifications.verifications?.forEach((v) => {
          map.set(v.material_id, {
            received_quantity: v.received_quantity,
            verification_status: v.verification_status,
            remarks: v.remarks,
          });
        });
        setVerifications(map);
      } else {
        // Initialize with default values
        const map = new Map<string, VerificationData>();
        dispatchData.materials?.forEach((material) => {
          map.set(material.material_id, {
            received_quantity: material.quantity,
            verification_status: 'pending',
            remarks: '',
          });
        });
        setVerifications(map);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationChange = (
    materialId: string,
    field: keyof VerificationData,
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

      // Validate that issues have remarks
      for (const [materialId, verification] of verifications.entries()) {
        if (
          verification.verification_status !== 'verified' &&
          verification.verification_status !== 'pending' &&
          !verification.remarks.trim()
        ) {
          const material = materials.find((m) => m.material_id === materialId);
          toast.error(`Please provide remarks for ${material?.material_name}`);
          return;
        }
      }

      const verificationsArray = Array.from(verifications.entries()).map(
        ([material_id, data]) => ({
          material_id,
          ...data,
        })
      );

      const allVerified = verificationsArray.every(
        (v) => v.verification_status === 'verified'
      );

      const formData = {
        verifications: verificationsArray,
        total_materials: materials.length,
        verified_count: verificationsArray.filter((v) => v.verification_status === 'verified')
          .length,
        all_verified: allVerified,
        verification_date: new Date().toISOString(),
      };

      // Save to documents table
      const response = await fetch(`/api/leads/${leadId}/documents/material-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ form_data: formData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save verification');
      }

      toast.success('Material verification saved successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error saving verification:', error);
      toast.error(error.message || 'Failed to save verification');
    } finally {
      setIsSubmitting(false);
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
          <p className="mt-2 text-sm text-muted-foreground">Loading materials...</p>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
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
              <h3 className="mt-2 text-sm font-semibold">No materials dispatched</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Materials must be dispatched before verification
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

  const handleSelectAllStatus = (status: string) => {
    const newMap = new Map(verifications);
    materials.forEach((material) => {
      const current = newMap.get(material.material_id) || {
        received_quantity: material.quantity,
        verification_status: 'pending',
        remarks: '',
      };
      newMap.set(material.material_id, {
        ...current,
        verification_status: status,
      });
    });
    setVerifications(newMap);
    toast.success(`All materials marked as ${VERIFICATION_STATUSES.find(s => s.value === status)?.label}`);
  };

  const verifiedCount = Array.from(verifications.values()).filter(
    (v) => v.verification_status === 'verified'
  ).length;
  const issuesCount = Array.from(verifications.values()).filter(
    (v) =>
      v.verification_status !== 'verified' && v.verification_status !== 'pending'
  ).length;

  const getStatusInfo = (statusValue: string) => {
    return VERIFICATION_STATUSES.find((s) => s.value === statusValue);
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Status Summary */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
              <p className="text-3xl font-bold">{materials.length}</p>
              <p className="text-sm text-muted-foreground font-medium">Total Items</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{verifiedCount}</p>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Verified</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {materials.length - verifiedCount - issuesCount}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Pending</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{issuesCount}</p>
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">Issues</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Verification */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <ClipboardList className="w-6 h-6" />
                Materials Verification Checklist
              </CardTitle>
              <CardDescription className="mt-1">
                Verify each material received against the dispatch list
              </CardDescription>
            </div>
            {/* Quick Select All Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAllStatus('verified')}
                disabled={isSubmitting}
                className="bg-green-50 text-green-700 hover:bg-green-100 border-green-300 dark:bg-green-950 dark:text-green-300"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Mark All Verified
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAllStatus('pending')}
                disabled={isSubmitting}
                className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-900"
              >
                <Clock className="w-4 h-4 mr-1" />
                Reset to Pending
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          {/* Materials List */}
          <div className="space-y-3">
            {materials.map((material, index) => {
              const verification = verifications.get(material.material_id);
              const requiresRemarks =
                verification?.verification_status !== 'verified' &&
                verification?.verification_status !== 'pending';
              const statusInfo = getStatusInfo(verification?.verification_status || 'pending');
              const isVerified = verification?.verification_status === 'verified';
              const hasIssue = requiresRemarks;

              return (
                <div
                  key={material.material_id}
                  className={`border-2 rounded-xl p-5 transition-all duration-200 ${
                    isVerified 
                      ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' 
                      : hasIssue
                      ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Material Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold text-base">{material.material_name}</h4>
                        {material.category && (
                          <Badge variant="outline" className={getCategoryBadgeColor(material.category)}>
                            {material.category}
                          </Badge>
                        )}
                        {statusInfo && (
                          <Badge variant="outline" className={statusInfo.badgeColor}>
                            <statusInfo.Icon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">Dispatched:</span>
                        <Badge variant="outline" className="font-mono">
                          {material.quantity} {material.unit}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Verification Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Received Quantity */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Received Quantity</Label>
                      <div className="flex items-center gap-2">
                        <Input
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
                          placeholder="0"
                          disabled={isSubmitting}
                          className="w-28 font-mono text-center"
                        />
                        <span className="text-sm text-muted-foreground font-medium">{material.unit}</span>
                      </div>
                    </div>

                    {/* Status Radio Buttons */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Verification Status</Label>
                      <RadioGroup
                        value={verification?.verification_status || 'pending'}
                        onValueChange={(value) =>
                          handleVerificationChange(
                            material.material_id,
                            'verification_status',
                            value
                          )
                        }
                        disabled={isSubmitting}
                        className="flex flex-wrap gap-2"
                      >
                        {VERIFICATION_STATUSES.map((status) => {
                          const isSelected = verification?.verification_status === status.value;
                          return (
                            <div key={status.value} className="flex items-center">
                              <RadioGroupItem
                                value={status.value}
                                id={`${material.material_id}-${status.value}`}
                                className="sr-only"
                              />
                              <Label
                                htmlFor={`${material.material_id}-${status.value}`}
                                className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 whitespace-nowrap flex items-center gap-1 ${
                                  isSelected
                                    ? `${status.color} border-current shadow-sm`
                                    : 'bg-white dark:bg-slate-900 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                }`}
                              >
                                <status.Icon className="w-3.5 h-3.5" />
                                {status.label}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Remarks (shown when needed) */}
                  {requiresRemarks && (
                    <div className="mt-4 pt-4 border-t-2 border-dashed">
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Issue Details <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={verification?.remarks || ''}
                        onChange={(e) =>
                          handleVerificationChange(
                            material.material_id,
                            'remarks',
                            e.target.value
                          )
                        }
                        placeholder="Please explain the issue in detail..."
                        disabled={isSubmitting}
                        rows={2}
                        className="w-full resize-none"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t-2 mt-6">
            <div className="text-sm text-muted-foreground">
              {verifiedCount === materials.length ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  All materials verified and ready to save
                </span>
              ) : (
                <span>
                  {verifiedCount} of {materials.length} materials verified
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.back()} 
                disabled={isSubmitting}
                size="lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                size="lg"
                className="min-w-[160px]"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Verification
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

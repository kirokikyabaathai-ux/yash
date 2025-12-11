/**
 * Material Verification View (Client Component)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Zap,
  ClipboardCheck,
  ArrowLeft
} from 'lucide-react';

interface VerificationItem {
  material_id: string;
  material_name?: string;
  received_quantity: number;
  verification_status: string;
  remarks: string;
}

interface MaterialVerificationData {
  verifications: VerificationItem[];
  total_materials: number;
  verified_count: number;
  all_verified: boolean;
  verification_date: string;
}

interface MaterialVerificationViewProps {
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

export function MaterialVerificationView({ leadId }: MaterialVerificationViewProps) {
  const [verificationData, setVerificationData] = useState<MaterialVerificationData | null>(null);
  const [materialsMap, setMaterialsMap] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadVerificationData();
  }, [leadId]);

  const loadVerificationData = async () => {
    try {
      setIsLoading(true);

      // Load verification document
      const { data: doc, error } = await supabase
        .from('documents')
        .select('form_json, uploaded_at')
        .eq('lead_id', leadId)
        .eq('document_category', 'material_received')
        .eq('status', 'valid')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No verification found
          setVerificationData(null);
        } else {
          throw error;
        }
      } else if (doc?.form_json) {
        const data = doc.form_json as MaterialVerificationData;
        setVerificationData(data);

        // Load material details from dispatch document
        const { data: dispatchDoc } = await supabase
          .from('documents')
          .select('form_json')
          .eq('lead_id', leadId)
          .eq('document_category', 'material_dispatch')
          .eq('status', 'valid')
          .single();

        if (dispatchDoc?.form_json) {
          const dispatchData = dispatchDoc.form_json as {
            materials: Array<{ material_id: string; material_name: string; unit: string; category: string | null }>;
          };
          const map = new Map();
          dispatchData.materials?.forEach((m) => {
            map.set(m.material_id, m);
          });
          setMaterialsMap(map);
        }
      }
    } catch (error) {
      console.error('Error loading verification data:', error);
      toast.error('Failed to load verification data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (statusValue: string) => {
    const status = VERIFICATION_STATUSES.find((s) => s.value === statusValue);
    if (!status) return null;
    const StatusIcon = status.Icon;
    return (
      <Badge variant="outline" className={status.badgeColor}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {status.label}
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
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading verification data...</p>
        </div>
      </div>
    );
  }

  if (!verificationData) {
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold">No verification found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Materials have not been verified yet
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

  const issuesCount = verificationData.verifications.filter(
    (v) => v.verification_status !== 'verified' && v.verification_status !== 'pending'
  ).length;

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6" />
                Material Verification Details
              </CardTitle>
              <CardDescription className="mt-1">
                Verified on {new Date(verificationData.verification_date).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Status Summary */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
              <p className="text-3xl font-bold">{verificationData.total_materials}</p>
              <p className="text-sm text-muted-foreground font-medium">Total Items</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {verificationData.verified_count}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Verified</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {verificationData.total_materials - verificationData.verified_count - issuesCount}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Pending</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{issuesCount}</p>
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">Issues</p>
            </div>
          </div>
          {verificationData.all_verified && (
            <div className="mt-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-green-800 dark:text-green-100 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                All materials verified successfully
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Details */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Verification Details
          </CardTitle>
          <CardDescription>Material verification status and remarks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          {verificationData.verifications.map((verification, index) => {
            const materialInfo = materialsMap.get(verification.material_id);
            const materialName = materialInfo?.material_name || verification.material_name || 'Unknown Material';
            const unit = materialInfo?.unit || 'pcs';
            const category = materialInfo?.category || null;
            const isVerified = verification.verification_status === 'verified';
            const hasIssue = verification.verification_status !== 'verified' && verification.verification_status !== 'pending';

            return (
              <div 
                key={verification.material_id || index} 
                className={`border-2 rounded-xl p-5 transition-all ${
                  isVerified 
                    ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' 
                    : hasIssue
                    ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-semibold text-base">{materialName}</h4>
                      {category && (
                        <Badge variant="outline" className={getCategoryBadgeColor(category)}>
                          {category}
                        </Badge>
                      )}
                      {getStatusBadge(verification.verification_status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-muted-foreground">Received:</span>
                        <Badge variant="secondary" className="font-mono">
                          {verification.received_quantity} {unit}
                        </Badge>
                      </div>
                      {verification.remarks && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Remarks:</p>
                              <p className="text-sm">{verification.remarks}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

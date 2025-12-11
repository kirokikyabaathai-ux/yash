/**
 * Material Dispatch Wrapper (Client Component)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';

interface Material {
  material_id: string;
  material_name: string;
  description: string | null;
  unit: string;
  category: string | null;
  is_active: boolean;
}

interface MaterialDispatchWrapperProps {
  leadId: string;
}

export function MaterialDispatchWrapper({ leadId }: MaterialDispatchWrapperProps) {
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [leadId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load materials catalog
      const { data: materials, error } = await supabase
        .from('materials')
        .select('id, material_name, description, unit, category, is_active')
        .eq('is_active', true)
        .order('material_name');

      if (error) throw error;

      const catalog = materials?.map(m => ({
        material_id: m.id,
        material_name: m.material_name,
        description: m.description,
        unit: m.unit || 'pcs',
        category: m.category,
        is_active: m.is_active ?? true
      })) || [];

      setAvailableMaterials(catalog);

      // Load existing dispatch document if any
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('form_json')
        .eq('lead_id', leadId)
        .eq('document_category', 'material_dispatch')
        .eq('status', 'valid')
        .single();

      if (existingDoc?.form_json) {
        const formData = existingDoc.form_json as { materials: Array<{ material_id: string; quantity: number }> };
        const map = new Map<string, number>();
        formData.materials?.forEach((item) => {
          map.set(item.material_id, item.quantity);
        });
        setSelectedMaterials(map);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (materialId: string, quantity: string) => {
    const numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity) || numQuantity < 0) {
      return;
    }

    const newMap = new Map(selectedMaterials);
    if (numQuantity === 0) {
      newMap.delete(materialId);
    } else {
      newMap.set(materialId, numQuantity);
    }
    setSelectedMaterials(newMap);
  };

  const handleSubmit = async () => {
    if (selectedMaterials.size === 0) {
      toast.error('Please select at least one material');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare materials data with names
      const materialsArray = Array.from(selectedMaterials.entries()).map(
        ([material_id, quantity]) => {
          const material = availableMaterials.find(m => m.material_id === material_id);
          return {
            material_id,
            material_name: material?.material_name || '',
            quantity,
            unit: material?.unit || 'pcs',
            category: material?.category || null
          };
        }
      );

      const formData = {
        materials: materialsArray,
        total_items: materialsArray.length,
        dispatch_date: new Date().toISOString()
      };

      // Save to documents table
      const response = await fetch(`/api/leads/${leadId}/documents/material-dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ form_data: formData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save material dispatch');
      }

      toast.success('Material dispatch saved successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error saving material dispatch:', error);
      toast.error(error.message || 'Failed to save material dispatch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMaterials = availableMaterials.filter((material) =>
    material.material_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Material Dispatch</CardTitle>
          <CardDescription>
            Select materials and specify quantities to dispatch for this lead
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Materials List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredMaterials.map((material) => {
              const quantity = selectedMaterials.get(material.material_id) || 0;
              const isSelected = quantity > 0;

              return (
                <div
                  key={material.material_id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{material.material_name}</h4>
                        {material.category && (
                          <Badge className={getCategoryBadgeColor(material.category)}>
                            {material.category}
                          </Badge>
                        )}
                      </div>
                      {material.description && (
                        <p className="text-xs text-muted-foreground">
                          {material.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quantity || ''}
                        onChange={(e) =>
                          handleQuantityChange(material.material_id, e.target.value)
                        }
                        placeholder="0"
                        className="w-24"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-muted-foreground min-w-[60px]">
                        {material.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {selectedMaterials.size > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedMaterials.size} material{selectedMaterials.size !== 1 ? 's' : ''}{' '}
                selected
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedMaterials.size === 0}
            >
              {isSubmitting ? 'Saving...' : 'Save Dispatch'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

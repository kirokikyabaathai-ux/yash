/**
 * Materials Configuration Component
 * 
 * Admin configures required materials for a specific lead.
 * Used in the "Good Despatch" step.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FormField } from '@/components/forms/FormField';

interface Material {
  material_id: string;
  material_name: string;
  description: string | null;
  unit: string;
  category: string | null;
  is_active: boolean;
}

interface ConfiguredMaterial extends Material {
  required_quantity: number;
}

interface MaterialsConfigurationProps {
  leadId: string;
  onComplete?: () => void;
}

export function MaterialsConfiguration({ leadId, onComplete }: MaterialsConfigurationProps) {
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [leadId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load catalog
      const { data: catalog, error: catalogError } = await supabase.rpc(
        'get_materials_catalog'
      );
      if (catalogError) throw catalogError;
      setAvailableMaterials(catalog || []);

      // Load existing configuration
      const { data: configured, error: configError } = await supabase
        .from('materials')
        .select('id, material_name, quantity')
        .eq('lead_id', leadId);

      if (configError) throw configError;

      if (configured && configured.length > 0) {
        const map = new Map<string, number>();
        configured.forEach((item) => {
          // Find the material in catalog by name
          const catalogItem = catalog?.find(
            (m) => m.material_name === item.material_name
          );
          if (catalogItem) {
            map.set(catalogItem.material_id, item.quantity || 0);
          }
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

      const materialsArray = Array.from(selectedMaterials.entries()).map(
        ([material_id, required_quantity]) => ({
          material_id,
          required_quantity,
        })
      );

      const { data, error } = await supabase.rpc('configure_lead_materials', {
        p_lead_id: leadId,
        p_materials: materialsArray,
      });

      if (error) throw error;

      const result = data as { success: boolean; materials_configured: number };
      toast.success(`${result.materials_configured} materials configured successfully`);
      if (onComplete) onComplete();
    } catch (error: any) {
      console.error('Error configuring materials:', error);
      toast.error(error.message || 'Failed to configure materials');
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
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading materials...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Required Materials</CardTitle>
        <CardDescription>
          Select materials and specify quantities needed for this lead
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
            onClick={handleSubmit}
            disabled={isSubmitting || selectedMaterials.size === 0}
          >
            {isSubmitting ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

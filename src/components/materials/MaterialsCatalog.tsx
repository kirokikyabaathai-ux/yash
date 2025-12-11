/**
 * Materials Catalog Component
 * 
 * Displays and manages the master materials catalog.
 * Admin can add new materials to the system.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Material {
  material_id: string;
  material_name: string;
  description: string | null;
  unit: string;
  category: string | null;
  is_active: boolean;
}

const CATEGORIES = [
  { value: 'panel', label: 'Panel' },
  { value: 'inverter', label: 'Inverter' },
  { value: 'structure', label: 'Structure' },
  { value: 'cable', label: 'Cable' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'other', label: 'Other' },
];

const UNITS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'meter', label: 'Meters' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'set', label: 'Sets' },
  { value: 'roll', label: 'Rolls' },
  { value: 'box', label: 'Boxes' },
];

export function MaterialsCatalog() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    material_name: '',
    description: '',
    unit: 'pcs',
    category: 'other',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_materials_catalog');

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Failed to load materials catalog');
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.material_name.trim()) {
      newErrors.material_name = 'Material name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const { data, error } = await supabase.rpc('add_material_to_catalog', {
        p_material_name: formData.material_name,
        p_description: formData.description || undefined,
        p_unit: formData.unit,
        p_category: formData.category,
      });

      if (error) throw error;

      toast.success('Material added successfully');
      setIsDialogOpen(false);
      setFormData({
        material_name: '',
        description: '',
        unit: 'pcs',
        category: 'other',
      });
      loadMaterials();
    } catch (error: any) {
      console.error('Error adding material:', error);
      toast.error(error.message || 'Failed to add material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.material_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || material.category === filterCategory;
    return matchesSearch && matchesCategory && material.is_active;
  });

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Materials Catalog</CardTitle>
              <CardDescription>
                Manage the master list of materials available for solar installations
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Materials Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading materials...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg border-2 border-dashed">
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
              <h3 className="mt-2 text-sm font-semibold">No materials found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery || filterCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding a new material'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material) => (
                <div
                  key={material.material_id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{material.material_name}</h4>
                    {material.category && (
                      <Badge className={getCategoryBadgeColor(material.category)}>
                        {material.category}
                      </Badge>
                    )}
                  </div>
                  {material.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {material.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                    Unit: {material.unit}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Material Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>
              Add a new material to the master catalog
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <FormField
                label="Material Name"
                required
                error={errors.material_name}
                htmlFor="material_name"
              >
                <Input
                  id="material_name"
                  value={formData.material_name}
                  onChange={(e) =>
                    setFormData({ ...formData, material_name: e.target.value })
                  }
                  placeholder="e.g., Solar Panel 550W"
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Description" htmlFor="description">
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Unit" required htmlFor="unit">
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Category" required htmlFor="category">
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Material'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

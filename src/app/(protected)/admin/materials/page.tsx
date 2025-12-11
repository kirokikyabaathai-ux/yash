/**
 * Admin Materials Management Page
 * 
 * Allows admins to manage the master materials catalog
 */

import { MaterialsCatalog } from '@/components/materials';

export default function MaterialsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Materials Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage the master catalog of materials for solar installations
        </p>
      </div>
      <MaterialsCatalog />
    </div>
  );
}

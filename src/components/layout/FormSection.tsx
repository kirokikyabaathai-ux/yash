/**
 * FormSection Component
 * 
 * A component for grouping related form fields with clear section headings.
 * Provides consistent spacing and visual organization for complex forms.
 * 
 * Validates: Requirements 4.1, 3.3
 */

import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface FormSectionProps {
  /**
   * Section title
   */
  title: string;
  
  /**
   * Optional section description
   */
  description?: string;
  
  /**
   * Form fields to display in this section
   */
  children: React.ReactNode;
  
  /**
   * Whether to show a separator above the section
   * @default true for sections after the first
   */
  showSeparator?: boolean;
  
  /**
   * Additional className for the section container
   */
  className?: string;
}

/**
 * FormSection groups related form fields with:
 * - Section heading (h2)
 * - Optional description
 * - Consistent spacing between fields
 * - Optional separator for visual separation
 * 
 * @example
 * ```tsx
 * <FormSection
 *   title="Personal Information"
 *   description="Enter your basic details"
 * >
 *   <FormField label="Name">
 *     <Input />
 *   </FormField>
 *   <FormField label="Email">
 *     <Input type="email" />
 *   </FormField>
 * </FormSection>
 * ```
 */
export function FormSection({
  title,
  description,
  children,
  showSeparator = false,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Separator */}
      {showSeparator && <Separator className="my-6" />}
      
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      {/* Form Fields */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

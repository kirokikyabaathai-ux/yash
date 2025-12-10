/**
 * EmptyState Component
 * 
 * A component for displaying helpful empty state messages when no data is available.
 * Provides consistent styling and optional call-to-action buttons.
 * 
 * Validates: Requirements 7.5
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  /**
   * Icon to display (optional)
   */
  icon?: React.ReactNode;
  
  /**
   * Title message
   */
  title: string;
  
  /**
   * Description message
   */
  description?: string;
  
  /**
   * Optional action button
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'outline' | 'ghost' | 'link';
  };
  
  /**
   * Additional className for the container
   */
  className?: string;
}

/**
 * EmptyState displays a helpful message when no data is available:
 * - Optional icon
 * - Title message
 * - Optional description
 * - Optional call-to-action button
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Inbox className="h-12 w-12" />}
 *   title="No leads found"
 *   description="Get started by creating your first lead"
 *   action={{
 *     label: "Create Lead",
 *     onClick: () => router.push('/leads/new')
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      
      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {/* Action Button */}
      {action && (
        <Button
          variant={action.variant || 'outline'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

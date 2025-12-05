/**
 * DashboardCard Component
 * 
 * A specialized card component for displaying dashboard metrics and statistics.
 * Provides consistent styling for key metrics with optional icons and trends.
 * 
 * Validates: Requirements 5.1, 5.2, 5.3
 */

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

export interface DashboardCardProps {
  /**
   * Card title
   */
  title: string;
  
  /**
   * Primary metric value
   */
  value: string | number;
  
  /**
   * Optional description or subtitle
   */
  description?: string;
  
  /**
   * Optional icon to display
   */
  icon?: React.ReactNode;
  
  /**
   * Optional trend indicator
   */
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  
  /**
   * Additional className for the card
   */
  className?: string;
  
  /**
   * Optional footer content
   */
  footer?: React.ReactNode;
}

/**
 * DashboardCard displays key metrics with:
 * - Title and optional icon
 * - Large, prominent value display
 * - Optional description
 * - Optional trend indicator (up/down with percentage)
 * - Optional footer content
 * 
 * @example
 * ```tsx
 * <DashboardCard
 *   title="Total Leads"
 *   value={42}
 *   description="Active leads this month"
 *   icon={<Users className="h-4 w-4" />}
 *   trend={{ value: 12, direction: 'up' }}
 * />
 * ```
 */
export function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  footer,
}: DashboardCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Primary Value - Large and prominent */}
          <div className="text-2xl font-bold">
            {value}
          </div>
          
          {/* Description and Trend */}
          <div className="flex items-center space-x-2">
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            
            {trend && (
              <div
                className={cn(
                  'flex items-center text-xs font-medium',
                  trend.direction === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.direction === 'up' ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
        </div>
        
        {/* Optional Footer */}
        {footer && (
          <div className="mt-4 pt-4 border-t">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

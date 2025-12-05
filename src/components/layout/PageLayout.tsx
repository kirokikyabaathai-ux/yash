/**
 * PageLayout Component
 * 
 * A standardized page layout component that provides consistent structure
 * across all pages with title, description, actions, and breadcrumbs.
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 6.3
 */

import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageLayoutProps {
  /**
   * Page title (h1)
   */
  title: string;
  
  /**
   * Optional page description
   */
  description?: string;
  
  /**
   * Optional action buttons or elements
   */
  actions?: React.ReactNode;
  
  /**
   * Optional breadcrumb navigation
   */
  breadcrumbs?: BreadcrumbItem[];
  
  /**
   * Page content
   */
  children: React.ReactNode;
  
  /**
   * Additional className for the container
   */
  className?: string;
}

/**
 * PageLayout provides a consistent page structure with:
 * - Breadcrumb navigation (if provided)
 * - Page title (h1)
 * - Optional description
 * - Optional action buttons
 * - Main content area
 * 
 * @example
 * ```tsx
 * <PageLayout
 *   title="Customer Dashboard"
 *   description="Track your solar installation project"
 *   breadcrumbs={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Dashboard' }
 *   ]}
 *   actions={<Button>New Action</Button>}
 * >
 *   <div>Page content</div>
 * </PageLayout>
 * ```
 */
export function PageLayout({
  title,
  description,
  actions,
  breadcrumbs,
  children,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn('flex flex-col space-y-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

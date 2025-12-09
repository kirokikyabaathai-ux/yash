/**
 * Card Component - Penpot Design System
 * 
 * Organism component that combines header, content, and action areas into a reusable card layout.
 * Follows atomic design principles by composing molecules and atoms.
 * 
 * @example
 * ```tsx
 * <Card
 *   header={{
 *     title: 'User Profile',
 *     subtitle: 'Manage your account settings',
 *     actions: <Button variant="outline" size="sm">Edit</Button>
 *   }}
 *   footer={
 *     <Button variant="primary" fullWidth>Save Changes</Button>
 *   }
 * >
 *   <p>Card content goes here</p>
 * </Card>
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - Card Component
 * @validates Requirements 4.4, 11.1, 11.4
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { penpotColors, penpotSpacing, penpotShadows, penpotRadii } from '@/lib/design-system/tokens'

export interface CardHeaderProps {
  /**
   * Card title
   */
  title: string
  /**
   * Optional subtitle
   */
  subtitle?: string
  /**
   * Optional icon to display before the title
   */
  icon?: React.ReactNode
  /**
   * Optional actions to display in the header (e.g., buttons)
   */
  actions?: React.ReactNode
}

export interface CardProps {
  /**
   * Card header configuration
   */
  header?: CardHeaderProps
  /**
   * Card content
   */
  children: React.ReactNode
  /**
   * Optional footer content (typically action buttons)
   */
  footer?: React.ReactNode
  /**
   * Whether the card is clickable
   */
  clickable?: boolean
  /**
   * Click handler for clickable cards
   */
  onClick?: () => void
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether to show a border
   */
  bordered?: boolean
  /**
   * Shadow size
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  /**
   * Padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({
  header,
  children,
  footer,
  clickable = false,
  onClick,
  className,
  bordered = true,
  shadow = 'sm',
  padding = 'md',
}: CardProps) {
  const Component = clickable ? 'button' : 'div'

  return (
    <Component
      className={cn(
        'bg-white rounded-lg overflow-hidden transition-all',
        bordered && 'border',
        clickable && 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--penpot-primary)]/20',
        !clickable && shadow !== 'none' && 'shadow-sm',
        className
      )}
      style={{
        borderColor: bordered ? penpotColors.border.light : undefined,
        borderRadius: penpotRadii.lg,
        boxShadow: shadow !== 'none' ? penpotShadows[shadow] : undefined,
      }}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      {/* Header */}
      {header && (
        <div
          className={cn(
            'flex items-start justify-between gap-4 p-4 border-b',
            // paddingClasses[padding]
          )}
          style={{ borderColor: penpotColors.border.light }}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {header.icon && (
              <div className="flex-shrink-0 text-[var(--penpot-primary)] [&_svg]:size-5 mt-0.5">
                {header.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[var(--penpot-neutral-dark)] truncate">
                {header.title}
              </h3>
              {header.subtitle && (
                <p className="text-sm text-[var(--penpot-neutral-secondary)] mt-1">
                  {header.subtitle}
                </p>
              )}
            </div>
          </div>
          {header.actions && (
            <div className="flex-shrink-0">
              {header.actions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(paddingClasses[padding])}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div
          className={cn(
            'border-t',
            paddingClasses[padding]
          )}
          style={{ borderColor: penpotColors.border.light }}
        >
          {footer}
        </div>
      )}
    </Component>
  )
}

/**
 * CardGrid Component
 * 
 * Helper component for laying out multiple cards in a responsive grid.
 * 
 * @example
 * ```tsx
 * <CardGrid columns={{ sm: 1, md: 2, lg: 3 }}>
 *   <Card>...</Card>
 *   <Card>...</Card>
 *   <Card>...</Card>
 * </CardGrid>
 * ```
 */
export interface CardGridProps {
  /**
   * Card components to display in the grid
   */
  children: React.ReactNode
  /**
   * Number of columns at different breakpoints
   */
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  /**
   * Gap between cards
   */
  gap?: 'sm' | 'md' | 'lg'
  /**
   * Additional CSS classes
   */
  className?: string
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
}

export function CardGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 'md',
  className,
}: CardGridProps) {
  const gridCols = {
    sm: columns.sm ? `grid-cols-${columns.sm}` : 'grid-cols-1',
    md: columns.md ? `md:grid-cols-${columns.md}` : 'md:grid-cols-2',
    lg: columns.lg ? `lg:grid-cols-${columns.lg}` : 'lg:grid-cols-3',
    xl: columns.xl ? `xl:grid-cols-${columns.xl}` : '',
  }

  return (
    <div
      className={cn(
        'grid',
        gridCols.sm,
        gridCols.md,
        gridCols.lg,
        gridCols.xl,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

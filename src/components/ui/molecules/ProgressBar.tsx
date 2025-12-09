/**
 * ProgressBar Component - Penpot Design System
 * 
 * Molecule component that combines progress bar with label and percentage display.
 * Follows atomic design principles by composing atomic components.
 * 
 * @example
 * ```tsx
 * <ProgressBar value={75} label="Upload Progress" />
 * 
 * <ProgressBar
 *   value={50}
 *   label="Installation Progress"
 *   showPercentage
 *   colorScheme="green"
 * />
 * 
 * <ProgressBar value={100} label="Complete" colorScheme="success" />
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - ProgressBar Component
 * @validates Requirements 3.4, 10.1
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { penpotColors, penpotRadii } from '@/lib/design-system/tokens'

export interface ProgressBarProps {
  /**
   * Progress value (0-100)
   */
  value: number
  /**
   * Label text to display above the progress bar
   */
  label?: string
  /**
   * Whether to show the percentage value
   */
  showPercentage?: boolean
  /**
   * Color scheme for the progress bar
   */
  colorScheme?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Additional CSS classes
   */
  className?: string
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  colorScheme = 'primary',
  size = 'md',
  className,
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100)
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }
  
  const colorClasses = {
    primary: 'bg-[var(--penpot-primary)]',
    success: 'bg-[var(--penpot-success)]',
    warning: 'bg-[var(--penpot-warning)]',
    error: 'bg-[var(--penpot-error)]',
    info: 'bg-[var(--penpot-info)]',
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-[var(--penpot-neutral-dark)]">
              {label}
            </span>
          )}
          {showPercentage && (
            <span
              className="text-sm font-bold text-[var(--penpot-neutral-dark)]"
              aria-live="polite"
            >
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      
      <div
        className={cn(
          'w-full bg-[var(--penpot-bg-gray-100)] rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            colorClasses[colorScheme]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}

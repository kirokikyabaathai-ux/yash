/**
 * FormField Component - Penpot Design System
 * 
 * Molecule component that combines label, input, and error message into a reusable field component.
 * Follows atomic design principles by composing atomic components (Label, Input).
 * 
 * @example
 * ```tsx
 * <FormField label="Email" required error="Invalid email">
 *   <Input type="email" placeholder="Enter your email" />
 * </FormField>
 * 
 * <FormField label="Password" helpText="Must be at least 8 characters">
 *   <Input type="password" />
 * </FormField>
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - FormField Component
 * @validates Requirements 3.1, 10.1, 10.4
 */

import * as React from 'react'
import { Label } from '../label'
import { cn } from '@/lib/utils'
import { penpotColors, penpotSpacing, penpotTypography } from '@/lib/design-system/tokens'

export interface FormFieldProps {
  /**
   * The label text for the form field
   */
  label: string
  /**
   * Whether the field is required
   */
  required?: boolean
  /**
   * Error message to display below the input
   */
  error?: string
  /**
   * Help text to display below the input
   */
  helpText?: string
  /**
   * The input component (Input, Select, Textarea, etc.)
   */
  children: React.ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * ID for the input element (for label association)
   */
  htmlFor?: string
}

export function FormField({
  label,
  required = false,
  error,
  helpText,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  // Generate a unique ID if not provided
  const fieldId = htmlFor || React.useId()
  
  // Clone the child element to add the ID and error state
  const childWithProps = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        id: fieldId,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': error
          ? `${fieldId}-error`
          : helpText
          ? `${fieldId}-help`
          : undefined,
        state: error ? 'error' : undefined,
      })
    : children

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={fieldId} className="text-sm font-bold text-[var(--penpot-neutral-dark)]">
        {label}
        {required && (
          <span className="text-[var(--penpot-error)] ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>
      
      {childWithProps}
      
      {error && (
        <p
          id={`${fieldId}-error`}
          className="text-xs text-[var(--penpot-error)]"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      
      {!error && helpText && (
        <p
          id={`${fieldId}-help`}
          className="text-xs text-[var(--penpot-neutral-secondary)]"
        >
          {helpText}
        </p>
      )}
    </div>
  )
}

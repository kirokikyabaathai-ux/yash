/**
 * FormSection Component - Penpot Design System
 * 
 * Organism component that combines multiple form fields, sections, and submit actions into a complete form.
 * Follows atomic design principles by composing molecules and atoms.
 * 
 * @example
 * ```tsx
 * <FormSection
 *   title="User Information"
 *   description="Update your personal details"
 *   onSubmit={handleSubmit}
 *   submitLabel="Save Changes"
 *   loading={isSubmitting}
 *   sections={[
 *     {
 *       title: 'Basic Info',
 *       fields: [
 *         <FormField label="Name" required>
 *           <Input type="text" />
 *         </FormField>,
 *         <FormField label="Email" required>
 *           <Input type="email" />
 *         </FormField>
 *       ]
 *     }
 *   ]}
 * />
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - FormSection Component
 * @validates Requirements 4.5, 10.1, 10.4
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../button'
import { penpotColors, penpotSpacing, penpotShadows, penpotRadii } from '@/lib/design-system/tokens'

export interface FormSectionGroup {
  /**
   * Section title
   */
  title?: string
  /**
   * Section description
   */
  description?: string
  /**
   * Form fields in this section
   */
  fields: React.ReactNode[]
  /**
   * Additional CSS classes for the section
   */
  className?: string
}

export interface FormSectionProps {
  /**
   * Form title
   */
  title?: string
  /**
   * Form description
   */
  description?: string
  /**
   * Form sections containing fields
   */
  sections?: FormSectionGroup[]
  /**
   * Direct children (alternative to sections prop)
   */
  children?: React.ReactNode
  /**
   * Submit handler
   */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  /**
   * Cancel handler
   */
  onCancel?: () => void
  /**
   * Submit button label
   */
  submitLabel?: string
  /**
   * Cancel button label
   */
  cancelLabel?: string
  /**
   * Whether the form is in a loading/submitting state
   */
  loading?: boolean
  /**
   * Whether to show the cancel button
   */
  showCancel?: boolean
  /**
   * Whether to show the submit button
   */
  showSubmit?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether to render in a card container
   */
  card?: boolean
  /**
   * Custom footer content (replaces default buttons)
   */
  footer?: React.ReactNode
}

export function FormSection({
  title,
  description,
  sections,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  loading = false,
  showCancel = true,
  showSubmit = true,
  className,
  card = true,
  footer,
}: FormSectionProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit?.(event)
  }

  const formContent = (
    <>
      {/* Form Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-bold text-[var(--penpot-neutral-dark)] mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-[var(--penpot-neutral-secondary)]">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Form Sections */}
      {sections ? (
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className={cn('space-y-4', section.className)}
            >
              {/* Section Header */}
              {(section.title || section.description) && (
                <div
                  className="pb-3 border-b"
                  style={{ borderColor: penpotColors.border.light }}
                >
                  {section.title && (
                    <h3 className="text-base font-bold text-[var(--penpot-neutral-dark)] mb-1">
                      {section.title}
                    </h3>
                  )}
                  {section.description && (
                    <p className="text-sm text-[var(--penpot-neutral-secondary)]">
                      {section.description}
                    </p>
                  )}
                </div>
              )}

              {/* Section Fields */}
              <div className="space-y-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex}>{field}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        children
      )}

      {/* Form Footer */}
      {(footer || showSubmit || showCancel) && (
        <div
          className="flex items-center justify-end gap-3 pt-6 mt-6 border-t"
          style={{ borderColor: penpotColors.border.light }}
        >
          {footer ? (
            footer
          ) : (
            <>
              {showCancel && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
              )}
              {showSubmit && (
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  disabled={loading}
                >
                  {submitLabel}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </>
  )

  if (card) {
    return (
      <form
        onSubmit={handleSubmit}
        className={cn(
          'bg-white rounded-lg border p-6',
          className
        )}
        style={{
          borderColor: penpotColors.border.light,
          borderRadius: penpotRadii.lg,
          boxShadow: penpotShadows.sm,
        }}
        noValidate
      >
        {formContent}
      </form>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      noValidate
    >
      {formContent}
    </form>
  )
}

/**
 * FormSectionGrid Component
 * 
 * Helper component for laying out form fields in a responsive grid.
 * Useful for creating multi-column form layouts.
 * 
 * @example
 * ```tsx
 * <FormSectionGrid columns={{ sm: 1, md: 2 }}>
 *   <FormField label="First Name">
 *     <Input type="text" />
 *   </FormField>
 *   <FormField label="Last Name">
 *     <Input type="text" />
 *   </FormField>
 * </FormSectionGrid>
 * ```
 */
export interface FormSectionGridProps {
  /**
   * Form fields to display in the grid
   */
  children: React.ReactNode
  /**
   * Number of columns at different breakpoints
   */
  columns?: {
    sm?: number
    md?: number
    lg?: number
  }
  /**
   * Gap between fields
   */
  gap?: 'sm' | 'md' | 'lg'
  /**
   * Additional CSS classes
   */
  className?: string
}

const gridGapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
}

export function FormSectionGrid({
  children,
  columns = { sm: 1, md: 2 },
  gap = 'md',
  className,
}: FormSectionGridProps) {
  const gridCols = {
    sm: columns.sm ? `grid-cols-${columns.sm}` : 'grid-cols-1',
    md: columns.md ? `md:grid-cols-${columns.md}` : 'md:grid-cols-2',
    lg: columns.lg ? `lg:grid-cols-${columns.lg}` : '',
  }

  return (
    <div
      className={cn(
        'grid',
        gridCols.sm,
        gridCols.md,
        gridCols.lg,
        gridGapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

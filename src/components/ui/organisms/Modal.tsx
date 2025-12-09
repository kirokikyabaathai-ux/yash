/**
 * Modal Component - Penpot Design System
 * 
 * Organism component that combines overlay, header, content, and action buttons into a dialog.
 * Follows atomic design principles by composing molecules and atoms.
 * Implements focus trap and keyboard navigation for accessibility.
 * 
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   size="md"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - Modal Component
 * @validates Requirements 4.3, 10.5
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../button'
import { penpotColors, penpotSpacing, penpotShadows, penpotRadii } from '@/lib/design-system/tokens'
import { X } from 'lucide-react'

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean
  /**
   * Close handler
   */
  onClose: () => void
  /**
   * Modal title
   */
  title: string
  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /**
   * Whether clicking the overlay closes the modal
   */
  closeOnOverlayClick?: boolean
  /**
   * Whether pressing Escape closes the modal
   */
  closeOnEsc?: boolean
  /**
   * Modal content
   */
  children: React.ReactNode
  /**
   * Footer content (typically action buttons)
   */
  footer?: React.ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether to show the close button
   */
  showCloseButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  children,
  footer,
  className,
  showCloseButton = true,
}: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null)
  const previousActiveElement = React.useRef<HTMLElement | null>(null)

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEsc) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEsc, onClose])

  // Handle focus trap
  React.useEffect(() => {
    if (!isOpen) return

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus the modal
    const modalElement = modalRef.current
    if (modalElement) {
      modalElement.focus()
    }

    // Trap focus within modal
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !modalElement) return

      const focusableElements = modalElement.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)

    // Restore focus on unmount
    return () => {
      document.removeEventListener('keydown', handleTabKey)
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 w-full bg-white rounded-lg overflow-hidden',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          sizeClasses[size],
          className
        )}
        style={{
          boxShadow: penpotShadows.xl,
          borderRadius: penpotRadii.lg,
        }}
        tabIndex={-1}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: penpotColors.border.light }}
        >
          <h2
            id="modal-title"
            className="text-lg font-bold text-[var(--penpot-neutral-dark)]"
          >
            {title}
          </h2>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close modal"
            >
              <X size={16} />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-2 border-t px-6 py-4"
            style={{ borderColor: penpotColors.border.light }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

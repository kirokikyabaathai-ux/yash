/**
 * Pagination Component - Penpot Design System
 * 
 * Molecule component that combines buttons and page indicators into navigation controls.
 * Follows atomic design principles by composing atomic components (Button).
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={setPage}
 *   variant="primary"
 * />
 * 
 * <Pagination
 *   currentPage={5}
 *   totalPages={20}
 *   onPageChange={handlePageChange}
 *   variant="boxed"
 *   showFirstLast
 * />
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - Pagination Component
 * @validates Requirements 3.3, 10.3
 */

import * as React from 'react'
import { Button } from '../button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export interface PaginationProps {
  /**
   * Current active page (1-indexed)
   */
  currentPage: number
  /**
   * Total number of pages
   */
  totalPages: number
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void
  /**
   * Visual variant of the pagination
   */
  variant?: 'primary' | 'boxed' | 'fullsize'
  /**
   * Whether to show first/last page buttons
   */
  showFirstLast?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'primary',
  showFirstLast = false,
  className,
}: PaginationProps) {
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      // Always show last page
      pages.push(totalPages)
    }
    
    return pages
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handleFirst = () => {
    onPageChange(1)
  }

  const handleLast = () => {
    onPageChange(totalPages)
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFirst}
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="size-4" />
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-[var(--penpot-neutral-secondary)]"
                aria-hidden="true"
              >
                ...
              </span>
            )
          }

          const pageNumber = page as number
          const isActive = pageNumber === currentPage

          return (
            <Button
              key={pageNumber}
              variant={isActive ? 'primary' : variant === 'boxed' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'min-w-[2rem]',
                variant === 'fullsize' && 'min-w-[3rem]'
              )}
            >
              {pageNumber}
            </Button>
          )
        })}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <ChevronRight className="size-4" />
      </Button>

      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLast}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          <ChevronsRight className="size-4" />
        </Button>
      )}
    </nav>
  )
}

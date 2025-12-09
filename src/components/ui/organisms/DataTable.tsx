/**
 * DataTable Component - Penpot Design System
 * 
 * Organism component that combines table, sorting controls, filtering, and pagination.
 * Follows atomic design principles by composing molecules and atoms.
 * 
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'email', header: 'Email' },
 *     { key: 'status', header: 'Status', render: (value) => <Badge>{value}</Badge> }
 *   ]}
 *   data={users}
 *   sortable
 *   filterable
 *   pagination={{ currentPage: 1, totalPages: 10, onPageChange: (page) => {} }}
 *   onRowClick={(row) => console.log(row)}
 * />
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - DataTable Component
 * @validates Requirements 4.2, 9.4, 10.3
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../button'
import { Input } from '../input'
import { Pagination } from '../molecules/Pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'
import { penpotColors, penpotSpacing, penpotShadows } from '@/lib/design-system/tokens'
import { ArrowUp, ArrowDown, Search } from 'lucide-react'

export interface Column<T> {
  /**
   * The key of the data property to display
   */
  key: keyof T
  /**
   * The header text for the column
   */
  header: string
  /**
   * Whether this column is sortable
   */
  sortable?: boolean
  /**
   * Custom render function for the cell
   */
  render?: (value: any, row: T) => React.ReactNode
  /**
   * Width of the column (CSS value)
   */
  width?: string
  /**
   * Additional CSS classes for the column
   */
  className?: string
}

export interface PaginationConfig {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number
  /**
   * Total number of pages
   */
  totalPages: number
  /**
   * Page change handler
   */
  onPageChange: (page: number) => void
  /**
   * Variant of pagination component
   */
  variant?: 'primary' | 'boxed' | 'fullsize'
}

export interface DataTableProps<T> {
  /**
   * Column definitions
   */
  columns: Column<T>[]
  /**
   * Data rows to display
   */
  data: T[]
  /**
   * Whether sorting is enabled
   */
  sortable?: boolean
  /**
   * Whether filtering is enabled
   */
  filterable?: boolean
  /**
   * Pagination configuration
   */
  pagination?: PaginationConfig
  /**
   * Row click handler
   */
  onRowClick?: (row: T) => void
  /**
   * Whether the table is in a loading state
   */
  loading?: boolean
  /**
   * Empty state component
   */
  emptyState?: React.ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Key extractor function for row keys
   */
  keyExtractor?: (row: T, index: number) => string
}

type SortDirection = 'asc' | 'desc' | null

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  sortable = false,
  filterable = false,
  pagination,
  onRowClick,
  loading = false,
  emptyState,
  className,
  keyExtractor = (_, index) => index.toString(),
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)
  const [filterValue, setFilterValue] = React.useState('')

  // Handle column sort
  const handleSort = (columnKey: keyof T) => {
    if (!sortable) return

    if (sortColumn === columnKey) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortColumn(null)
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue === bValue) return 0

      const comparison = aValue < bValue ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection])

  // Filter data
  const filteredData = React.useMemo(() => {
    if (!filterable || !filterValue) return sortedData

    return sortedData.filter((row) => {
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(filterValue.toLowerCase())
      )
    })
  }, [sortedData, filterValue, filterable])

  // Loading state
  if (loading) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-white p-12 text-center',
          className
        )}
        style={{ boxShadow: penpotShadows.sm }}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--penpot-primary)] border-t-transparent" />
          <p className="text-sm text-[var(--penpot-neutral-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (filteredData.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-white p-12 text-center',
          className
        )}
        style={{ boxShadow: penpotShadows.sm }}
      >
        {emptyState || (
          <div>
            <p className="text-sm text-[var(--penpot-neutral-secondary)]">
              {filterValue ? 'No results found' : 'No data available'}
            </p>
            {filterValue && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setFilterValue('')}
                className="mt-2"
              >
                Clear filter
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Filter Bar */}
      {filterable && (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Filter table..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            leftIcon={<Search size={16} />}
            size="md"
            className="max-w-sm"
          />
          {filterValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterValue('')}
            >
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-lg border bg-white overflow-hidden"
        style={{ boxShadow: penpotShadows.sm }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--penpot-bg-gray-50)]">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    'font-bold text-[var(--penpot-neutral-dark)]',
                    column.sortable && sortable && 'cursor-pointer select-none',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                  role={column.sortable && sortable ? 'button' : undefined}
                  aria-sort={
                    sortColumn === column.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortable && (
                      <span className="text-[var(--penpot-neutral-secondary)]">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          )
                        ) : (
                          <ArrowUp size={14} className="opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, rowIndex) => (
              <TableRow
                key={keyExtractor(row, rowIndex)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-[var(--penpot-bg-gray-50)]'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={cn('py-4', column.className)}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            variant={pagination.variant || 'primary'}
          />
        </div>
      )}
    </div>
  )
}

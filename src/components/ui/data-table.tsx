/**
 * Reusable Data Table Component
 * 
 * Provides consistent styling for all tables across the application.
 * Change styling here to update all tables at once.
 * 
 * STYLING CONFIGURATION:
 * - Container: bg-card rounded-lg border shadow-sm overflow-hidden
 * - Header row: bg-muted/50
 * - Header cells: font-semibold text-foreground
 * - Body rows: hover:bg-muted/30 transition-colors
 * - Body cells: py-4
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  keyExtractor: (row: T) => string;
  className?: string;
  loading?: boolean;
  loadingMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No data available',
  emptyIcon,
  keyExtractor,
  className = '',
  loading = false,
  loadingMessage = 'Loading...',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-12 text-center">
        <p className="text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-12 text-center">
        {emptyIcon && <div className="flex justify-center mb-4">{emptyIcon}</div>}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg border shadow-sm overflow-hidden ${className}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={`font-semibold text-foreground ${column.headerClassName || ''} ${column.className || ''}`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={keyExtractor(row)}
              className={`hover:bg-muted/30 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, index) => (
                <TableCell key={index} className={`py-4 ${column.className || ''}`}>
                  {typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : String(row[column.accessor])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

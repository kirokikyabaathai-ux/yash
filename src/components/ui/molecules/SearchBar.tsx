/**
 * SearchBar Component - Penpot Design System
 * 
 * Molecule component that combines input field with search icon and clear button.
 * Follows atomic design principles by composing atomic components (Input, Button).
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search leads..."
 *   onSearch={handleSearch}
 * />
 * 
 * <SearchBar
 *   value={query}
 *   onChange={setQuery}
 *   onClear={() => setQuery('')}
 *   loading={isSearching}
 * />
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - SearchBar Component
 * @validates Requirements 3.2
 */

import * as React from 'react'
import { Input } from '../input'
import { Button } from '../button'
import { cn } from '@/lib/utils'
import { Search, X, Loader2 } from 'lucide-react'

export interface SearchBarProps {
  /**
   * Placeholder text for the search input
   */
  placeholder?: string
  /**
   * Current search value
   */
  value: string
  /**
   * Callback when the search value changes
   */
  onChange: (value: string) => void
  /**
   * Callback when the clear button is clicked
   */
  onClear?: () => void
  /**
   * Callback when the search is submitted (Enter key or search button)
   */
  onSearch?: (value: string) => void
  /**
   * Whether the search is in a loading state
   */
  loading?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
}

export function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  onClear,
  onSearch,
  loading = false,
  className,
  size = 'md',
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value)
    }
  }

  const handleClear = () => {
    onChange('')
    if (onClear) {
      onClear()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className={cn('relative w-full', className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        size={size}
        leftIcon={loading ? <Loader2 className="animate-spin" /> : <Search />}
        rightIcon={
          value && !loading ? (
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-[var(--penpot-neutral-dark)] transition-colors"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : undefined
        }
        className="pr-10"
        aria-label="Search"
      />
    </div>
  )
}

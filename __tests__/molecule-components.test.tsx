/**
 * Molecule Components Tests
 * 
 * Basic smoke tests to verify molecule components render without errors.
 * These tests validate that components can be imported and rendered successfully.
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FormField } from '@/components/ui/molecules/FormField'
import { SearchBar } from '@/components/ui/molecules/SearchBar'
import { Pagination } from '@/components/ui/molecules/Pagination'
import { ProgressBar } from '@/components/ui/molecules/ProgressBar'
import { TabGroup } from '@/components/ui/molecules/TabGroup'
import { Input } from '@/components/ui/input'

describe('Molecule Components', () => {
  describe('FormField', () => {
    it('renders with label and input', () => {
      render(
        <FormField label="Test Field">
          <Input placeholder="Test input" />
        </FormField>
      )
      expect(screen.getByText('Test Field')).toBeInTheDocument()
    })

    it('displays error message when provided', () => {
      render(
        <FormField label="Email" error="Invalid email">
          <Input type="email" />
        </FormField>
      )
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('displays required indicator', () => {
      render(
        <FormField label="Required Field" required>
          <Input />
        </FormField>
      )
      expect(screen.getByLabelText('required')).toBeInTheDocument()
    })

    it('displays help text when provided', () => {
      render(
        <FormField label="Password" helpText="Must be at least 8 characters">
          <Input type="password" />
        </FormField>
      )
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument()
    })
  })

  describe('SearchBar', () => {
    it('renders with placeholder', () => {
      const mockOnChange = jest.fn()
      render(<SearchBar value="" onChange={mockOnChange} placeholder="Search..." />)
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('displays search icon', () => {
      const mockOnChange = jest.fn()
      render(<SearchBar value="" onChange={mockOnChange} />)
      expect(screen.getByLabelText('Search')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('renders page numbers', () => {
      const mockOnPageChange = jest.fn()
      render(
        <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
      )
      expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Go to page 5')).toBeInTheDocument()
    })

    it('disables previous button on first page', () => {
      const mockOnPageChange = jest.fn()
      render(
        <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
      )
      expect(screen.getByLabelText('Go to previous page')).toBeDisabled()
    })

    it('disables next button on last page', () => {
      const mockOnPageChange = jest.fn()
      render(
        <Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />
      )
      expect(screen.getByLabelText('Go to next page')).toBeDisabled()
    })
  })

  describe('ProgressBar', () => {
    it('renders with label and percentage', () => {
      render(<ProgressBar value={75} label="Upload Progress" />)
      expect(screen.getByText('Upload Progress')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('renders progressbar role', () => {
      render(<ProgressBar value={50} label="Progress" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '50')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    })

    it('clamps value between 0 and 100', () => {
      const { rerender } = render(<ProgressBar value={150} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
      
      rerender(<ProgressBar value={-10} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })

  describe('TabGroup', () => {
    const mockTabs = [
      { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
      { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
      { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
    ]

    it('renders all tab buttons', () => {
      render(<TabGroup tabs={mockTabs} />)
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument()
    })

    it('displays content for active tab', () => {
      render(<TabGroup tabs={mockTabs} defaultTab="tab1" />)
      // Active tab content should be visible
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      // Only one tabpanel should be accessible (the active one)
      const visiblePanels = screen.getAllByRole('tabpanel')
      expect(visiblePanels).toHaveLength(1)
    })

    it('marks active tab with aria-selected', () => {
      render(<TabGroup tabs={mockTabs} defaultTab="tab2" />)
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      expect(tab2).toHaveAttribute('aria-selected', 'true')
    })

    it('renders tab with badge', () => {
      const tabsWithBadge = [
        { id: 'tab1', label: 'Notifications', content: <div>Content</div>, badge: 5 },
      ]
      render(<TabGroup tabs={tabsWithBadge} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })
})

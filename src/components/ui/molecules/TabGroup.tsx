/**
 * TabGroup Component - Penpot Design System
 * 
 * Molecule component that combines tab buttons with active state indicators and content panels.
 * Follows atomic design principles by composing atomic components (Button).
 * 
 * @example
 * ```tsx
 * <TabGroup
 *   tabs={[
 *     { id: 'overview', label: 'Overview', content: <OverviewPanel /> },
 *     { id: 'details', label: 'Details', content: <DetailsPanel /> },
 *     { id: 'history', label: 'History', content: <HistoryPanel /> },
 *   ]}
 *   defaultTab="overview"
 * />
 * 
 * <TabGroup
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="boxed"
 * />
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - TabGroup Component
 * @validates Requirements 3.5, 10.3
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { penpotColors, penpotSpacing } from '@/lib/design-system/tokens'

export interface Tab {
  /**
   * Unique identifier for the tab
   */
  id: string
  /**
   * Label text to display on the tab button
   */
  label: string
  /**
   * Content to display when tab is active
   */
  content: React.ReactNode
  /**
   * Optional icon to display before the label
   */
  icon?: React.ReactNode
  /**
   * Whether the tab is disabled
   */
  disabled?: boolean
  /**
   * Optional badge count to display
   */
  badge?: number
}

export interface TabGroupProps {
  /**
   * Array of tab configurations
   */
  tabs: Tab[]
  /**
   * Currently active tab ID (controlled)
   */
  activeTab?: string
  /**
   * Default active tab ID (uncontrolled)
   */
  defaultTab?: string
  /**
   * Callback when tab changes
   */
  onTabChange?: (tabId: string) => void
  /**
   * Visual variant of the tabs
   */
  variant?: 'default' | 'boxed' | 'pills'
  /**
   * Additional CSS classes
   */
  className?: string
}

export function TabGroup({
  tabs,
  activeTab: controlledActiveTab,
  defaultTab,
  onTabChange,
  variant = 'default',
  className,
}: TabGroupProps) {
  // Support both controlled and uncontrolled modes
  const [internalActiveTab, setInternalActiveTab] = React.useState(
    defaultTab || tabs[0]?.id || ''
  )
  
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab
  
  const handleTabClick = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId)
    }
    onTabChange?.(tabId)
  }
  
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

  const variantClasses = {
    default: {
      container: 'border-b border-[var(--penpot-border-light)]',
      button: 'px-4 py-2 border-b-2 border-transparent hover:border-[var(--penpot-border-light)] transition-colors',
      active: 'border-[var(--penpot-primary)] text-[var(--penpot-primary)] font-bold',
      inactive: 'text-[var(--penpot-neutral-secondary)]',
    },
    boxed: {
      container: 'bg-[var(--penpot-bg-gray-50)] p-1 rounded-[8px]',
      button: 'px-4 py-2 rounded-[4px] transition-all',
      active: 'bg-white text-[var(--penpot-primary)] font-bold shadow-sm',
      inactive: 'text-[var(--penpot-neutral-secondary)] hover:bg-white/50',
    },
    pills: {
      container: 'gap-2',
      button: 'px-4 py-2 rounded-full transition-all',
      active: 'bg-[var(--penpot-primary)] text-white font-bold',
      inactive: 'bg-[var(--penpot-bg-gray-100)] text-[var(--penpot-neutral-secondary)] hover:bg-[var(--penpot-bg-gray-200)]',
    },
  }

  const styles = variantClasses[variant]

  return (
    <div className={cn('w-full', className)}>
      <div
        role="tablist"
        className={cn('flex items-center', styles.container)}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--penpot-primary)]/50 disabled:opacity-50 disabled:cursor-not-allowed',
                styles.button,
                isActive ? styles.active : styles.inactive
              )}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault()
                  const currentIndex = tabs.findIndex((t) => t.id === activeTab)
                  const nextIndex = (currentIndex + 1) % tabs.length
                  const nextTab = tabs[nextIndex]
                  if (!nextTab.disabled) {
                    handleTabClick(nextTab.id)
                  }
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault()
                  const currentIndex = tabs.findIndex((t) => t.id === activeTab)
                  const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
                  const prevTab = tabs[prevIndex]
                  if (!prevTab.disabled) {
                    handleTabClick(prevTab.id)
                  }
                }
              }}
            >
              {tab.icon && <span className="[&_svg]:size-4">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full',
                    isActive
                      ? 'bg-[var(--penpot-primary)] text-white'
                      : 'bg-[var(--penpot-bg-gray-200)] text-[var(--penpot-neutral-secondary)]'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={tab.id !== activeTab}
            tabIndex={0}
          >
            {tab.id === activeTab && tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}

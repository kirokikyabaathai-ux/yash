/**
 * Header Component - Penpot Design System
 * 
 * Organism component that combines logo, navigation, search, and user menu into a complete header.
 * Follows atomic design principles by composing molecules and atoms.
 * 
 * @example
 * ```tsx
 * <Header
 *   logo={<Logo />}
 *   navigation={[
 *     { label: 'Dashboard', href: '/dashboard', active: true },
 *     { label: 'Leads', href: '/leads', badge: 5 }
 *   ]}
 *   searchEnabled
 *   userMenu={{
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     avatar: '/avatar.jpg',
 *     menuItems: [
 *       { label: 'Profile', onClick: () => {} },
 *       { label: 'Logout', onClick: () => {} }
 *     ]
 *   }}
 * />
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - Header Component
 * @validates Requirements 4.1, 9.3, 10.3
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '../button'
import { SearchBar } from '../molecules/SearchBar'
import { Badge } from '../badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar'
import { penpotColors, penpotSpacing, penpotShadows } from '@/lib/design-system/tokens'
import { Menu, X } from 'lucide-react'

export interface NavigationItem {
  /**
   * The label text for the navigation item
   */
  label: string
  /**
   * The href for the navigation link
   */
  href: string
  /**
   * Icon to display before the label
   */
  icon?: React.ReactNode
  /**
   * Whether this navigation item is currently active
   */
  active?: boolean
  /**
   * Badge count to display on the navigation item
   */
  badge?: number
}

export interface UserMenuItem {
  /**
   * The label text for the menu item
   */
  label: string
  /**
   * Click handler for the menu item
   */
  onClick: () => void
  /**
   * Icon to display before the label
   */
  icon?: React.ReactNode
  /**
   * Whether this is a destructive action (e.g., logout)
   */
  destructive?: boolean
}

export interface UserMenuProps {
  /**
   * User's display name
   */
  name: string
  /**
   * User's email address
   */
  email?: string
  /**
   * URL to user's avatar image
   */
  avatar?: string
  /**
   * Menu items to display in the user dropdown
   */
  menuItems: UserMenuItem[]
}

export interface NotificationProps {
  /**
   * Number of unread notifications
   */
  count: number
  /**
   * Click handler for the notification bell
   */
  onClick: () => void
}

export interface HeaderProps {
  /**
   * Logo component or image
   */
  logo: React.ReactNode
  /**
   * Navigation items to display
   */
  navigation: NavigationItem[]
  /**
   * Whether to show the search bar
   */
  searchEnabled?: boolean
  /**
   * Search value (controlled)
   */
  searchValue?: string
  /**
   * Search change handler
   */
  onSearchChange?: (value: string) => void
  /**
   * Search submit handler
   */
  onSearch?: (value: string) => void
  /**
   * User menu configuration
   */
  userMenu: UserMenuProps
  /**
   * Notification configuration
   */
  notifications?: NotificationProps
  /**
   * Additional CSS classes
   */
  className?: string
}

export function Header({
  logo,
  navigation,
  searchEnabled = false,
  searchValue = '',
  onSearchChange,
  onSearch,
  userMenu,
  notifications,
  className,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [internalSearchValue, setInternalSearchValue] = React.useState(searchValue)

  // Sync internal state with prop
  React.useEffect(() => {
    setInternalSearchValue(searchValue)
  }, [searchValue])

  const handleSearchChange = (value: string) => {
    setInternalSearchValue(value)
    onSearchChange?.(value)
  }

  const handleSearch = (value: string) => {
    onSearch?.(value)
  }

  // Get user initials for avatar fallback
  const userInitials = userMenu.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-white',
        className
      )}
      style={{
        boxShadow: penpotShadows.sm,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              {logo}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" role="navigation">
              {navigation.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-[var(--penpot-bg-gray-100)] text-[var(--penpot-primary)]'
                      : 'text-[var(--penpot-neutral-dark)] hover:bg-[var(--penpot-bg-gray-50)]'
                  )}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.icon && <span className="[&_svg]:size-4">{item.icon}</span>}
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="solid" colorScheme="blue" size="sm" rounded>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar (Desktop) */}
          {searchEnabled && (
            <div className="hidden md:block flex-1 max-w-md">
              <SearchBar
                placeholder="Search..."
                value={internalSearchValue}
                onChange={handleSearchChange}
                onSearch={handleSearch}
              />
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            {notifications && (
              <Button
                variant="ghost"
                size="md"
                onClick={notifications.onClick}
                className="relative"
                aria-label={`Notifications (${notifications.count} unread)`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {notifications.count > 0 && (
                  <span
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--penpot-error)] text-white text-xs font-bold"
                    aria-hidden="true"
                  >
                    {notifications.count > 9 ? '9+' : notifications.count}
                  </span>
                )}
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="md"
                  className="flex items-center gap-2"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userMenu.avatar} alt={userMenu.name} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline text-sm font-medium">
                    {userMenu.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{userMenu.name}</p>
                    {userMenu.email && (
                      <p className="text-xs text-[var(--penpot-neutral-secondary)]">
                        {userMenu.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userMenu.menuItems.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={item.onClick}
                    className={cn(
                      item.destructive && 'text-[var(--penpot-error)] focus:text-[var(--penpot-error)]'
                    )}
                  >
                    {item.icon && <span className="mr-2 [&_svg]:size-4">{item.icon}</span>}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="md"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4" role="navigation">
            {/* Mobile Search */}
            {searchEnabled && (
              <div className="mb-4">
                <SearchBar
                  placeholder="Search..."
                  value={internalSearchValue}
                  onChange={handleSearchChange}
                  onSearch={handleSearch}
                />
              </div>
            )}

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-1">
              {navigation.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-[var(--penpot-bg-gray-100)] text-[var(--penpot-primary)]'
                      : 'text-[var(--penpot-neutral-dark)] hover:bg-[var(--penpot-bg-gray-50)]'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.icon && <span className="[&_svg]:size-4">{item.icon}</span>}
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="solid" colorScheme="blue" size="sm" rounded>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

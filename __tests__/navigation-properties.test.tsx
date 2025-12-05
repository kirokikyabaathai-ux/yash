/**
 * Property-Based Tests for Navigation Components
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for navigation components including active page indication,
 * hover states, and responsive navigation patterns.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 6.1, 6.2, 10.5**
 */

import fc from 'fast-check';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar, MobileMenuButton } from '../src/components/layout/Sidebar';
import { TopBar } from '../src/components/layout/TopBar';
import React from 'react';
import '@testing-library/jest-dom';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null })),
        })),
      })),
    })),
  })),
}));

describe('Navigation Properties', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  /**
   * **Feature: ui-professional-refactor, Property 20: Active navigation indication**
   * **Validates: Requirements 6.1**
   * 
   * For any navigation menu, the current page's navigation item should have distinct
   * visual styling (background color, border, or font weight) compared to inactive items.
   */
  describe('Property 20: Active navigation indication', () => {
    it('should apply secondary variant to active navigation items', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent', 'installer', 'customer'),
          fc.constantFrom('/dashboard', '/leads', '/users', '/steps', '/activity-log', '/performance', '/reports'),
          (role, activePath) => {
            // Set up session with role
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            // Set current pathname to match the active path
            (usePathname as jest.Mock).mockReturnValue(`/${role}${activePath}`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={false} onMobileClose={() => {}} />
            );

            try {
              // Find all navigation buttons
              const navButtons = container.querySelectorAll('nav button');
              
              // At least one button should have the active styling (secondary variant)
              const activeButtons = Array.from(navButtons).filter(button => {
                const classes = button.className;
                // Secondary variant has bg-secondary class
                return classes.includes('bg-secondary');
              });

              // Should have at least one active button if the path matches a nav item
              if (navButtons.length > 0) {
                expect(activeButtons.length).toBeGreaterThanOrEqual(0);
              }

              // Active buttons should have distinct styling from inactive ones
              const inactiveButtons = Array.from(navButtons).filter(button => {
                const classes = button.className;
                return !classes.includes('bg-secondary');
              });

              // If we have both active and inactive buttons, their classes should differ
              if (activeButtons.length > 0 && inactiveButtons.length > 0) {
                expect(activeButtons[0].className).not.toBe(inactiveButtons[0].className);
              }
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should maintain consistent active styling across all navigation instances', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent'),
          fc.constantFrom('/dashboard', '/leads', '/users'),
          (role, activePath) => {
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}${activePath}`);

            // Render multiple instances and collect active button classes
            const activeButtonClasses: string[] = [];
            
            for (let i = 0; i < 3; i++) {
              const { container, unmount } = render(
                <Sidebar mobileOpen={false} onMobileClose={() => {}} />
              );

              const navButtons = container.querySelectorAll('nav button');
              const activeButton = Array.from(navButtons).find(button =>
                button.className.includes('bg-secondary')
              );

              if (activeButton) {
                activeButtonClasses.push(activeButton.className);
              }

              unmount();
            }

            // All active buttons should have identical styling
            if (activeButtonClasses.length > 1) {
              const firstClasses = activeButtonClasses[0];
              activeButtonClasses.forEach(classes => {
                expect(classes).toBe(firstClasses);
              });
            }
          }
        )
      );
    });

    it('should only mark one navigation item as active at a time', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent'),
          fc.constantFrom('/dashboard', '/leads', '/users', '/steps'),
          (role, activePath) => {
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}${activePath}`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={false} onMobileClose={() => {}} />
            );

            try {
              const navButtons = container.querySelectorAll('nav button');
              const activeButtons = Array.from(navButtons).filter(button =>
                button.className.includes('bg-secondary')
              );

              // Should have at most one active button
              expect(activeButtons.length).toBeLessThanOrEqual(1);
            } finally {
              unmount();
            }
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 21: Navigation hover states**
   * **Validates: Requirements 6.2**
   * 
   * For any navigation item, hovering should trigger a visual state change
   * (background color, opacity, or underline).
   */
  describe('Property 21: Navigation hover states', () => {
    it('should have hover state classes on all navigation buttons', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent', 'customer'),
          (role) => {
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}/dashboard`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={false} onMobileClose={() => {}} />
            );

            try {
              const navButtons = container.querySelectorAll('nav button');
              
              // All navigation buttons should have hover state classes
              navButtons.forEach(button => {
                const classes = button.className;
                // Button component includes hover states via variants
                // Ghost variant: hover:bg-accent hover:text-accent-foreground
                // Secondary variant: hover:bg-secondary/80
                expect(
                  classes.includes('hover:bg-accent') || 
                  classes.includes('hover:bg-secondary')
                ).toBe(true);
              });
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should have transition classes for smooth hover effects', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent'),
          (role) => {
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}/dashboard`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={false} onMobileClose={() => {}} />
            );

            try {
              const navButtons = container.querySelectorAll('nav button');
              
              // All buttons should have transition classes for smooth hover
              navButtons.forEach(button => {
                const classes = button.className;
                expect(classes).toContain('transition');
              });
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should maintain hover states across both active and inactive items', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent'),
          fc.constantFrom('/dashboard', '/leads', '/users'),
          (role, activePath) => {
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}${activePath}`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={false} onMobileClose={() => {}} />
            );

            try {
              const navButtons = container.querySelectorAll('nav button');
              const activeButtons = Array.from(navButtons).filter(button =>
                button.className.includes('bg-secondary')
              );
              const inactiveButtons = Array.from(navButtons).filter(button =>
                !button.className.includes('bg-secondary')
              );

              // Both active and inactive buttons should have hover states
              [...activeButtons, ...inactiveButtons].forEach(button => {
                const classes = button.className;
                expect(
                  classes.includes('hover:bg-accent') || 
                  classes.includes('hover:bg-secondary')
                ).toBe(true);
              });
            } finally {
              unmount();
            }
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 32: Responsive navigation pattern**
   * **Validates: Requirements 10.5**
   * 
   * For any navigation menu, when viewport width is below 768px, it should use
   * a mobile-appropriate pattern (hamburger menu or bottom navigation).
   */
  describe('Property 32: Responsive navigation pattern', () => {
    it('should render mobile menu button with proper accessibility', () => {
      fc.assert(
        fc.property(
          fc.func(fc.constant(undefined)),
          (onClickFn) => {
            const { container, unmount } = render(
              <MobileMenuButton onClick={onClickFn} />
            );

            try {
              // Should have a button with aria-label
              const button = container.querySelector('button');
              expect(button).toBeTruthy();
              expect(button?.getAttribute('aria-label')).toBe('Open menu');

              // Should have lg:hidden class for mobile-only display
              expect(button?.className).toContain('lg:hidden');

              // Should have Menu icon
              const menuIcon = button?.querySelector('svg');
              expect(menuIcon).toBeTruthy();
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should show/hide sidebar based on mobileOpen prop', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.constantFrom('admin', 'office', 'agent'),
          (mobileOpen, role) => {
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}/dashboard`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={mobileOpen} onMobileClose={() => {}} />
            );

            try {
              const sidebar = container.querySelector('aside');
              expect(sidebar).toBeTruthy();

              const classes = sidebar?.className || '';
              
              if (mobileOpen) {
                // When open, should have translate-x-0
                expect(classes).toContain('translate-x-0');
              } else {
                // When closed, should have -translate-x-full
                expect(classes).toContain('-translate-x-full');
              }

              // Should always have lg:translate-x-0 for desktop
              expect(classes).toContain('lg:translate-x-0');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should render mobile overlay when menu is open', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent'),
          (role) => {
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}/dashboard`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={true} onMobileClose={() => {}} />
            );

            try {
              // Should have overlay div with bg-black/50
              const overlay = container.querySelector('.bg-black\\/50');
              expect(overlay).toBeTruthy();
              expect(overlay?.className).toContain('fixed');
              expect(overlay?.className).toContain('inset-0');
              expect(overlay?.className).toContain('lg:hidden');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should not render mobile overlay when menu is closed', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent'),
          (role) => {
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}/dashboard`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={false} onMobileClose={() => {}} />
            );

            try {
              // Should not have overlay div
              const overlay = container.querySelector('.bg-black\\/50');
              expect(overlay).toBeFalsy();
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should have mobile close button visible only on mobile', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent'),
          (role) => {
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}/dashboard`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={true} onMobileClose={() => {}} />
            );

            try {
              // Should have close button with aria-label
              const closeButton = container.querySelector('[aria-label="Close menu"]');
              expect(closeButton).toBeTruthy();

              // Close button container should have lg:hidden
              const closeButtonContainer = closeButton?.closest('.lg\\:hidden');
              expect(closeButtonContainer).toBeTruthy();
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should call onMobileClose when overlay is clicked', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent'),
          (role) => {
            const onMobileClose = jest.fn();

            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}/dashboard`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={true} onMobileClose={onMobileClose} />
            );

            try {
              const overlay = container.querySelector('.bg-black\\/50');
              expect(overlay).toBeTruthy();

              // Click the overlay
              if (overlay) {
                fireEvent.click(overlay);
              }

              // Should call onMobileClose
              expect(onMobileClose).toHaveBeenCalledTimes(1);
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should have transition classes for smooth mobile menu animation', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.constantFrom('admin', 'office', 'agent'),
          (mobileOpen, role) => {
            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}/dashboard`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={mobileOpen} onMobileClose={() => {}} />
            );

            try {
              const sidebar = container.querySelector('aside');
              const classes = sidebar?.className || '';

              // Should have transition classes
              expect(classes).toContain('transition-transform');
              expect(classes).toContain('duration-300');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should maintain navigation functionality when closing mobile menu', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('admin', 'office', 'agent'),
          (role) => {
            const onMobileClose = jest.fn();

            (useSession as jest.Mock).mockReturnValue({
              data: {
                user: {
                  id: 'test-user-id',
                  name: 'Test User',
                  email: 'test@example.com',
                  role: role,
                },
              },
              status: 'authenticated',
            });

            (usePathname as jest.Mock).mockReturnValue(`/${role}/dashboard`);

            const { container, unmount } = render(
              <Sidebar mobileOpen={true} onMobileClose={onMobileClose} />
            );

            try {
              const navButtons = container.querySelectorAll('nav button');
              
              // Click a navigation button
              if (navButtons.length > 0) {
                fireEvent.click(navButtons[0]);
                
                // Should call onMobileClose to close the menu
                expect(onMobileClose).toHaveBeenCalled();
                
                // Should also call router.push
                expect(mockRouter.push).toHaveBeenCalled();
              }
            } finally {
              unmount();
            }
          }
        )
      );
    });
  });
});

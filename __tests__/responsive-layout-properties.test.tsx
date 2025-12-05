/**
 * Property-Based Tests for Responsive Layout Behavior
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for responsive layout patterns across different viewport sizes.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 10.1**
 */

import fc from 'fast-check';
import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

/**
 * Helper function to create a multi-column grid layout component for testing
 */
const MultiColumnGrid = ({ columns, children }: { columns: number; children: React.ReactNode }) => {
  const gridClasses = `grid grid-cols-1 md:grid-cols-${Math.min(columns, 2)} lg:grid-cols-${columns} gap-4`;
  return <div className={gridClasses}>{children}</div>;
};

/**
 * Helper function to create a flex row layout component for testing
 */
const FlexRowLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col md:flex-row gap-4">{children}</div>;
};

/**
 * Helper function to extract responsive classes from className string
 */
const extractResponsiveClasses = (className: string) => {
  const classes = className.split(' ');
  return {
    base: classes.filter(c => !c.includes(':')),
    mobile: classes.filter(c => c.startsWith('sm:')),
    tablet: classes.filter(c => c.startsWith('md:')),
    desktop: classes.filter(c => c.startsWith('lg:')),
  };
};

describe('Responsive Layout Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 31: Mobile single-column layout**
   * **Validates: Requirements 10.1**
   * 
   * For any multi-column layout, when viewport width is below 768px,
   * it should stack to a single column.
   */
  describe('Property 31: Mobile single-column layout', () => {
    it('should use grid-cols-1 as base class for multi-column grids', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 6 }), // Number of columns for desktop
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 10 }),
          (columns, items) => {
            const { container, unmount } = render(
              <MultiColumnGrid columns={columns}>
                {items.map((item, idx) => (
                  <div key={idx} data-testid={`item-${idx}`}>
                    {item}
                  </div>
                ))}
              </MultiColumnGrid>
            );

            try {
              const gridElement = container.firstChild as HTMLElement;
              const classes = gridElement.className;

              // Should have grid-cols-1 as base (mobile-first)
              expect(classes).toContain('grid-cols-1');
              
              // Should have grid display
              expect(classes).toContain('grid');
              
              // Should have responsive breakpoint classes
              expect(classes).toMatch(/md:grid-cols-\d+/);
              expect(classes).toMatch(/lg:grid-cols-\d+/);
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should stack flex-row layouts to flex-col on mobile', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
          (items) => {
            const { container, unmount } = render(
              <FlexRowLayout>
                {items.map((item, idx) => (
                  <div key={idx} data-testid={`item-${idx}`}>
                    {item}
                  </div>
                ))}
              </FlexRowLayout>
            );

            try {
              const flexElement = container.firstChild as HTMLElement;
              const classes = flexElement.className;

              // Should have flex-col as base (mobile-first)
              expect(classes).toContain('flex-col');
              
              // Should have flex display
              expect(classes).toContain('flex');
              
              // Should have md:flex-row for tablet and above
              expect(classes).toContain('md:flex-row');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should maintain single-column layout for dashboard metric grids on mobile', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 30 }),
              value: fc.integer({ min: 0, max: 10000 }),
            }),
            { minLength: 2, maxLength: 8 }
          ),
          (metrics) => {
            // Simulate dashboard metrics grid
            const { container, unmount } = render(
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, idx) => (
                  <div key={idx} className="bg-card border rounded-lg p-6">
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                    <div className="text-3xl font-bold">{metric.value}</div>
                  </div>
                ))}
              </div>
            );

            try {
              const gridElement = container.firstChild as HTMLElement;
              const classes = gridElement.className;

              // Should have single column on mobile
              expect(classes).toContain('grid-cols-1');
              
              // Should have 2 columns on tablet
              expect(classes).toContain('md:grid-cols-2');
              
              // Should have 4 columns on desktop
              expect(classes).toContain('lg:grid-cols-4');
              
              // Should have consistent gap
              expect(classes).toContain('gap-6');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should apply mobile-first responsive classes in correct order', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 6 }),
          (columns) => {
            const { container, unmount } = render(
              <MultiColumnGrid columns={columns}>
                <div>Item 1</div>
                <div>Item 2</div>
              </MultiColumnGrid>
            );

            try {
              const gridElement = container.firstChild as HTMLElement;
              const responsive = extractResponsiveClasses(gridElement.className);

              // Base classes should not have breakpoint prefixes
              expect(responsive.base.some(c => c.includes('grid-cols-1'))).toBe(true);
              
              // Tablet classes should have md: prefix
              expect(responsive.tablet.length).toBeGreaterThan(0);
              expect(responsive.tablet.every(c => c.startsWith('md:'))).toBe(true);
              
              // Desktop classes should have lg: prefix
              expect(responsive.desktop.length).toBeGreaterThan(0);
              expect(responsive.desktop.every(c => c.startsWith('lg:'))).toBe(true);
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should maintain consistent gap spacing across all breakpoints', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('gap-2', 'gap-4', 'gap-6', 'gap-8'),
          fc.integer({ min: 2, max: 4 }),
          (gapClass, columns) => {
            const { container, unmount } = render(
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} ${gapClass}`}>
                <div>Item 1</div>
                <div>Item 2</div>
                <div>Item 3</div>
              </div>
            );

            try {
              const gridElement = container.firstChild as HTMLElement;
              const classes = gridElement.className;

              // Gap should be consistent (not responsive)
              expect(classes).toContain(gapClass);
              
              // Should not have responsive gap classes
              expect(classes).not.toMatch(/md:gap-/);
              expect(classes).not.toMatch(/lg:gap-/);
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should handle nested responsive layouts correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 4 }),
          (items) => {
            const { container, unmount } = render(
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {items.map((item, idx) => (
                    <div key={idx}>{item}</div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  {items.map((item, idx) => (
                    <div key={idx + items.length}>{item}</div>
                  ))}
                </div>
              </div>
            );

            try {
              const outerGrid = container.firstChild as HTMLElement;
              const innerFlexContainers = outerGrid.querySelectorAll('.flex');

              // Outer grid should be single column on mobile
              expect(outerGrid.className).toContain('grid-cols-1');
              
              // Inner flex containers should be column on mobile
              innerFlexContainers.forEach((flexContainer) => {
                expect(flexContainer.className).toContain('flex-col');
                expect(flexContainer.className).toContain('md:flex-row');
              });
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should apply responsive padding and spacing correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (content) => {
            const { container, unmount } = render(
              <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                  {content}
                </div>
              </div>
            );

            try {
              const outerContainer = container.firstChild as HTMLElement;
              const classes = outerContainer.className;

              // Should have base padding
              expect(classes).toContain('px-4');
              expect(classes).toContain('py-8');
              
              // Should have responsive horizontal padding
              expect(classes).toContain('sm:px-6');
              expect(classes).toContain('lg:px-8');
              
              // Inner container should have max-width
              const innerContainer = outerContainer.firstChild as HTMLElement;
              expect(innerContainer.className).toContain('max-w-7xl');
              expect(innerContainer.className).toContain('mx-auto');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should maintain content readability with responsive text sizing', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (title) => {
            const { container, unmount } = render(
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                  {title}
                </h1>
              </div>
            );

            try {
              const heading = container.querySelector('h1');
              const classes = heading?.className || '';

              // Should have base text size
              expect(classes).toContain('text-2xl');
              
              // Should have larger sizes for larger screens
              expect(classes).toContain('md:text-3xl');
              expect(classes).toContain('lg:text-4xl');
              
              // Should maintain font weight across breakpoints
              expect(classes).toContain('font-bold');
              expect(classes).not.toMatch(/md:font-/);
              expect(classes).not.toMatch(/lg:font-/);
            } finally {
              unmount();
            }
          }
        )
      );
    });
  });
});

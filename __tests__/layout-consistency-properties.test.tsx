/**
 * Property-Based Tests for Layout Consistency
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for layout components and page structure.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 6.3**
 */

import fc from 'fast-check';
import { render } from '@testing-library/react';
import { PageLayout } from '../src/components/layout/PageLayout';
import React from 'react';
import '@testing-library/jest-dom';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

describe('Layout Consistency Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 22: Page header consistency**
   * **Validates: Requirements 6.3**
   * 
   * For any page, the header should follow a consistent structure with page title,
   * optional description, and optional action buttons.
   */
  describe('Property 22: Page header consistency', () => {
    it('should always render page title as h1 with consistent styling', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (title) => {
            const { container, unmount } = render(
              <PageLayout title={title}>
                <div>Content</div>
              </PageLayout>
            );
            
            try {
              // Should have exactly one h1 element
              const h1Elements = container.querySelectorAll('h1');
              expect(h1Elements).toHaveLength(1);
              
              // h1 should contain the title text (exact match, not normalized)
              expect(h1Elements[0].textContent).toBe(title);
              
              // h1 should have consistent styling classes
              expect(h1Elements[0].className).toContain('text-3xl');
              expect(h1Elements[0].className).toContain('font-bold');
              expect(h1Elements[0].className).toContain('tracking-tight');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should render description with muted styling when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          (title, description) => {
            const { container, unmount } = render(
              <PageLayout title={title} description={description}>
                <div>Content</div>
              </PageLayout>
            );
            
            try {
              // Should have description paragraph with muted styling
              const paragraphs = container.querySelectorAll('p');
              const descParagraph = Array.from(paragraphs).find(p => p.textContent === description);
              
              expect(descParagraph).toBeDefined();
              expect(descParagraph?.className).toContain('text-muted-foreground');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should maintain consistent root container structure', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), { nil: undefined }),
          (title, description) => {
            const { container, unmount } = render(
              <PageLayout title={title} description={description}>
                <div>Content</div>
              </PageLayout>
            );
            
            try {
              // Root container should have consistent vertical spacing
              const rootDiv = container.firstChild as HTMLElement;
              expect(rootDiv.className).toContain('flex');
              expect(rootDiv.className).toContain('flex-col');
              expect(rootDiv.className).toContain('space-y-6');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should render actions in consistent flex container when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (title) => {
            const { container, unmount } = render(
              <PageLayout
                title={title}
                actions={<button data-testid="action-btn">Action</button>}
              >
                <div>Content</div>
              </PageLayout>
            );
            
            try {
              // Should have action button
              const actionBtn = container.querySelector('[data-testid="action-btn"]');
              expect(actionBtn).toBeTruthy();
              
              // Actions container should have consistent spacing
              const actionsContainer = actionBtn?.parentElement;
              expect(actionsContainer?.className).toContain('flex');
              expect(actionsContainer?.className).toContain('items-center');
              expect(actionsContainer?.className).toContain('space-x-2');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should render breadcrumb navigation when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
              href: fc.option(fc.constant('/test-path'), { nil: undefined }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (title, breadcrumbs) => {
            const { container, unmount } = render(
              <PageLayout title={title} breadcrumbs={breadcrumbs}>
                <div>Content</div>
              </PageLayout>
            );
            
            try {
              // Should render breadcrumb navigation
              const nav = container.querySelector('nav[aria-label="breadcrumb"]');
              expect(nav).toBeTruthy();
              
              // Should have separators between items (count should be items - 1)
              const separators = container.querySelectorAll('[role="presentation"]');
              expect(separators.length).toBe(breadcrumbs.length - 1);
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should have responsive header layout structure', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          (title, description) => {
            const { container, unmount } = render(
              <PageLayout
                title={title}
                description={description}
                actions={<button>Action</button>}
              >
                <div>Content</div>
              </PageLayout>
            );
            
            try {
              // Header should have responsive flex layout
              const headerSection = container.querySelector('.md\\:flex-row');
              expect(headerSection).toBeTruthy();
              expect(headerSection?.className).toContain('flex-col');
              expect(headerSection?.className).toContain('md:flex-row');
              expect(headerSection?.className).toContain('md:items-start');
              expect(headerSection?.className).toContain('md:justify-between');
            } finally {
              unmount();
            }
          }
        )
      );
    });

    it('should maintain consistent title styling across all instances', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { minLength: 2, maxLength: 5 }),
          (titles) => {
            // Render multiple PageLayout instances and collect h1 classes
            const h1Classes = titles.map((title) => {
              const { container, unmount } = render(
                <PageLayout title={title}>
                  <div>Content</div>
                </PageLayout>
              );
              
              const h1 = container.querySelector('h1');
              const classes = h1?.className;
              unmount();
              return classes;
            });
            
            // All h1 elements should have identical class names
            const firstH1Classes = h1Classes[0];
            h1Classes.forEach((classes) => {
              expect(classes).toBe(firstH1Classes);
            });
            
            // All should have the same styling tokens
            h1Classes.forEach((classes) => {
              expect(classes).toContain('text-3xl');
              expect(classes).toContain('font-bold');
              expect(classes).toContain('tracking-tight');
            });
          }
        )
      );
    });

    it('should apply custom className while maintaining base classes', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.constantFrom('custom-class', 'test-class', 'my-custom-layout'),
          (title, customClass) => {
            const { container, unmount } = render(
              <PageLayout title={title} className={customClass}>
                <div>Content</div>
              </PageLayout>
            );
            
            try {
              // Root element should include custom class
              const rootDiv = container.firstChild as HTMLElement;
              expect(rootDiv.className).toContain(customClass);
              
              // Should still maintain base classes
              expect(rootDiv.className).toContain('flex');
              expect(rootDiv.className).toContain('flex-col');
            } finally {
              unmount();
            }
          }
        )
      );
    });
  });
});

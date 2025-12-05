/**
 * Property-Based Tests for Dashboard Key Metric Prominence
 * 
 * Feature: ui-professional-refactor, Property 19: Key metric prominence
 * Validates: Requirements 5.2
 * 
 * Tests that key metrics on dashboards are displayed prominently with
 * larger font size and heavier weight than supporting text.
 */

import { render } from '@testing-library/react';
import fc from 'fast-check';
import { DashboardCard } from '@/components/layout/DashboardCard';

describe('Dashboard Key Metric Prominence Properties', () => {
  /**
   * Property 19: Key metric prominence
   * For any dashboard metric card, the primary value should use larger font size
   * and heavier weight than supporting text
   * Validates: Requirements 5.2
   */
  it('should display primary metric values with larger font size than supporting text', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 50 }),
          value: fc.oneof(
            fc.integer({ min: 0, max: 10000 }),
            fc.string({ minLength: 1, maxLength: 20 })
          ),
          description: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        }),
        (cardData) => {
          const { container } = render(
            <DashboardCard
              title={cardData.title}
              value={cardData.value}
              description={cardData.description}
            />
          );

          // Find the primary value element (should be text-2xl font-bold)
          const valueElement = container.querySelector('.text-2xl.font-bold');
          expect(valueElement).toBeTruthy();
          expect(valueElement?.textContent).toBe(String(cardData.value));

          // Find the title element (should be text-sm font-medium)
          const titleElement = container.querySelector('.text-sm.font-medium');
          expect(titleElement).toBeTruthy();
          expect(titleElement?.textContent).toBe(cardData.title);

          // If description exists, verify it's smaller (text-xs)
          if (cardData.description) {
            const descriptionElement = container.querySelector('.text-xs.text-muted-foreground');
            expect(descriptionElement).toBeTruthy();
            expect(descriptionElement?.textContent).toContain(cardData.description);
          }

          // Verify font size hierarchy: value (text-2xl) > title (text-sm) > description (text-xs)
          // text-2xl = 1.5rem, text-sm = 0.875rem, text-xs = 0.75rem
          expect(valueElement).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display primary metric values with heavier font weight than supporting text', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 50 }),
          value: fc.oneof(
            fc.integer({ min: 0, max: 10000 }),
            fc.string({ minLength: 1, maxLength: 20 })
          ),
          description: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        }),
        (cardData) => {
          const { container } = render(
            <DashboardCard
              title={cardData.title}
              value={cardData.value}
              description={cardData.description}
            />
          );

          // Primary value should be font-bold
          const valueElement = container.querySelector('.text-2xl.font-bold');
          expect(valueElement).toBeTruthy();

          // Title should be font-medium (lighter than bold)
          const titleElement = container.querySelector('.text-sm.font-medium');
          expect(titleElement).toBeTruthy();

          // Description should have no explicit font-weight class (defaults to normal)
          if (cardData.description) {
            const descriptionElement = container.querySelector('.text-xs.text-muted-foreground');
            expect(descriptionElement).toBeTruthy();
            // Verify it doesn't have font-bold or font-semibold
            expect(descriptionElement?.classList.contains('font-bold')).toBe(false);
            expect(descriptionElement?.classList.contains('font-semibold')).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain prominence hierarchy across different metric types', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 50 }),
            value: fc.oneof(
              fc.integer({ min: 0, max: 10000 }),
              fc.float({ min: 0, max: 100, noNaN: true }).map(n => `${n.toFixed(1)}%`),
              fc.string({ minLength: 1, maxLength: 20 })
            ),
            description: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          }),
          { minLength: 1, maxLength: 8 }
        ),
        (cards) => {
          const { container } = render(
            <div className="grid grid-cols-4 gap-4">
              {cards.map((card, index) => (
                <DashboardCard
                  key={index}
                  title={card.title}
                  value={card.value}
                  description={card.description}
                />
              ))}
            </div>
          );

          // All primary values should have consistent prominence styling
          const valueElements = container.querySelectorAll('.text-2xl.font-bold');
          expect(valueElements.length).toBe(cards.length);

          // All titles should have consistent styling
          const titleElements = container.querySelectorAll('.text-sm.font-medium');
          expect(titleElements.length).toBe(cards.length);

          // Verify each card maintains the hierarchy
          valueElements.forEach((valueEl, index) => {
            const card = valueEl.closest('.bg-card, [class*="bg-card"]');
            expect(card).toBeTruthy();
            
            // Each card should have exactly one primary value
            const valuesInCard = card?.querySelectorAll('.text-2xl.font-bold');
            expect(valuesInCard?.length).toBe(1);
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});

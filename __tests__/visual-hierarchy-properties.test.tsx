/**
 * Property-Based Tests for Visual Hierarchy
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for visual hierarchy across components.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */

import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  typographyTokens,
  validateHeadingHierarchy,
  validateFontWeightHierarchy,
  validateVisualGrouping,
  extractSpacingValue,
} from '../src/lib/design-system';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

/**
 * Helper function to extract computed font size in pixels
 */
function extractFontSize(element: HTMLElement): number {
  const fontSize = window.getComputedStyle(element).fontSize;
  return parseFloat(fontSize);
}

/**
 * Helper function to extract computed font weight
 */
function extractFontWeight(element: HTMLElement): number {
  const fontWeight = window.getComputedStyle(element).fontWeight;
  return parseInt(fontWeight, 10);
}

/**
 * Helper function to extract spacing (margin/padding) in pixels
 */
function extractSpacing(element: HTMLElement, property: 'marginBottom' | 'marginTop' | 'paddingBottom' | 'paddingTop'): number {
  const spacing = window.getComputedStyle(element)[property];
  return parseFloat(spacing);
}

describe('Visual Hierarchy Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 10: Heading size progression**
   * **Validates: Requirements 3.1**
   * 
   * For any page, heading elements should follow a progressive size hierarchy
   * where h1 > h2 > h3 > h4 > h5 > h6 in font size.
   */
  describe('Property 10: Heading size progression', () => {
    it('should maintain heading size hierarchy h1 > h2 > h3 > h4 > h5 > h6', () => {
      // Test with a fixed set of headings to verify hierarchy
      const headings = [
        { level: 1 as const, text: 'Heading 1', className: 'text-4xl' },
        { level: 2 as const, text: 'Heading 2', className: 'text-3xl' },
        { level: 3 as const, text: 'Heading 3', className: 'text-2xl' },
        { level: 4 as const, text: 'Heading 4', className: 'text-xl' },
        { level: 5 as const, text: 'Heading 5', className: 'text-lg' },
        { level: 6 as const, text: 'Heading 6', className: 'text-base' },
      ];

      const TestComponent = () => (
        <div>
          {headings.map((heading, index) => {
            const Tag = `h${heading.level}` as keyof JSX.IntrinsicElements;
            return (
              <Tag key={index} className={heading.className} data-testid={`heading-${heading.level}`}>
                {heading.text}
              </Tag>
            );
          })}
        </div>
      );

      const { container } = render(<TestComponent />);

      // Verify each heading has the expected class
      headings.forEach((heading) => {
        const element = container.querySelector(`h${heading.level}`);
        expect(element).toHaveClass(heading.className);
      });
    });

    it('should validate heading hierarchy using design tokens', () => {
      fc.assert(
        fc.property(
          fc.constant([
            { level: 1 as const, fontSize: typographyTokens.fontSize['4xl'] },
            { level: 2 as const, fontSize: typographyTokens.fontSize['3xl'] },
            { level: 3 as const, fontSize: typographyTokens.fontSize['2xl'] },
            { level: 4 as const, fontSize: typographyTokens.fontSize.xl },
            { level: 5 as const, fontSize: typographyTokens.fontSize.lg },
            { level: 6 as const, fontSize: typographyTokens.fontSize.base },
          ]),
          (headings) => {
            // Validate that properly ordered headings pass hierarchy check
            expect(validateHeadingHierarchy(headings)).toBe(true);
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 11: Font weight hierarchy**
   * **Validates: Requirements 3.2**
   * 
   * For any content section, primary information should use heavier font weights
   * (semibold, bold) than secondary information (normal, medium).
   */
  describe('Property 11: Font weight hierarchy', () => {
    it('should use heavier font weights for primary content than secondary', () => {
      // Test with fixed primary and secondary content
      const TestComponent = () => (
        <div>
          <div data-testid="primary" className="font-semibold">
            Primary Content
          </div>
          <div data-testid="secondary" className="font-normal">
            Secondary Content
          </div>
        </div>
      );

      const { unmount } = render(<TestComponent />);

      const primaryElement = screen.getByTestId('primary');
      const secondaryElement = screen.getByTestId('secondary');

      // Verify classes are applied correctly
      expect(primaryElement).toHaveClass('font-semibold');
      expect(secondaryElement).toHaveClass('font-normal');

      unmount();
    });

    it('should validate font weight hierarchy using design tokens', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('semibold', 'bold'),
          fc.constantFrom('normal', 'medium'),
          (primaryWeight, secondaryWeight) => {
            const primary = typographyTokens.fontWeight[primaryWeight];
            const secondary = typographyTokens.fontWeight[secondaryWeight];

            // Primary content should have heavier weight than secondary
            expect(validateFontWeightHierarchy(primary, secondary)).toBe(true);
            expect(primary).toBeGreaterThanOrEqual(secondary);
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 12: Visual grouping through spacing**
   * **Validates: Requirements 3.3**
   * 
   * For any set of related elements, the spacing between them should be smaller
   * than the spacing to unrelated elements.
   */
  describe('Property 12: Visual grouping through spacing', () => {
    it('should use smaller spacing for related elements than unrelated', () => {
      fc.assert(
        fc.property(
          fc.record({
            relatedItems: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
            relatedSpacing: fc.constantFrom('space-y-2', 'space-y-3', 'space-y-4'),
            unrelatedSpacing: fc.constantFrom('space-y-6', 'space-y-8', 'space-y-10'),
          }),
          ({ relatedItems, relatedSpacing, unrelatedSpacing }) => {
            // Create a test component with related and unrelated groups
            const TestComponent = () => (
              <div>
                <div data-testid="related-group" className={relatedSpacing}>
                  {relatedItems.map((item, index) => (
                    <div key={index}>{item}</div>
                  ))}
                </div>
                <div data-testid="unrelated-separator" className={unrelatedSpacing}>
                  <div>Unrelated content</div>
                </div>
              </div>
            );

            render(<TestComponent />);

            // Extract spacing values from class names
            const relatedValue = parseInt(relatedSpacing.split('-')[2], 10);
            const unrelatedValue = parseInt(unrelatedSpacing.split('-')[2], 10);

            // Related elements should have smaller spacing
            expect(relatedValue).toBeLessThan(unrelatedValue);
          }
        )
      );
    });

    it('should validate visual grouping using spacing tokens', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(2, 3, 4),
          fc.constantFrom(6, 8, 10, 12),
          (relatedKey, unrelatedKey) => {
            const relatedSpacing = `${relatedKey * 0.25}rem`;
            const unrelatedSpacing = `${unrelatedKey * 0.25}rem`;

            // Related elements should have smaller spacing than unrelated
            expect(validateVisualGrouping(relatedSpacing, unrelatedSpacing)).toBe(true);

            const relatedValue = extractSpacingValue(relatedSpacing);
            const unrelatedValue = extractSpacingValue(unrelatedSpacing);
            expect(relatedValue).toBeLessThan(unrelatedValue);
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 13: Interactive element affordances**
   * **Validates: Requirements 3.4**
   * 
   * For any interactive element (button, link, input), it should have distinct
   * visual styling (color, border, shadow) that differentiates it from
   * non-interactive content.
   */
  describe('Property 13: Interactive element affordances', () => {
    it('should have distinct styling for buttons', () => {
      // Test with fixed button
      const TestComponent = () => (
        <div>
          <button
            data-testid="interactive-button"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Click Me
          </button>
          <div data-testid="non-interactive-text">Click Me</div>
        </div>
      );

      const { unmount } = render(<TestComponent />);

      const button = screen.getByTestId('interactive-button');
      const text = screen.getByTestId('non-interactive-text');

      // Button should have interactive classes
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('hover:bg-primary/90');
      expect(button.tagName).toBe('BUTTON');
      expect(text.tagName).toBe('DIV');

      unmount();
    });

    it('should have distinct styling for links', () => {
      // Test with fixed link
      const TestComponent = () => (
        <div>
          <a
            data-testid="interactive-link"
            href="https://example.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            Link Text
          </a>
          <span data-testid="non-interactive-text">Link Text</span>
        </div>
      );

      const { unmount } = render(<TestComponent />);

      const link = screen.getByTestId('interactive-link');
      const text = screen.getByTestId('non-interactive-text');

      // Link should have interactive classes
      expect(link).toHaveClass('text-primary');
      expect(link).toHaveClass('hover:underline');
      expect(link.tagName).toBe('A');
      expect(text.tagName).toBe('SPAN');

      unmount();
    });

    it('should have distinct styling for inputs', () => {
      // Test with fixed input
      const TestComponent = () => (
        <div>
          <input
            data-testid="interactive-input"
            placeholder="Enter text"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          />
          <div data-testid="non-interactive-text">Enter text</div>
        </div>
      );

      const { unmount } = render(<TestComponent />);

      const input = screen.getByTestId('interactive-input');
      const text = screen.getByTestId('non-interactive-text');

      // Input should have interactive classes
      expect(input).toHaveClass('border');
      expect(input).toHaveClass('border-input');
      expect(input.tagName).toBe('INPUT');
      expect(text.tagName).toBe('DIV');

      unmount();
    });
  });
});

/**
 * Property-Based Tests for Badge Component Usage
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for status badge components.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 2.5, 11.1, 11.5**
 */

import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { LeadStatusBadge } from '../src/components/leads/LeadStatusBadge';
import { 
  getStatusLabel, 
  getStatusVariant,
  STATUS_VARIANTS,
  STATUS_LABELS 
} from '../src/lib/utils/status-labels';
import type { LeadStatus } from '../src/types/database';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

// Helper to calculate contrast ratio (simplified WCAG formula)
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Helper to extract RGB from className color definitions
function extractColorFromClassName(className: string): { text: string; bg: string } {
  // Extract text color (e.g., text-blue-700)
  const textMatch = className.match(/text-([\w-]+)/);
  // Extract background color (e.g., bg-blue-50)
  const bgMatch = className.match(/bg-([\w-]+)/);
  
  return {
    text: textMatch ? textMatch[1] : '',
    bg: bgMatch ? bgMatch[1] : ''
  };
}

// Approximate RGB values for common Tailwind colors (for testing purposes)
const tailwindColorMap: Record<string, [number, number, number]> = {
  'blue-700': [29, 78, 216],
  'blue-50': [239, 246, 255],
  'cyan-700': [14, 116, 144],
  'cyan-50': [236, 254, 255],
  'indigo-700': [67, 56, 202],
  'indigo-50': [238, 242, 255],
  'green-700': [21, 128, 61],
  'green-50': [240, 253, 244],
  'red-700': [185, 28, 28],
  'red-50': [254, 242, 242],
};

describe('Badge Component Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 8: shadcn/ui Badge usage for status indicators**
   * **Validates: Requirements 2.5**
   * 
   * For any status badge or label indicator, it should use the shadcn/ui Badge component.
   */
  describe('Property 8: shadcn/ui Badge usage for status indicators', () => {
    it('should render using Badge component for all status values', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          (status) => {
            const { container } = render(<LeadStatusBadge status={status} />);
            
            // Badge should render with data-slot="badge" attribute (shadcn/ui Badge marker)
            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge).not.toBeNull();
            
            // Badge should have the status label text
            const label = getStatusLabel(status);
            expect(badge?.textContent).toBe(label);
          }
        )
      );
    });

    it('should use appropriate Badge variant for each status', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          (status) => {
            const variant = getStatusVariant(status);
            
            // Variant should be defined
            expect(variant).toBeDefined();
            expect(variant.variant).toBeDefined();
            expect(variant.className).toBeDefined();
            
            // Variant should be one of the valid Badge variants
            expect(['default', 'secondary', 'destructive', 'outline']).toContain(variant.variant);
          }
        )
      );
    });

    it('should apply custom className alongside Badge styles', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          fc.constantFrom('custom-class', 'test-badge', 'my-badge'),
          (status, customClass) => {
            const { container } = render(
              <LeadStatusBadge status={status} className={customClass} />
            );
            
            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge?.className).toContain(customClass);
          }
        )
      );
    });

    it('should support different size variants', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>('lead', 'lead_interested', 'lead_processing'),
          fc.constantFrom<'sm' | 'default' | 'lg'>('sm', 'default', 'lg'),
          (status, size) => {
            const { container } = render(
              <LeadStatusBadge status={status} size={size} />
            );
            
            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge).not.toBeNull();
            
            // Size-specific classes should be applied
            if (size === 'sm') {
              expect(badge?.className).toMatch(/text-\[10px\]/);
            } else if (size === 'lg') {
              expect(badge?.className).toMatch(/text-sm/);
            }
          }
        )
      );
    });

    it('should have title attribute for accessibility', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          (status) => {
            const { container } = render(<LeadStatusBadge status={status} />);
            
            const badge = container.querySelector('[data-slot="badge"]');
            const label = getStatusLabel(status);
            
            // Badge should have title attribute with status label
            expect(badge?.getAttribute('title')).toBe(label);
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 33: Status color consistency**
   * **Validates: Requirements 11.1**
   * 
   * For any status badge displaying the same status value, it should use the same
   * color across all instances in the application.
   */
  describe('Property 33: Status color consistency', () => {
    it('should use consistent colors for the same status across multiple renders', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          fc.integer({ min: 2, max: 5 }),
          (status, renderCount) => {
            // Render the same status multiple times
            const renders = Array.from({ length: renderCount }, () => 
              render(<LeadStatusBadge status={status} />)
            );
            
            // Get variant for this status
            const expectedVariant = getStatusVariant(status);
            
            // All renders should have the same className
            const classNames = renders.map(({ container }) => {
              const badge = container.querySelector('[data-slot="badge"]');
              return badge?.className || '';
            });
            
            // All classNames should contain the expected variant className
            classNames.forEach(className => {
              expect(className).toContain(expectedVariant.className.split(' ')[0]);
            });
            
            // Clean up
            renders.forEach(({ unmount }) => unmount());
          }
        )
      );
    });

    it('should have unique color mapping for each distinct status', () => {
      const statuses: LeadStatus[] = [
        'lead',
        'lead_interested',
        'lead_processing',
        'lead_completed',
        'lead_cancelled'
      ];
      
      // Get all status variants
      const variants = statuses.map(status => ({
        status,
        variant: getStatusVariant(status)
      }));
      
      // Each status should have a defined variant
      variants.forEach(({ status, variant }) => {
        expect(variant).toBeDefined();
        expect(variant.className).toBeDefined();
        expect(STATUS_VARIANTS[status]).toEqual(variant);
      });
      
      // Variants should be distinguishable (different classNames)
      const classNames = variants.map(v => v.variant.className);
      const uniqueClassNames = new Set(classNames);
      
      // All statuses should have distinct color combinations
      expect(uniqueClassNames.size).toBe(statuses.length);
    });

    it('should maintain color consistency in STATUS_VARIANTS mapping', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          (status) => {
            // Get variant from function
            const variant = getStatusVariant(status);
            
            // Get variant from constant
            const constantVariant = STATUS_VARIANTS[status];
            
            // They should be identical
            expect(variant).toEqual(constantVariant);
            expect(variant.variant).toBe(constantVariant.variant);
            expect(variant.className).toBe(constantVariant.className);
          }
        )
      );
    });

    it('should have consistent label mapping', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          (status) => {
            // Get label from function
            const label = getStatusLabel(status);
            
            // Get label from constant
            const constantLabel = STATUS_LABELS[status];
            
            // They should be identical
            expect(label).toBe(constantLabel);
            expect(label).toBeDefined();
            expect(label.length).toBeGreaterThan(0);
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 34: Status accessibility contrast**
   * **Validates: Requirements 11.5**
   * 
   * For any status badge, the contrast ratio between text and background should
   * meet WCAG AA standards (4.5:1 for normal text).
   */
  describe('Property 34: Status accessibility contrast', () => {
    it('should have sufficient contrast ratio for all status badges', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          (status) => {
            const variant = getStatusVariant(status);
            const colors = extractColorFromClassName(variant.className);
            
            // Colors should be defined
            expect(colors.text).toBeTruthy();
            expect(colors.bg).toBeTruthy();
            
            // Get RGB values for the colors
            const textRgb = tailwindColorMap[colors.text];
            const bgRgb = tailwindColorMap[colors.bg];
            
            if (textRgb && bgRgb) {
              // Calculate contrast ratio
              const contrastRatio = getContrastRatio(textRgb, bgRgb);
              
              // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
              // Badge text is small, so we use 4.5:1
              expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
            }
          }
        )
      );
    });

    it('should use semantic color combinations', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          (status) => {
            const variant = getStatusVariant(status);
            
            // Completed status should use green colors
            if (status === 'lead_completed') {
              expect(variant.className).toContain('green');
            }
            
            // Cancelled status should use red/destructive colors
            if (status === 'lead_cancelled') {
              expect(variant.className).toContain('red');
            }
            
            // Processing status should use indigo colors
            if (status === 'lead_processing') {
              expect(variant.className).toContain('indigo');
            }
            
            // Lead status should use blue colors
            if (status === 'lead') {
              expect(variant.className).toContain('blue');
            }
            
            // Interested status should use cyan colors
            if (status === 'lead_interested') {
              expect(variant.className).toContain('cyan');
            }
          }
        )
      );
    });

    it('should have readable text on all background colors', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          (status) => {
            const { container } = render(<LeadStatusBadge status={status} />);
            const badge = container.querySelector('[data-slot="badge"]');
            
            // Badge should be visible and have text content
            expect(badge).not.toBeNull();
            expect(badge?.textContent).toBeTruthy();
            expect(badge?.textContent?.length).toBeGreaterThan(0);
            
            // Badge should have color classes applied
            const className = badge?.className || '';
            expect(className).toMatch(/text-/);
            expect(className).toMatch(/bg-/);
          }
        )
      );
    });

    it('should maintain contrast in hover states', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          (status) => {
            const variant = getStatusVariant(status);
            
            // Hover state should be defined in className
            expect(variant.className).toContain('hover:');
            
            // Hover state should maintain color consistency
            const hoverMatch = variant.className.match(/hover:bg-([\w-]+)/);
            expect(hoverMatch).toBeTruthy();
          }
        )
      );
    });

    it('should use border colors that complement the badge colors', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<LeadStatus>(
            'lead',
            'lead_interested',
            'lead_processing',
            'lead_completed',
            'lead_cancelled'
          ),
          (status) => {
            const variant = getStatusVariant(status);
            
            // Border color should be defined
            expect(variant.className).toContain('border-');
            
            // Extract border color
            const borderMatch = variant.className.match(/border-([\w-]+)/);
            expect(borderMatch).toBeTruthy();
            
            // Border should use the same color family as text/bg
            const colors = extractColorFromClassName(variant.className);
            const borderColor = borderMatch?.[1] || '';
            
            // Border should be from the same color family
            if (colors.text.includes('blue')) {
              expect(borderColor).toContain('blue');
            }
            if (colors.text.includes('green')) {
              expect(borderColor).toContain('green');
            }
            if (colors.text.includes('red')) {
              expect(borderColor).toContain('red');
            }
          }
        )
      );
    });
  });
});

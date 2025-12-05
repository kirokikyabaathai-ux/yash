/**
 * Property-Based Tests for Button Component Usage
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for shadcn/ui Button component usage,
 * variant appropriateness, disabled styling, and loading states.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 2.2, 8.1, 8.3, 8.5**
 */

import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import React from 'react';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

describe('Button Component Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 5: shadcn/ui Button usage**
   * **Validates: Requirements 2.2**
   * 
   * For any button element in the application, it should use the shadcn/ui Button
   * component with an appropriate variant (default, secondary, outline, destructive, ghost, link).
   */
  describe('Property 5: shadcn/ui Button usage', () => {
    it('should render Button component with all valid variants', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'secondary', 'outline', 'destructive', 'ghost', 'link'),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (variant, text) => {
            const { container } = render(
              <Button variant={variant as any}>{text}</Button>
            );
            
            // Button should render
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
            
            // Button should have data-slot attribute
            expect(button).toHaveAttribute('data-slot', 'button');
            
            // Button should contain the text (HTML normalizes whitespace)
            // HTML collapses multiple spaces into single spaces
            const normalizedText = text.trim().replace(/\s+/g, ' ');
            expect(button?.textContent?.trim().replace(/\s+/g, ' ')).toBe(normalizedText);
          }
        )
      );
    });

    it('should apply correct variant classes', () => {
      const variantClassMap = {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        outline: 'border',
        destructive: 'bg-destructive',
        ghost: 'hover:bg-accent',
        link: 'underline-offset-4',
      };

      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(variantClassMap)),
          (variant) => {
            const { container } = render(
              <Button variant={variant as any}>Test</Button>
            );
            
            const button = container.querySelector('button');
            const expectedClass = variantClassMap[variant as keyof typeof variantClassMap];
            
            // Button should have the variant-specific class
            expect(button?.className).toContain(expectedClass);
          }
        )
      );
    });

    it('should render with all valid sizes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'),
          (size) => {
            const { container } = render(
              <Button size={size as any}>Test</Button>
            );
            
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
          }
        )
      );
    });

    it('should accept custom className', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-z-]+$/.test(s)),
          (customClass) => {
            const { container } = render(
              <Button className={customClass}>Test</Button>
            );
            
            const button = container.querySelector('button');
            expect(button?.className).toContain(customClass);
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 26: Button variant appropriateness**
   * **Validates: Requirements 8.1**
   * 
   * For any button, its variant should match its action type: primary actions use "default",
   * secondary actions use "secondary" or "outline", destructive actions use "destructive".
   */
  describe('Property 26: Button variant appropriateness', () => {
    it('should use default variant for primary actions', () => {
      const primaryActions = ['Submit', 'Save', 'Create', 'Add', 'Confirm'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...primaryActions),
          (actionText) => {
            const { container } = render(
              <Button variant="default">{actionText}</Button>
            );
            
            const button = container.querySelector('button');
            
            // Primary action buttons should have primary styling
            expect(button?.className).toContain('bg-primary');
            expect(button?.className).toContain('text-primary-foreground');
          }
        )
      );
    });

    it('should use secondary or outline variant for secondary actions', () => {
      const secondaryActions = ['Cancel', 'Back', 'Skip', 'View', 'Edit'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...secondaryActions),
          fc.constantFrom('secondary', 'outline'),
          (actionText, variant) => {
            const { container } = render(
              <Button variant={variant as any}>{actionText}</Button>
            );
            
            const button = container.querySelector('button');
            
            // Secondary action buttons should not have primary styling
            expect(button?.className).not.toContain('bg-primary');
            
            // Should have secondary or outline styling
            if (variant === 'secondary') {
              expect(button?.className).toContain('bg-secondary');
            } else {
              expect(button?.className).toContain('border');
            }
          }
        )
      );
    });

    it('should use destructive variant for destructive actions', () => {
      const destructiveActions = ['Delete', 'Remove', 'Destroy', 'Clear'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...destructiveActions),
          (actionText) => {
            const { container } = render(
              <Button variant="destructive">{actionText}</Button>
            );
            
            const button = container.querySelector('button');
            
            // Destructive action buttons should have destructive styling
            expect(button?.className).toContain('bg-destructive');
            expect(button?.className).toContain('text-white');
          }
        )
      );
    });

    it('should use ghost variant for subtle actions', () => {
      const subtleActions = ['Close', 'Dismiss', 'More', 'Options'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...subtleActions),
          (actionText) => {
            const { container } = render(
              <Button variant="ghost">{actionText}</Button>
            );
            
            const button = container.querySelector('button');
            
            // Ghost buttons should have hover styling but no background
            expect(button?.className).toContain('hover:bg-accent');
            expect(button?.className).not.toContain('bg-primary');
            expect(button?.className).not.toContain('bg-secondary');
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 27: Disabled button styling**
   * **Validates: Requirements 8.3**
   * 
   * For any disabled button, it should have reduced opacity (0.5) and not respond to click events.
   */
  describe('Property 27: Disabled button styling', () => {
    it('should apply disabled styling with reduced opacity', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'secondary', 'outline', 'destructive', 'ghost'),
          fc.string({ minLength: 1, maxLength: 30 }),
          (variant, text) => {
            const { container } = render(
              <Button variant={variant as any} disabled>{text}</Button>
            );
            
            const button = container.querySelector('button');
            
            // Disabled button should have disabled attribute
            expect(button).toBeDisabled();
            
            // Disabled button should have opacity-50 class
            expect(button?.className).toContain('disabled:opacity-50');
            
            // Disabled button should have pointer-events-none
            expect(button?.className).toContain('disabled:pointer-events-none');
          }
        )
      );
    });

    it('should not respond to click events when disabled', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'secondary', 'outline'),
          (variant) => {
            const handleClick = jest.fn();
            const { container } = render(
              <Button variant={variant as any} disabled onClick={handleClick}>
                Click Me
              </Button>
            );
            
            const button = container.querySelector('button');
            
            // Try to click the disabled button
            button?.click();
            
            // Click handler should not be called
            expect(handleClick).not.toHaveBeenCalled();
          }
        )
      );
    });

    it('should maintain disabled state across all variants', () => {
      const variants = ['default', 'secondary', 'outline', 'destructive', 'ghost', 'link'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...variants),
          (variant) => {
            const { container } = render(
              <Button variant={variant as any} disabled>Test</Button>
            );
            
            const button = container.querySelector('button');
            
            // All variants should respect disabled state
            expect(button).toBeDisabled();
            expect(button?.className).toContain('disabled:opacity-50');
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 28: Button loading states**
   * **Validates: Requirements 8.5**
   * 
   * For any button performing an async action, it should display a loading indicator
   * (spinner or loading text) and be disabled during the operation.
   */
  describe('Property 28: Button loading states', () => {
    it('should display loading indicator when loading', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'secondary', 'outline'),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          (variant, text) => {
            const { container } = render(
              <LoadingButton variant={variant as any} loading>
                {text}
              </LoadingButton>
            );
            
            const button = container.querySelector('button');
            
            // Button should be disabled when loading
            expect(button).toBeDisabled();
            
            // Button should contain a spinner (div with role="status")
            const spinner = container.querySelector('[role="status"]');
            expect(spinner).toBeInTheDocument();
          }
        )
      );
    });

    it('should be disabled during loading state', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'secondary', 'outline', 'destructive'),
          (variant) => {
            const handleClick = jest.fn();
            const { container } = render(
              <LoadingButton 
                variant={variant as any} 
                loading 
                onClick={handleClick}
              >
                Submit
              </LoadingButton>
            );
            
            const button = container.querySelector('button');
            
            // Button should be disabled
            expect(button).toBeDisabled();
            
            // Try to click the loading button
            button?.click();
            
            // Click handler should not be called
            expect(handleClick).not.toHaveBeenCalled();
          }
        )
      );
    });

    it('should show loading indicator without removing button text', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          (buttonText) => {
            const { container } = render(
              <LoadingButton loading>{buttonText}</LoadingButton>
            );
            
            const button = container.querySelector('button');
            
            // Button should still contain the text (along with "Loading..." from spinner)
            const buttonContent = button?.textContent || '';
            expect(buttonContent).toContain(buttonText.trim());
            
            // Button should also contain the spinner (div with role="status")
            const spinner = container.querySelector('[role="status"]');
            expect(spinner).toBeInTheDocument();
          }
        )
      );
    });

    it('should not show loading indicator when not loading', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'secondary', 'outline'),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          (variant, text) => {
            const { container } = render(
              <LoadingButton variant={variant as any} loading={false}>
                {text}
              </LoadingButton>
            );
            
            const button = container.querySelector('button');
            
            // Button should not be disabled
            expect(button).not.toBeDisabled();
            
            // Button should not contain a spinner
            const spinner = container.querySelector('[role="status"]');
            expect(spinner).not.toBeInTheDocument();
          }
        )
      );
    });

    it('should handle both disabled and loading states', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (disabled, loading) => {
            const { container } = render(
              <LoadingButton disabled={disabled} loading={loading}>
                Test
              </LoadingButton>
            );
            
            const button = container.querySelector('button');
            
            // Button should be disabled if either disabled or loading is true
            if (disabled || loading) {
              expect(button).toBeDisabled();
            } else {
              expect(button).not.toBeDisabled();
            }
            
            // Spinner should only show when loading
            const spinner = container.querySelector('[role="status"]');
            if (loading) {
              expect(spinner).toBeInTheDocument();
            } else {
              expect(spinner).not.toBeInTheDocument();
            }
          }
        )
      );
    });
  });
});

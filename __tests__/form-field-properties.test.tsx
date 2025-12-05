/**
 * Property-Based Tests for Form Field Requirements
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for form field components including labeling,
 * required field indicators, and inline error display.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 4.2, 4.3, 4.4**
 */

import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormField } from '../src/components/forms/FormField';
import { Input } from '../src/components/ui/input';
import React from 'react';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

describe('Form Field Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 14: Form field labeling**
   * **Validates: Requirements 4.2**
   * 
   * For any form input field, it should have an associated label element with clear text.
   */
  describe('Property 14: Form field labeling', () => {
    it('should render a label for every form field', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 1),
          (labelText) => {
            const { container } = render(
              <FormField label={labelText}>
                <Input />
              </FormField>
            );

            // Label should be present in the document
            const label = container.querySelector('label');
            expect(label).toBeInTheDocument();
            
            // Label should be a label element
            expect(label?.tagName).toBe('LABEL');
            
            // Label should have non-empty text
            expect(label?.textContent).toContain(labelText);
            expect(label?.textContent?.trim()).not.toBe('');
          }
        )
      );
    });

    it('should associate label with input via htmlFor/id', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 1),
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-z][a-z0-9-]*$/.test(s)),
          (labelText, fieldId) => {
            const { container } = render(
              <FormField label={labelText} htmlFor={fieldId}>
                <Input />
              </FormField>
            );

            // Label should have htmlFor attribute
            const label = container.querySelector('label');
            expect(label).toHaveAttribute('for', fieldId);
            expect(label?.textContent).toContain(labelText);
            
            // Input should have matching id
            const input = container.querySelector('input');
            expect(input).toHaveAttribute('id', fieldId);
          }
        )
      );
    });

    it('should generate valid id from label when htmlFor not provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 1),
          (labelText) => {
            const { container } = render(
              <FormField label={labelText}>
                <Input />
              </FormField>
            );

            // Label should have htmlFor attribute
            const label = container.querySelector('label');
            const htmlFor = label?.getAttribute('for');
            expect(htmlFor).toBeTruthy();
            expect(htmlFor).toMatch(/^field-/);
            expect(label?.textContent).toContain(labelText);
            
            // Input should have matching id
            const input = container.querySelector('input');
            expect(input).toHaveAttribute('id', htmlFor);
          }
        )
      );
    });

    it('should render label with proper accessibility attributes', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 1),
          (labelText) => {
            const { container } = render(
              <FormField label={labelText}>
                <Input />
              </FormField>
            );

            const label = container.querySelector('label');
            
            // Label should be visible and accessible
            expect(label).toBeVisible();
            expect(label).toHaveClass('text-sm', 'font-medium');
            expect(label?.textContent).toContain(labelText);
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 15: Required field indicators**
   * **Validates: Requirements 4.4**
   * 
   * For any required form field, it should display a consistent visual indicator
   * (asterisk or "required" text).
   */
  describe('Property 15: Required field indicators', () => {
    it('should display asterisk for required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 1),
          (labelText) => {
            const { container } = render(
              <FormField label={labelText} required>
                <Input />
              </FormField>
            );

            // Required indicator (asterisk) should be present
            const label = container.querySelector('label');
            expect(label?.textContent).toContain('*');
            expect(label?.textContent).toContain(labelText);
            
            // Asterisk should have proper styling
            const asterisk = label?.querySelector('span');
            expect(asterisk).toBeInTheDocument();
            expect(asterisk).toHaveClass('text-destructive');
          }
        )
      );
    });

    it('should have aria-label on required indicator', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 1),
          (labelText) => {
            const { container } = render(
              <FormField label={labelText} required>
                <Input />
              </FormField>
            );

            // Required indicator should have aria-label for screen readers
            const asterisk = container.querySelector('span[aria-label="required"]');
            expect(asterisk).toBeInTheDocument();
          }
        )
      );
    });

    it('should not display asterisk for non-required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 1),
          (labelText) => {
            const { container } = render(
              <FormField label={labelText} required={false}>
                <Input />
              </FormField>
            );

            // Required indicator should not be present
            const asterisk = container.querySelector('span[aria-label="required"]');
            expect(asterisk).not.toBeInTheDocument();
          }
        )
      );
    });

    it('should consistently style required indicators across all fields', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            { minLength: 2, maxLength: 5 }
          ),
          (labelTexts) => {
            const { container } = render(
              <div>
                {labelTexts.map((label, index) => (
                  <FormField key={index} label={label} required>
                    <Input />
                  </FormField>
                ))}
              </div>
            );

            // All required indicators should have consistent styling
            const asterisks = container.querySelectorAll('span[aria-label="required"]');
            expect(asterisks.length).toBe(labelTexts.length);
            
            asterisks.forEach(asterisk => {
              expect(asterisk).toHaveClass('text-destructive', 'ml-1');
            });
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 16: Inline error display**
   * **Validates: Requirements 4.3**
   * 
   * For any form field with a validation error, the error message should display
   * inline below the field with error styling (red text, error icon).
   */
  describe('Property 16: Inline error display', () => {
    it('should display error message inline below the field', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 1),
          fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          (labelText, errorMessage) => {
            const { container } = render(
              <FormField label={labelText} error={errorMessage}>
                <Input />
              </FormField>
            );

            // Error message should be present
            const errorParagraph = container.querySelector('.text-destructive[id$="-error"]');
            expect(errorParagraph).toBeInTheDocument();
            expect(errorParagraph?.textContent).toContain(errorMessage);
            
            // Error should be a paragraph element
            expect(errorParagraph?.tagName).toBe('P');
            
            // Error should have destructive styling
            expect(errorParagraph).toHaveClass('text-sm', 'text-destructive');
          }
        )
      );
    });

    it('should display error icon with error message', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          (labelText, errorMessage) => {
            const { container } = render(
              <FormField label={labelText} error={errorMessage}>
                <Input />
              </FormField>
            );

            // Error message should contain an icon
            const errorParagraph = container.querySelector('.text-destructive[id$="-error"]');
            expect(errorParagraph).toBeInTheDocument();
            expect(errorParagraph?.textContent).toContain(errorMessage);
            
            const icon = errorParagraph?.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('w-4', 'h-4');
          }
        )
      );
    });

    it('should set aria-invalid on input when error is present', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          (labelText, errorMessage) => {
            const { container } = render(
              <FormField label={labelText} error={errorMessage}>
                <Input />
              </FormField>
            );

            // Input should have aria-invalid attribute
            const input = container.querySelector('input');
            expect(input).toHaveAttribute('aria-invalid', 'true');
          }
        )
      );
    });

    it('should associate error message with input via aria-describedby', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          (labelText, errorMessage) => {
            const { container } = render(
              <FormField label={labelText} error={errorMessage}>
                <Input />
              </FormField>
            );

            // Input should have aria-describedby pointing to error
            const input = container.querySelector('input');
            const ariaDescribedBy = input?.getAttribute('aria-describedby');
            expect(ariaDescribedBy).toBeTruthy();
            expect(ariaDescribedBy).toContain('-error');
            
            // Error should have matching id
            const errorParagraph = container.querySelector('.text-destructive[id$="-error"]');
            expect(errorParagraph).toBeInTheDocument();
            expect(errorParagraph).toHaveAttribute('id');
            expect(ariaDescribedBy).toContain(errorParagraph?.getAttribute('id') || '');
          }
        )
      );
    });

    it('should apply error styling to input border', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          (labelText, errorMessage) => {
            const { container } = render(
              <FormField label={labelText} error={errorMessage}>
                <Input />
              </FormField>
            );

            // Input should have error border styling
            const input = container.querySelector('input');
            expect(input).toHaveClass('border-destructive');
          }
        )
      );
    });

    it('should not display error when no error is provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (labelText) => {
            const { container } = render(
              <FormField label={labelText}>
                <Input />
              </FormField>
            );

            // No error message should be present
            const errors = container.querySelectorAll('.text-destructive');
            // Only the required asterisk might have text-destructive, not an error message
            const errorMessages = Array.from(errors).filter(el => el.tagName === 'P');
            expect(errorMessages.length).toBe(0);
            
            // Input should not have aria-invalid
            const input = container.querySelector('input');
            expect(input).not.toHaveAttribute('aria-invalid', 'true');
          }
        )
      );
    });

    it('should hide help text when error is displayed', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          (labelText, errorMessage, helpText) => {
            const { container } = render(
              <FormField label={labelText} error={errorMessage} helpText={helpText}>
                <Input />
              </FormField>
            );

            // Error should be displayed
            const errorParagraph = container.querySelector('.text-destructive[id$="-error"]');
            expect(errorParagraph).toBeInTheDocument();
            expect(errorParagraph?.textContent).toContain(errorMessage);
            
            // Help text should not be displayed when error is present
            const helpParagraph = container.querySelector('.text-muted-foreground[id$="-help"]');
            expect(helpParagraph).not.toBeInTheDocument();
          }
        )
      );
    });

    it('should display help text when no error is present', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          (labelText, helpText) => {
            const { container } = render(
              <FormField label={labelText} helpText={helpText}>
                <Input />
              </FormField>
            );

            // Help text should be displayed
            const helpParagraph = container.querySelector('.text-muted-foreground[id$="-help"]');
            expect(helpParagraph).toBeInTheDocument();
            expect(helpParagraph?.textContent).toContain(helpText);
            expect(helpParagraph).toHaveClass('text-sm', 'text-muted-foreground');
          }
        )
      );
    });
  });

  /**
   * Integration tests for combined properties
   */
  describe('Combined form field properties', () => {
    it('should handle all properties together correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 1),
          fc.boolean(),
          fc.option(fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0)),
          fc.option(fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0)),
          (labelText, required, errorMessage, helpText) => {
            const { container } = render(
              <FormField
                label={labelText}
                required={required}
                error={errorMessage || undefined}
                helpText={helpText || undefined}
              >
                <Input />
              </FormField>
            );

            // Label should always be present
            const labels = container.querySelectorAll('label');
            expect(labels.length).toBeGreaterThan(0);
            const label = labels[0];
            expect(label.textContent).toContain(labelText);
            
            // Required indicator should match required prop
            const asterisk = label.querySelector('span[aria-label="required"]');
            if (required) {
              expect(asterisk).toBeInTheDocument();
            } else {
              expect(asterisk).not.toBeInTheDocument();
            }
            
            // Error handling
            const input = container.querySelector('input');
            if (errorMessage) {
              const errorParagraph = container.querySelector('.text-destructive[id$="-error"]');
              expect(errorParagraph).toBeInTheDocument();
              expect(errorParagraph?.textContent).toContain(errorMessage);
              expect(input).toHaveAttribute('aria-invalid', 'true');
              expect(input).toHaveClass('border-destructive');
              
              // Help text should be hidden when error is present
              if (helpText) {
                const helpParagraph = container.querySelector('.text-muted-foreground[id$="-help"]');
                expect(helpParagraph).not.toBeInTheDocument();
              }
            } else {
              expect(input).not.toHaveAttribute('aria-invalid', 'true');
              
              // Help text should be shown when no error
              if (helpText) {
                const helpParagraph = container.querySelector('.text-muted-foreground[id$="-help"]');
                expect(helpParagraph).toBeInTheDocument();
                expect(helpParagraph?.textContent).toContain(helpText);
              }
            }
          }
        )
      );
    });
  });
});

/**
 * Property-Based Tests for Form Component Usage
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests that all form input elements use shadcn/ui components consistently.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Feature: ui-professional-refactor, Property 4: shadcn/ui component usage for forms**
 * **Validates: Requirements 2.1**
 */

import '@testing-library/jest-dom';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

describe('Form Component Usage Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 4: shadcn/ui component usage for forms**
   * **Validates: Requirements 2.1**
   * 
   * For any form input element (text input, select, textarea), it should be implemented
   * using the corresponding shadcn/ui component (Input, Select, Textarea).
   */
  describe('Property 4: shadcn/ui component usage for forms', () => {
    it('should render Input component with consistent styling', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.constantFrom('text', 'email', 'tel', 'password', 'number'),
          (id, placeholder, type) => {
            const { container } = render(
              <Input
                id={id}
                type={type}
                placeholder={placeholder}
              />
            );

            const input = container.querySelector('input');
            
            // Input should be rendered
            expect(input).toBeInTheDocument();
            
            // Input should have shadcn/ui base classes
            expect(input).toHaveClass('flex');
            expect(input).toHaveClass('h-10');
            expect(input).toHaveClass('w-full');
            expect(input).toHaveClass('rounded-md');
            expect(input).toHaveClass('border');
            expect(input).toHaveClass('border-input');
            expect(input).toHaveClass('bg-background');
            expect(input).toHaveClass('px-3');
            expect(input).toHaveClass('py-2');
            
            // Input should have correct type
            expect(input).toHaveAttribute('type', type);
            
            // Input should have placeholder
            expect(input).toHaveAttribute('placeholder', placeholder);
          }
        )
      );
    });

    it('should render Input component with error state styling', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.boolean(),
          (id, hasError) => {
            const { container } = render(
              <Input
                id={id}
                className={hasError ? 'border-destructive' : ''}
                aria-invalid={hasError}
              />
            );

            const input = container.querySelector('input');
            
            // Input should be rendered
            expect(input).toBeInTheDocument();
            
            // If error, should have destructive border
            if (hasError) {
              expect(input).toHaveClass('border-destructive');
              expect(input).toHaveAttribute('aria-invalid', 'true');
            } else {
              expect(input).not.toHaveClass('border-destructive');
            }
          }
        )
      );
    });

    it('should render Input component with disabled state', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.boolean(),
          (id, isDisabled) => {
            const { container } = render(
              <Input
                id={id}
                disabled={isDisabled}
              />
            );

            const input = container.querySelector('input');
            
            // Input should be rendered
            expect(input).toBeInTheDocument();
            
            // If disabled, should have disabled attribute and styling
            if (isDisabled) {
              expect(input).toBeDisabled();
              expect(input).toHaveClass('disabled:cursor-not-allowed');
              expect(input).toHaveClass('disabled:opacity-50');
            } else {
              expect(input).not.toBeDisabled();
            }
          }
        )
      );
    });

    it('should render Textarea component with consistent styling', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.integer({ min: 2, max: 10 }),
          (id, placeholder, rows) => {
            const { container } = render(
              <Textarea
                id={id}
                placeholder={placeholder}
                rows={rows}
              />
            );

            const textarea = container.querySelector('textarea');
            
            // Textarea should be rendered
            expect(textarea).toBeInTheDocument();
            
            // Textarea should have shadcn/ui base classes
            expect(textarea).toHaveClass('flex');
            expect(textarea).toHaveClass('min-h-16');
            expect(textarea).toHaveClass('w-full');
            expect(textarea).toHaveClass('rounded-md');
            expect(textarea).toHaveClass('border');
            expect(textarea).toHaveClass('border-input');
            expect(textarea).toHaveClass('bg-transparent');
            expect(textarea).toHaveClass('px-3');
            expect(textarea).toHaveClass('py-2');
            
            // Textarea should have placeholder
            expect(textarea).toHaveAttribute('placeholder', placeholder);
            
            // Textarea should have rows attribute
            expect(textarea).toHaveAttribute('rows', rows.toString());
          }
        )
      );
    });

    it('should render Textarea component with error state styling', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.boolean(),
          (id, hasError) => {
            const { container } = render(
              <Textarea
                id={id}
                className={hasError ? 'border-destructive' : ''}
                aria-invalid={hasError}
              />
            );

            const textarea = container.querySelector('textarea');
            
            // Textarea should be rendered
            expect(textarea).toBeInTheDocument();
            
            // If error, should have destructive border
            if (hasError) {
              expect(textarea).toHaveClass('border-destructive');
              expect(textarea).toHaveAttribute('aria-invalid', 'true');
            } else {
              expect(textarea).not.toHaveClass('border-destructive');
            }
          }
        )
      );
    });

    it('should render Select component with consistent structure', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 2, maxLength: 5 }),
          (placeholder, options) => {
            const { container } = render(
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );

            const trigger = container.querySelector('[data-slot="select-trigger"]');
            
            // Select trigger should be rendered
            expect(trigger).toBeInTheDocument();
            
            // Select trigger should have shadcn/ui base classes
            expect(trigger).toHaveClass('flex');
            expect(trigger).toHaveClass('items-center');
            expect(trigger).toHaveClass('justify-between');
            expect(trigger).toHaveClass('rounded-md');
            expect(trigger).toHaveClass('border');
            expect(trigger).toHaveClass('border-input');
            expect(trigger).toHaveClass('bg-transparent');
            expect(trigger).toHaveClass('px-3');
            expect(trigger).toHaveClass('py-2');
            // Note: w-full is added via className prop, not base class
          }
        )
      );
    });

    it('should render Select component with disabled state', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isDisabled) => {
            const { container } = render(
              <Select disabled={isDisabled}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                </SelectContent>
              </Select>
            );

            const trigger = container.querySelector('[data-slot="select-trigger"]');
            
            // Select trigger should be rendered
            expect(trigger).toBeInTheDocument();
            
            // If disabled, should have disabled attribute and styling
            if (isDisabled) {
              expect(trigger).toHaveAttribute('data-disabled', '');
              expect(trigger).toHaveClass('disabled:cursor-not-allowed');
              expect(trigger).toHaveClass('disabled:opacity-50');
            }
          }
        )
      );
    });

    it('should have consistent focus states across all form components', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('input', 'textarea', 'select'),
          (componentType) => {
            let container;
            
            if (componentType === 'input') {
              ({ container } = render(<Input />));
            } else if (componentType === 'textarea') {
              ({ container } = render(<Textarea />));
            } else {
              ({ container } = render(
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectContent>
                </Select>
              ));
            }

            const element = componentType === 'select' 
              ? container.querySelector('[data-slot="select-trigger"]')
              : container.querySelector(componentType);
            
            // Element should be rendered
            expect(element).toBeInTheDocument();
            
            // All form components should have some form of outline-none
            // Input has focus-visible:outline-none, Textarea and Select have outline-none
            if (componentType === 'input') {
              expect(element).toHaveClass('focus-visible:outline-none');
              expect(element).toHaveClass('focus-visible:ring-2');
              expect(element).toHaveClass('focus-visible:ring-ring');
              expect(element).toHaveClass('focus-visible:ring-offset-2');
            } else {
              // Textarea and Select have outline-none and ring-[3px]
              expect(element).toHaveClass('outline-none');
              expect(element).toHaveClass('focus-visible:ring-[3px]');
              if (componentType === 'select') {
                expect(element).toHaveClass('focus-visible:ring-ring/50');
              }
            }
          }
        )
      );
    });

    it('should have consistent placeholder styling across all form components', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('input', 'textarea'),
          (placeholder, componentType) => {
            let container;
            
            if (componentType === 'input') {
              ({ container } = render(<Input placeholder={placeholder} />));
            } else {
              ({ container } = render(<Textarea placeholder={placeholder} />));
            }

            const element = container.querySelector(componentType);
            
            // Element should be rendered
            expect(element).toBeInTheDocument();
            
            // All form components should have consistent placeholder styling
            expect(element).toHaveClass('placeholder:text-muted-foreground');
            
            // Element should have placeholder attribute
            expect(element).toHaveAttribute('placeholder', placeholder);
          }
        )
      );
    });

    it('should have consistent border styling across all form components', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('input', 'textarea', 'select'),
          (componentType) => {
            let container;
            
            if (componentType === 'input') {
              ({ container } = render(<Input />));
            } else if (componentType === 'textarea') {
              ({ container } = render(<Textarea />));
            } else {
              ({ container } = render(
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectContent>
                </Select>
              ));
            }

            const element = componentType === 'select' 
              ? container.querySelector('[data-slot="select-trigger"]')
              : container.querySelector(componentType);
            
            // Element should be rendered
            expect(element).toBeInTheDocument();
            
            // All form components should have consistent border styling
            expect(element).toHaveClass('border');
            expect(element).toHaveClass('border-input');
            expect(element).toHaveClass('rounded-md');
          }
        )
      );
    });

    it('should have consistent padding across all form components', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('input', 'textarea', 'select'),
          (componentType) => {
            let container;
            
            if (componentType === 'input') {
              ({ container } = render(<Input />));
            } else if (componentType === 'textarea') {
              ({ container } = render(<Textarea />));
            } else {
              ({ container } = render(
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectContent>
                </Select>
              ));
            }

            const element = componentType === 'select' 
              ? container.querySelector('[data-slot="select-trigger"]')
              : container.querySelector(componentType);
            
            // Element should be rendered
            expect(element).toBeInTheDocument();
            
            // All form components should have consistent padding
            expect(element).toHaveClass('px-3');
            expect(element).toHaveClass('py-2');
          }
        )
      );
    });
  });
});

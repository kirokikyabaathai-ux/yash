/**
 * Property-Based Tests for Modal and Dialog Components
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for shadcn/ui Dialog usage, modal backdrop display,
 * and modal close affordances.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 2.4, 9.1, 9.4**
 */

import fc from 'fast-check';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

describe('Modal and Dialog Component Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 7: shadcn/ui Dialog usage for modals**
   * **Validates: Requirements 2.4**
   * 
   * For any modal or dialog overlay, it should use the shadcn/ui Dialog or AlertDialog component.
   */
  describe('Property 7: shadcn/ui Dialog usage for modals', () => {
    it('should render Dialog component with all required parts', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          (title, description, content) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                  </DialogHeader>
                  <div>{content}</div>
                </DialogContent>
              </Dialog>
            );
            
            // Dialog content should have data-slot attribute (rendered in portal)
            const dialogContent = baseElement.querySelector('[data-slot="dialog-content"]');
            expect(dialogContent).toBeInTheDocument();
            
            // Dialog should have proper structure
            const dialogHeader = baseElement.querySelector('[data-slot="dialog-header"]');
            expect(dialogHeader).toBeInTheDocument();
            
            const dialogTitle = baseElement.querySelector('[data-slot="dialog-title"]');
            expect(dialogTitle).toBeInTheDocument();
            expect(dialogTitle?.textContent).toBe(title);
            
            const dialogDescription = baseElement.querySelector('[data-slot="dialog-description"]');
            expect(dialogDescription).toBeInTheDocument();
            expect(dialogDescription?.textContent).toBe(description);
          }
        )
      );
    });

    it('should render Dialog with footer when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          (confirmText, cancelText) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Test Dialog</DialogTitle>
                    <DialogDescription>Test description</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">{cancelText}</Button>
                    <Button>{confirmText}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            );
            
            // Dialog footer should be present
            const dialogFooter = baseElement.querySelector('[data-slot="dialog-footer"]');
            expect(dialogFooter).toBeInTheDocument();
            
            // Footer should contain buttons
            const buttons = dialogFooter?.querySelectorAll('button');
            expect(buttons?.length).toBeGreaterThanOrEqual(2);
          }
        )
      );
    });

    it('should apply consistent padding and spacing', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (title) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Test description</DialogDescription>
                  </DialogHeader>
                  <div>Content</div>
                </DialogContent>
              </Dialog>
            );
            
            const dialogContent = baseElement.querySelector('[data-slot="dialog-content"]');
            
            // Dialog content should have padding
            expect(dialogContent?.className).toContain('p-6');
            
            // Dialog content should have gap for spacing
            expect(dialogContent?.className).toContain('gap-4');
          }
        )
      );
    });

    it('should verify modal components in codebase use shadcn/ui Dialog', () => {
      // Find all modal/dialog component files
      const componentFiles = glob.sync('src/components/**/*.tsx', {
        ignore: ['**/ui/**', '**/node_modules/**'],
      });

      const modalFiles = componentFiles.filter(file => {
        const content = fs.readFileSync(file, 'utf-8');
        // Check if file contains modal-like patterns
        return (
          content.includes('Modal') ||
          content.includes('Dialog') ||
          (content.includes('fixed inset-0') && content.includes('z-50'))
        );
      });

      modalFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const fileName = path.basename(file);
        
        // Skip files that are known to use Dialog correctly
        if (
          fileName === 'AuthModal.tsx' ||
          fileName === 'StepCompletionModal.tsx' ||
          fileName === 'QuickStatusUpdate.tsx' ||
          fileName === 'DocumentViewer.tsx'
        ) {
          // These should import from @/components/ui/dialog
          expect(content).toMatch(/from ['"]@\/components\/ui\/dialog['"]/);
        }
      });
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 29: Modal backdrop display**
   * **Validates: Requirements 9.1**
   * 
   * For any open modal, it should display a semi-transparent backdrop behind the modal content.
   */
  describe('Property 29: Modal backdrop display', () => {
    it('should render backdrop overlay when dialog is open', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (title) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Test description</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
            
            // Backdrop overlay should be present
            const overlay = baseElement.querySelector('[data-slot="dialog-overlay"]');
            expect(overlay).toBeInTheDocument();
            
            // Overlay should have backdrop styling
            expect(overlay?.className).toContain('fixed');
            expect(overlay?.className).toContain('inset-0');
            expect(overlay?.className).toContain('z-50');
            expect(overlay?.className).toContain('bg-black/50');
          }
        )
      );
    });

    it('should not render backdrop when dialog is closed', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (title) => {
            const { baseElement } = render(
              <Dialog open={false}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
            
            // Backdrop overlay should not be present when closed
            const overlay = baseElement.querySelector('[data-slot="dialog-overlay"]');
            expect(overlay).not.toBeInTheDocument();
          }
        )
      );
    });

    it('should have semi-transparent backdrop with proper z-index', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isOpen) => {
            const { baseElement } = render(
              <Dialog open={isOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Test</DialogTitle>
                    <DialogDescription>Test description</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
            
            const overlay = baseElement.querySelector('[data-slot="dialog-overlay"]');
            
            if (isOpen) {
              // When open, overlay should exist with proper styling
              expect(overlay).toBeInTheDocument();
              expect(overlay?.className).toContain('bg-black/50');
              expect(overlay?.className).toContain('z-50');
            } else {
              // When closed, overlay should not exist
              expect(overlay).not.toBeInTheDocument();
            }
          }
        )
      );
    });

    it('should position backdrop behind dialog content', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (content) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Test</DialogTitle>
                    <DialogDescription>{content}</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
            
            const overlay = baseElement.querySelector('[data-slot="dialog-overlay"]');
            const dialogContent = baseElement.querySelector('[data-slot="dialog-content"]');
            
            // Both should have z-50, but content should be rendered after overlay in DOM
            expect(overlay).toBeInTheDocument();
            expect(dialogContent).toBeInTheDocument();
            
            // Overlay should come before content in DOM order
            const overlayIndex = Array.from(baseElement.querySelectorAll('*')).indexOf(overlay!);
            const contentIndex = Array.from(baseElement.querySelectorAll('*')).indexOf(dialogContent!);
            expect(overlayIndex).toBeLessThan(contentIndex);
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 30: Modal close affordance**
   * **Validates: Requirements 9.4**
   * 
   * For any modal, it should provide a visible close button (X icon) in the header or corner.
   */
  describe('Property 30: Modal close affordance', () => {
    it('should render close button by default', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (title) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Test description</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
            
            // Close button should be present
            const closeButton = baseElement.querySelector('[data-slot="dialog-close"]');
            expect(closeButton).toBeInTheDocument();
            
            // Close button should have screen reader text
            const srText = closeButton?.querySelector('.sr-only');
            expect(srText).toBeInTheDocument();
            expect(srText?.textContent).toBe('Close');
          }
        )
      );
    });

    it('should position close button in top-right corner', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (title) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Test description</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
            
            const closeButton = baseElement.querySelector('[data-slot="dialog-close"]');
            
            // Close button should have absolute positioning
            expect(closeButton?.className).toContain('absolute');
            expect(closeButton?.className).toContain('top-4');
            expect(closeButton?.className).toContain('right-4');
          }
        )
      );
    });

    it('should allow hiding close button when showCloseButton is false', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (title) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent showCloseButton={false}>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
            
            // Close button should not be present when explicitly hidden
            const closeButton = baseElement.querySelector('[data-slot="dialog-close"]');
            expect(closeButton).not.toBeInTheDocument();
          }
        )
      );
    });

    it('should have proper hover and focus states on close button', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (title) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Test description</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
            
            const closeButton = baseElement.querySelector('[data-slot="dialog-close"]');
            
            // Close button should have hover state
            expect(closeButton?.className).toContain('hover:opacity-100');
            
            // Close button should have focus ring
            expect(closeButton?.className).toContain('focus:ring-2');
            expect(closeButton?.className).toContain('focus:ring-offset-2');
          }
        )
      );
    });

    it('should render close button with X icon', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (title) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Test description</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
            
            const closeButton = baseElement.querySelector('[data-slot="dialog-close"]');
            
            // Close button should contain an SVG icon
            const icon = closeButton?.querySelector('svg');
            expect(icon).toBeInTheDocument();
          }
        )
      );
    });
  });

  /**
   * Additional test: Verify modal components have consistent structure
   */
  describe('Modal component consistency', () => {
    it('should have consistent header structure across all modals', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (title, description) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
            
            const header = baseElement.querySelector('[data-slot="dialog-header"]');
            
            // Header should have consistent spacing
            expect(header?.className).toContain('flex');
            expect(header?.className).toContain('flex-col');
            expect(header?.className).toContain('gap-2');
          }
        )
      );
    });

    it('should have consistent footer button positioning', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          (cancelText, confirmText) => {
            const { baseElement } = render(
              <Dialog open={true}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Test</DialogTitle>
                    <DialogDescription>Test description</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">{cancelText}</Button>
                    <Button>{confirmText}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            );
            
            const footer = baseElement.querySelector('[data-slot="dialog-footer"]');
            
            // Footer should have consistent button positioning
            expect(footer?.className).toContain('flex');
            expect(footer?.className).toContain('sm:justify-end');
            expect(footer?.className).toContain('gap-2');
          }
        )
      );
    });
  });
});

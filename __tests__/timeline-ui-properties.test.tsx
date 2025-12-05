/**
 * Property-Based Tests for Timeline UI Component
 * 
 * Tests correctness properties for timeline visual styling and interactions.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * Feature: ui-professional-refactor
 * Properties: 42-43
 * Validates: Requirements 15.2, 15.3, 15.5
 */

import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Timeline } from '../src/components/timeline/Timeline';
import type { TimelineStepData } from '../src/components/timeline/TimelineStep';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

// Helper arbitraries
const stepStatusArbitrary = fc.constantFrom<'pending' | 'completed' | 'upcoming'>('pending', 'completed', 'upcoming');
const stepNameArbitrary = fc.string({ minLength: 3, maxLength: 50 });
const userRoleArbitrary = fc.constantFrom('admin', 'agent', 'office', 'installer', 'customer');

// Generate a timeline step
const timelineStepArbitrary = fc.record({
  id: fc.uuid(),
  step_id: fc.uuid(),
  step_name: stepNameArbitrary,
  order_index: fc.integer({ min: 1, max: 100 }),
  status: stepStatusArbitrary,
  completed_by: fc.option(fc.uuid(), { nil: null }),
  completed_by_name: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: null }),
  completed_at: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
  remarks: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: null }),
  attachments: fc.option(fc.array(fc.webUrl()), { nil: null }),
  allowed_roles: fc.array(userRoleArbitrary, { minLength: 1, maxLength: 5 }),
  remarks_required: fc.boolean(),
  attachments_allowed: fc.boolean(),
  customer_upload: fc.boolean(),
  requires_installer_assignment: fc.boolean(),
});

describe('Timeline UI Component Properties', () => {
  /**
   * Feature: ui-professional-refactor, Property 42: Timeline step state distinction
   * 
   * For any timeline, completed steps should have distinct visual styling 
   * (checkmark icon, green color) compared to pending steps (empty circle, gray color).
   * 
   * Validates: Requirements 15.2, 15.3
   */
  test('Property 42: Timeline step state distinction', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(timelineStepArbitrary, { minLength: 2, maxLength: 10 }),
        async (steps) => {
          // Ensure we have at least one completed and one pending step
          const modifiedSteps = steps.map((step, index) => ({
            ...step,
            status: index === 0 ? 'completed' as const : 'pending' as const,
            completed_at: index === 0 ? new Date().toISOString() : null,
            completed_by: index === 0 ? 'test-user-id' : null,
            completed_by_name: index === 0 ? 'Test User' : null,
          }));

          const { container } = render(
            <Timeline
              leadId="test-lead-id"
              userRole="customer"
              userId="test-user-id"
              initialSteps={modifiedSteps}
            />
          );

          // Find all step indicators (circles)
          const stepIndicators = container.querySelectorAll('.w-6.h-6.rounded-full');
          
          expect(stepIndicators.length).toBeGreaterThan(0);

          // Check completed step (first one)
          const completedIndicator = stepIndicators[0];
          const completedClasses = completedIndicator.className;
          
          // Completed steps should have green background
          expect(completedClasses).toMatch(/bg-green-/);
          
          // Completed steps should have a checkmark icon
          const checkmark = completedIndicator.querySelector('svg');
          expect(checkmark).toBeInTheDocument();

          // Check pending step (second one if exists)
          if (stepIndicators.length > 1) {
            const pendingIndicator = stepIndicators[1];
            const pendingClasses = pendingIndicator.className;
            
            // Pending steps should have muted background
            expect(pendingClasses).toMatch(/bg-muted/);
            
            // Pending steps should NOT have a checkmark
            const pendingCheckmark = pendingIndicator.querySelector('svg');
            expect(pendingCheckmark).not.toBeInTheDocument();
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ui-professional-refactor, Property 43: Timeline step hover states
   * 
   * For any interactive timeline step, hovering should trigger a visual state change 
   * (background color, shadow, or scale).
   * 
   * Validates: Requirements 15.5
   */
  test('Property 43: Timeline step hover states', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(timelineStepArbitrary, { minLength: 1, maxLength: 5 }),
        async (steps) => {
          const { container } = render(
            <Timeline
              leadId="test-lead-id"
              userRole="admin"
              userId="test-user-id"
              initialSteps={steps}
            />
          );

          // Find all step indicators
          const stepIndicators = container.querySelectorAll('.w-6.h-6.rounded-full');
          
          expect(stepIndicators.length).toBeGreaterThan(0);

          // Check that step indicators have hover state classes
          stepIndicators.forEach((indicator) => {
            const classes = indicator.className;
            
            // Should have hover:scale or transition classes for hover effects
            const hasHoverEffect = 
              classes.includes('hover:scale') || 
              classes.includes('transition') ||
              classes.includes('hover:');
            
            expect(hasHoverEffect).toBe(true);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify Card component usage for step details
   * 
   * This ensures that when steps are displayed with details, they use
   * the shadcn/ui Card component as per the refactoring requirements.
   */
  test('Timeline uses Card components for step details sections', () => {
    const steps: TimelineStepData[] = [
      {
        id: '1',
        step_id: 'step-1',
        step_name: 'Test Step',
        order_index: 1,
        status: 'completed',
        completed_by: 'user-1',
        completed_by_name: 'Test User',
        completed_at: new Date().toISOString(),
        remarks: 'Test remarks',
        attachments: null,
        allowed_roles: ['admin'],
        remarks_required: false,
        attachments_allowed: false,
        customer_upload: false,
        requires_installer_assignment: false,
      },
    ];

    const { container } = render(
      <Timeline
        leadId="test-lead-id"
        userRole="admin"
        userId="test-user-id"
        initialSteps={steps}
      />
    );

    // Check for Card-like containers (rounded, border, shadow)
    const cardElements = container.querySelectorAll('.rounded-lg.border, .rounded-md.border');
    
    // Should have at least one card-like element (progress summary or step details)
    expect(cardElements.length).toBeGreaterThan(0);
  });

  /**
   * Additional test: Verify visual progression clarity
   * 
   * Ensures that the timeline shows clear visual progression through
   * connecting lines between steps.
   */
  test('Timeline shows clear visual progression with connecting lines', () => {
    const steps: TimelineStepData[] = [
      {
        id: '1',
        step_id: 'step-1',
        step_name: 'Step 1',
        order_index: 1,
        status: 'completed',
        completed_by: 'user-1',
        completed_by_name: 'Test User',
        completed_at: new Date().toISOString(),
        remarks: null,
        attachments: null,
        allowed_roles: ['admin'],
        remarks_required: false,
        attachments_allowed: false,
        customer_upload: false,
        requires_installer_assignment: false,
      },
      {
        id: '2',
        step_id: 'step-2',
        step_name: 'Step 2',
        order_index: 2,
        status: 'pending',
        completed_by: null,
        completed_by_name: null,
        completed_at: null,
        remarks: null,
        attachments: null,
        allowed_roles: ['admin'],
        remarks_required: false,
        attachments_allowed: false,
        customer_upload: false,
        requires_installer_assignment: false,
      },
    ];

    const { container } = render(
      <Timeline
        leadId="test-lead-id"
        userRole="admin"
        userId="test-user-id"
        initialSteps={steps}
      />
    );

    // Check for connecting lines between steps
    const connectingLines = container.querySelectorAll('.flex-1.h-1');
    
    // Should have connecting lines between steps (n-1 lines for n steps)
    expect(connectingLines.length).toBe(steps.length - 1);
    
    // Lines should have color based on completion status
    connectingLines.forEach((line) => {
      const classes = line.className;
      expect(classes).toMatch(/bg-(green|muted)/);
    });
  });
});

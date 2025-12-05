# Implementation Plan: Professional UI Refactoring

## Phase 1: Foundation Setup

- [x] 1. Install missing shadcn/ui components





  - Install form, select, textarea, checkbox, radio-group, switch components
  - Install table, badge, separator, avatar, progress components
  - Install breadcrumb, tabs, dropdown-menu components
  - Install sheet, popover, tooltip components
  - Verify all components are properly configured
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 2. Create design system utilities





  - Create `src/lib/design-system/tokens.ts` with design token exports
  - Create `src/lib/design-system/typography.ts` with typography utilities
  - Create `src/lib/design-system/spacing.ts` with spacing utilities
  - Export all utilities from `src/lib/design-system/index.ts`
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 2.1 Write property test for design token consistency


  - **Property 1: Typography consistency across pages**
  - **Property 2: Color palette adherence**
  - **Property 3: Spacing system adherence**




  - **Validates: Requirements 1.1, 1.2, 1.4, 1.5**


- [ ] 3. Create base layout components
  - Create `src/components/layout/PageLayout.tsx` with title, description, actions, breadcrumbs





  - Create `src/components/layout/DashboardCard.tsx` for dashboard metrics

  - Create `src/components/layout/FormSection.tsx` for form grouping
  - Create `src/components/layout/EmptyState.tsx` for empty data displays
  - _Requirements: 3.1, 3.2, 3.3, 5.1, 6.3_



- [ ] 3.1 Write property test for layout consistency
  - **Property 22: Page header consistency**
  - **Validates: Requirements 6.3**

- [ ] 4. Create enhanced form components

  - Create `src/components/forms/FormField.tsx` wrapper with label, error, help text
  - Create `src/components/forms/FileUpload.tsx` with progress and preview
  - Update `src/components/forms/FormProgress.tsx` to use shadcn/ui components
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_





- [ ] 4.1 Write property test for form field requirements
  - **Property 14: Form field labeling**
  - **Property 15: Required field indicators**
  - **Property 16: Inline error display**
  - **Validates: Requirements 4.2, 4.3, 4.4**



- [ ] 5. Set up testing infrastructure
  - Configure visual regression testing with Playwright or similar
  - Set up property-based testing examples with fast-check
  - Create test utilities for component testing
  - _Requirements: All (testing foundation)_

## Phase 2: Core Component Migration

- [ ] 6. Refactor Button usage across application

  - Audit all button elements in the codebase
  - Replace custom-styled buttons with shadcn/ui Button
  - Ensure proper variant usage (default, secondary, outline, destructive, ghost)
  - Add loading states where needed
  - _Requirements: 2.2, 8.1, 8.2, 8.3, 8.5_

- [ ] 6.1 Write property test for button component usage
  - **Property 5: shadcn/ui Button usage**
  - **Property 26: Button variant appropriateness**
  - **Property 27: Disabled button styling**
  - **Property 28: Button loading states**
  - **Validates: Requirements 2.2, 8.1, 8.3, 8.5**

- [x] 7. Refactor Card usage across application




  - Audit all card-like containers in the codebase
  - Replace custom cards with shadcn/ui Card, CardHeader, CardContent, CardFooter
  - Ensure consistent padding and styling
  - _Requirements: 2.3, 5.1, 5.3_

- [x] 7.1 Write property test for card component usage



  - **Property 6: shadcn/ui Card usage for containers**
  - **Property 18: Dashboard card consistency**
  - **Validates: Requirements 2.3, 5.3**



- [x] 8. Refactor Input and Form components



  - Replace all custom input elements with shadcn/ui Input
  - Replace all select elements with shadcn/ui Select
  - Replace all textarea elements with shadcn/ui Textarea
  - Implement shadcn/ui Form wrapper for validation
  - _Requirements: 2.1, 2.7, 4.2, 4.3_

- [x] 8.1 Write property test for form component usage


  - **Property 4: shadcn/ui component usage for forms**
  - **Validates: Requirements 2.1**


- [x] 9. Refactor Badge and status indicators




  - Update LeadStatusBadge to use shadcn/ui Badge
  - Ensure consistent color mapping for all statuses
  - Verify accessibility contrast ratios
  - _Requirements: 2.5, 11.1, 11.2, 11.5_

- [x] 9.1 Write property test for badge component usage


  - **Property 8: shadcn/ui Badge usage for status indicators**
  - **Property 33: Status color consistency**
  - **Property 34: Status accessibility contrast**
  - **Validates: Requirements 2.5, 11.1, 11.5**

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Layout and Navigation


- [x] 11. Refactor navigation components




  - Update navigation to show active page indication
  - Add hover states to navigation items
  - Implement mobile navigation pattern (hamburger menu)
  - _Requirements: 6.1, 6.2, 10.5_

- [x] 11.1 Write property test for navigation requirements


  - **Property 20: Active navigation indication**
  - **Property 21: Navigation hover states**
  - **Property 32: Responsive navigation pattern**
  - **Validates: Requirements 6.1, 6.2, 10.5**





- [ ] 12. Implement responsive layout patterns

  - Ensure all multi-column layouts stack on mobile
  - Optimize spacing for tablet viewports





  - Verify desktop layouts use space effectively

  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 12.1 Write property test for responsive behavior
  - **Property 31: Mobile single-column layout**
  - **Validates: Requirements 10.1**






- [-] 13. Refactor dashboard layouts


  - Update CustomerDashboardContent to use PageLayout and DashboardCard
  - Update agent dashboard to use consistent card layouts
  - Update office dashboard to use consistent card layouts
  - Update admin dashboard to use consistent card layouts
  - Ensure key metrics are prominently displayed
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_



- [ ] 13.1 Write property test for dashboard requirements
  - **Property 19: Key metric prominence**
  - **Validates: Requirements 5.2**

- [ ] 14. Refactor table and list displays

  - Install and implement shadcn/ui Table component




  - Update LeadList to use shadcn/ui Table
  - Update UserList to use shadcn/ui Table
  - Add row hover states
  - Style headers distinctly from data rows
  - Implement empty state displays
  - _Requirements: 2.6, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 14.1 Write property test for table requirements


  - **Property 9: shadcn/ui Table usage for data tables**

  - **Property 23: Table row hover states**
  - **Property 24: Table header distinction**
  - **Property 25: Empty state messaging**
  - **Validates: Requirements 2.6, 7.2, 7.3, 7.5**

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Feature Component Refactoring


- [ ] 16. Refactor authentication components

  - Update LoginForm to use shadcn/ui components and Card layout
  - Update SignupForm to use shadcn/ui components
  - Update CustomerSignupForm to use shadcn/ui components
  - Ensure password fields have show/hide toggle
  - Style error messages prominently
  - Update AuthModal to use shadcn/ui Dialog
  - _Requirements: 2.4, 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 16.1 Write property test for authentication requirements
  - **Property 40: Password field toggle**
  - **Property 41: Authentication error prominence**
  - **Validates: Requirements 14.3, 14.4**

- [ ] 17. Refactor CustomerProfileForm

  - Replace all inputs with shadcn/ui Input components
  - Replace select with shadcn/ui Select
  - Use FormField wrapper for all fields
  - Update document upload sections with enhanced FileUpload component
  - Ensure inline error display
  - Add form progress indicator
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 17.1 Write property test for file upload requirements
  - **Property 17: File upload progress indication**
  - **Property 35: Upload drop zone feedback**
  - **Property 36: Uploaded document card display**
  - **Property 37: Upload error messaging**
  - **Validates: Requirements 4.6, 12.1, 12.2, 12.5**

- [x] 18. Refactor LeadForm.






  - Replace all inputs with shadcn/ui Input components
  - Replace select with shadcn/ui Select
  - Use FormField wrapper for all fields
  - Ensure inline error display
  - _Requirements: 4.1, 4.2, 4.3, 4.4_


- [x] 19. Refactor LeadDetail and LeadDetailClient.





  - Use PageLayout for consistent header
  - Use Card components for information sections
  - Update status badge display
  - Ensure proper visual hierarchy
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 19.1 Write property test for visual hierarchy


  - **Property 10: Heading size progression**
  - **Property 11: Font weight hierarchy**
  - **Property 12: Visual grouping through spacing**
  - **Property 13: Interactive element affordances**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**


- [x] 20. Refactor Timeline component.





  - Update TimelineStep to show distinct styling for completed vs pending
  - Add hover states to interactive steps
  - Use Card for step details
  - Ensure clear visual progression
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 20.1 Write property test for timeline requirements


  - **Property 42: Timeline step state distinction**
  - **Property 43: Timeline step hover states**
  - **Validates: Requirements 15.2, 15.3, 15.5**


- [x] 21. Refactor DocumentUploader and DocumentList.





  - Update DocumentUploader with enhanced FileUpload component
  - Add clear drop zone with visual feedback
  - Show upload progress indicators
  - Display uploaded documents in card layouts
  - Add clearly labeled view and delete buttons
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 22. Refactor admin components.






  - Update UserForm to use shadcn/ui components
  - Update UserList to use shadcn/ui Table
  - Update StepMasterForm to use shadcn/ui components
  - Update StepMasterList to use shadcn/ui Table
  - Update ActivityLogList to use shadcn/ui Table
  - _Requirements: 2.1, 2.6, 4.1, 4.2, 4.3_

- [ ] 23. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Landing Page and Polish

- [x] 24. Refactor LandingPage component.






  - Update hero section with professional styling
  - Ensure high-quality imagery and appropriate spacing
  - Add clear visual separation between sections
  - Make CTA buttons visually prominent
  - Organize footer content clearly
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 24.1 Write property test for landing page requirements


  - **Property 38: Landing page section separation**
  - **Property 39: CTA button prominence**
  - **Validates: Requirements 13.3, 13.4**

- [-] 25. Refactor modal and dialog components.




  - Update all modals to use shadcn/ui Dialog
  - Ensure backdrop display
  - Add consistent padding and spacing
  - Position action buttons consistently
  - Provide clear close affordances
  - Style headers distinctly
  - _Requirements: 2.4, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 25.1 Write property test for modal requirements



  - **Property 7: shadcn/ui Dialog usage for modals**
  - **Property 29: Modal backdrop display**
  - **Property 30: Modal close affordance**
  - **Validates: Requirements 2.4, 9.1, 9.4**

- [x] 26. Implement visual hierarchy improvements.





  - Audit all pages for heading hierarchy
  - Ensure font weights distinguish primary from secondary content
  - Verify spacing shows element relationships
  - Ensure interactive elements have clear affordances
  - Verify status information uses appropriate styling
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 27. Accessibility audit and fixes
  - Run axe accessibility tests on all pages
  - Fix any contrast ratio issues
  - Ensure proper ARIA labels
  - Verify keyboard navigation
  - Test screen reader compatibility
  - _Requirements: 11.5, All (accessibility)_

- [ ] 27.1 Write accessibility tests
  - Test WCAG AA contrast ratios for all status badges
  - Test keyboard navigation for all interactive elements
  - Test screen reader compatibility for forms
  - _Requirements: 11.5_

- [ ] 28. Responsive design verification
  - Test all pages at mobile breakpoint (375px, 414px)
  - Test all pages at tablet breakpoint (768px, 1024px)
  - Test all pages at desktop breakpoint (1280px, 1920px)
  - Verify layouts adapt appropriately
  - Ensure touch targets are adequate on mobile
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_






- [ ] 29. Final visual polish.


  - Review all pages for consistency
  - Adjust spacing for optimal visual balance
  - Ensure all shadows and borders are consistent
  - Verify all animations and transitions are smooth
  - _Requirements: 1.1, 1.3, 1.5_

- [ ] 30. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Documentation

- [ ] 31. Create design system documentation
  - Create `docs/design-system.md` with color palette, typography, spacing
  - Document component usage patterns
  - Document layout patterns
  - Add visual examples for each pattern
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 32. Create component library documentation
  - Create `docs/component-library.md` with all shadcn/ui components
  - Document custom composed components
  - Add props documentation
  - Add usage examples for each component
  - _Requirements: 16.5_

- [ ] 33. Create migration guide
  - Create `docs/migration-guide.md` with step-by-step instructions
  - Add before/after examples
  - Document common pitfalls
  - Add troubleshooting section
  - _Requirements: 16.4, 16.5_

- [ ] 34. Create testing guide
  - Create `docs/testing-guide.md` with property-based testing patterns
  - Document visual regression testing setup
  - Add accessibility testing checklist
  - Document responsive testing approach
  - _Requirements: All (testing documentation)_

## Success Criteria

- All 43 correctness properties pass their property-based tests
- 0 critical accessibility violations
- All pages use shadcn/ui components consistently
- All colors come from design token palette
- All spacing values come from spacing system
- All typography uses defined scale
- Responsive design works at all breakpoints
- Documentation is complete and accurate

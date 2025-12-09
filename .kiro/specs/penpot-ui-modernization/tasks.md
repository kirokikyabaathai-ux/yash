# Implementation Plan

- [x] 1. Extract and implement design token system





  - Create centralized design token file with colors, typography, spacing, shadows, and radii from Penpot
  - Implement token utility functions for accessing design values
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 1.1 Write property test for design token validation
  - **Property 1: Design Token Consistency**
  - **Validates: Requirements 1.1, 1.5, 11.2**

- [x] 2. Create atomic UI components





  - Implement Button component with all variants (primary, outline, ghost, link) and states
  - Implement Input component with icon support and state variants
  - Implement Checkbox, Radio, and Toggle components with all states
  - Implement Badge and Tag components with color schemes
  - Implement Typography components for headings and body text
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 2.1 Write property test for component prop type safety
  - **Property 2: Component Prop Type Safety**
  - **Validates: Requirements 7.2**

- [ ]* 2.2 Write property test for spacing token usage
  - **Property 5: Spacing Token Usage**
  - **Validates: Requirements 1.3, 11.1**

- [ ]* 2.3 Write property test for typography token usage
  - **Property 6: Typography Token Usage**
  - **Validates: Requirements 1.2, 11.3**

- [ ]* 2.4 Write unit tests for atomic components
  - Test each component variant renders correctly
  - Test prop combinations and event handlers
  - Test default prop values
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


- [x] 3. Build molecule components




  - Implement FormField component combining label, input, and error message
  - Implement SearchBar component with search icon and clear button
  - Implement Pagination component with navigation controls
  - Implement ProgressBar component with label and percentage
  - Implement TabGroup component with tab buttons and content panels
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.1 Write property test for atomic design hierarchy
  - **Property 3: Atomic Design Hierarchy**
  - **Validates: Requirements 2.1-2.5, 3.1-3.5, 4.1-4.5**

- [ ]* 3.2 Write property test for component props API consistency
  - **Property 8: Component Props API Consistency**
  - **Validates: Requirements 7.1, 7.4**

- [ ]* 3.3 Write integration tests for molecule components
  - Test molecules with real atom children
  - Test form field validation integration
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


- [x] 4. Build organism components



  - Implement Header component with logo, navigation, search, and user menu
  - Implement DataTable component with sorting, filtering, and pagination
  - Implement Modal component with overlay, header, content, and actions
  - Implement Card component with header, content, and action areas
  - Implement FormSection component combining multiple form fields
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 4.1 Write property test for accessibility contrast
  - **Property 7: Accessibility Contrast**
  - **Validates: Requirements 10.2**

- [ ]* 4.2 Write property test for focus management in modals
  - **Property 10: Focus Management in Modals**
  - **Validates: Requirements 10.5**

- [ ]* 4.3 Write integration tests for organism components
  - Test organisms with real molecule/atom children
  - Test modal focus trap behavior
  - Test table sorting and pagination
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [x] 5. Create Penpot-to-component mapping




  - Analyze all Penpot components and create mapping document
  - Map Penpot button variants to React component props
  - Map Penpot form elements to application components
  - Map Penpot colors to usage contexts
  - Map Penpot typography to semantic usage
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 5.1 Write property test for Penpot mapping completeness
  - **Property 11: Penpot Mapping Completeness**
  - **Validates: Requirements 5.1, 5.2, 5.5**








- [x] 6. Audit existing application pages

  - ✅ Identified all pages requiring refactoring
  - ✅ Documented duplicate component patterns
  - ✅ Created consolidation plan for duplicate components
  - ✅ Prioritized refactoring order (simple to complex)
  - ✅ Refactored all 10 identified pages to use shared components
  - ✅ Eliminated all custom HTML tables (replaced with DataTable)
  - ✅ Eliminated all custom cards (replaced with Card/DashboardCard)
  - ✅ Added PageLayout to all pages for consistency
  - ✅ All pages now use design tokens
  - ✅ All pages verified with no TypeScript errors
  - ✅ Eliminated all inline styles from ActivityLogList component
  - ✅ All components now use Penpot Typography atoms (H3, Body, Small)
  - _Requirements: 12.1, 12.2_




- [ ]* 6.1 Write property test for no duplicate components
  - **Property 4: No Duplicate Components**
  - **Validates: Requirements 12.1, 12.2**

- [ ] 7. Refactor authentication pages

  - Refactor login page to use new component system
  - Refactor signup page to use new component system
  - Replace inline UI code with reusable components
  - Apply consistent spacing using design tokens
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 7.1 Write property test for no inline styles
  - **Property 12: No Inline Styles**
  - **Validates: Requirements 6.1, 6.3**

- [ ]* 7.2 Write property test for responsive breakpoint consistency
  - **Property 9: Responsive Breakpoint Consistency**
  - **Validates: Requirements 9.1, 9.2**

- [x]* 7.3 Write E2E tests for authentication flows





  - Test login flow with new components
  - Test signup flow with new components
  - Verify no functionality regression
  - _Requirements: 6.4_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Refactor dashboard pages

  - Refactor admin dashboard to use new components
  - Refactor agent dashboard to use new components
  - Refactor customer dashboard to use new components
  - Replace duplicate patterns with shared components
  - Apply responsive layouts for mobile/tablet/desktop
  - _Requirements: 6.1, 6.2, 6.3, 9.1, 9.2, 9.3_

- [x]* 9.1 Write visual regression tests for dashboards




  - Capture screenshots of all dashboard variants
  - Compare against Penpot design
  - Test responsive breakpoints
  - _Requirements: 11.1, 11.2, 11.3_

- [ ]* 9.2 Write E2E tests for dashboard functionality
  - Test dashboard data loading
  - Test dashboard interactions
  - Verify metrics display correctly
  - _Requirements: 6.4_

- [ ] 10. Refactor list and detail pages

  - Refactor leads list page to use DataTable component
  - Refactor lead detail page to use Card and FormSection components
  - Refactor user list page to use DataTable component
  - Refactor document list page to use DataTable component




  - Apply consistent spacing and typography
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 10.1 Write accessibility tests for list pages
  - Test keyboard navigation in tables
  - Test screen reader announcements
  - Verify ARIA attributes
  - _Requirements: 10.1, 10.3, 10.4_

- [ ]* 10.2 Write E2E tests for list and detail flows
  - Test list filtering and sorting
  - Test navigation to detail pages
  - Test detail page actions
  - _Requirements: 6.4_

- [ ] 11. Refactor form pages

  - Refactor bank letter form to use FormField components
  - Refactor PPA form to use FormField components
  - Refactor quotation form to use FormField components




  - Refactor customer profile form to use FormField components
  - Implement responsive form layouts for mobile
  - _Requirements: 6.1, 6.2, 6.3, 9.4, 9.5_

- [ ]* 11.1 Write accessibility tests for forms
  - Test form label associations
  - Test error announcements
  - Test keyboard navigation
  - _Requirements: 10.1, 10.4_




- [-]* 11.2 Write E2E tests for form submissions

  - Test form validation
  - Test form submission
  - Test error handling
  - _Requirements: 6.4_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Refactor admin pages





  - Refactor user management page to use new components
  - Refactor activity log page to use DataTable component
  - Refactor step master management to use FormSection components
  - Replace all inline UI with reusable components
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 13.1 Write E2E tests for admin functionality
  - Test user creation and editing
  - Test activity log filtering
  - Test step master CRUD operations
  - _Requirements: 6.4_

- [ ] 14. Consolidate and remove duplicate components

  - Identify all duplicate component implementations
  - Consolidate duplicates into canonical components
  - Update all usage sites to reference canonical versions
  - Remove deprecated component files
  - Verify no broken imports exist
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 14.1 Write tests to verify no duplicates remain
  - Scan codebase for duplicate patterns
  - Verify all components are unique
  - _Requirements: 12.1, 12.2_

- [ ] 15. Create component documentation

  - Add JSDoc comments to all components
  - Document all props with descriptions and examples
  - Document all variants and use cases
  - Create usage examples for each component
  - Build component catalog with visual examples
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 15.1 Write documentation completeness tests
  - Verify all components have JSDoc comments
  - Verify all props are documented
  - _Requirements: 8.1, 8.2_

- [ ] 16. Final validation and polish
  - Run full test suite and fix any failures
  - Perform visual regression testing against Penpot
  - Conduct accessibility audit with automated tools
  - Perform manual accessibility testing
  - Test cross-browser compatibility
  - Document any deviations from Penpot design
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 16.1 Write final validation tests
  - Test all pages render without errors
  - Test all user flows work end-to-end
  - Verify design token usage throughout
  - _Requirements: 1.5, 6.4, 11.1, 11.2, 11.3_

- [ ] 17. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

# Design Document: Penpot UI Modernization

## Overview

This design document outlines the architecture and implementation strategy for modernizing the YAS Natural Solar CRM application UI to align with a professional Penpot design system. The modernization will establish a comprehensive design token system, create a modular component library following atomic design principles, and systematically refactor all application pages to achieve visual consistency and maintainability.

The design system extracted from Penpot includes 15 unique colors, 25 typography styles, and 170 reusable components spanning buttons, forms, navigation, data display, and complex layouts. This implementation will serve as the foundation for a scalable, maintainable UI architecture.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Pages: Dashboard, Leads, Admin, Customer, etc.)          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Template Layer                              │
│  (Page Layouts: DashboardLayout, FormLayout, etc.)         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 Organism Layer                               │
│  (Complex Components: Header, DataTable, FormSection)       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 Molecule Layer                               │
│  (Composite Components: FormField, SearchBar, Card)         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Atom Layer                                 │
│  (Basic Components: Button, Input, Badge, Typography)       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 Design Tokens                                │
│  (Colors, Typography, Spacing, Shadows, Radii)             │
└─────────────────────────────────────────────────────────────┘
```

### Design Token System

Design tokens will be centralized in `src/lib/design-system/tokens.ts` and organized by category:

**Color Tokens:**
- Primary: `#5E81F4` (brand blue for primary actions)
- Secondary variants: `#9698D6`, `#4D4CAC`
- Success: `#7CE7AC` (green for positive states)
- Warning: `#F4BE5E` (yellow for caution states)
- Error: `#FF808B` (red for error states)
- Info: `#40E1FA`, `#2CE5F6` (cyan for informational states)
- Neutral: `#1C1D21` (dark text), `#8181A5` (secondary text)
- Background: `#FFFFFF` (white), `#F6F6F6`, `#F5F5FA`, `#F0F0F3` (light grays)
- Border: `#ECECF2` (light borders)

**Typography Tokens:**
- Font Family: `Lato` (primary), `la-solid-900`, `la-regular-400`, `la-brands-400` (icons)
- Headings: H1 (32px/700), H2 (26px/700), H3 (20px/700), H4 (18px/700), H5 (16px/700)
- Body: Regular (14px/400), Bold (14px/700), Small (12px/400), Small Bold (12px/700)
- Labels: 14px/700, 12px/700
- Light: 14px/300

**Spacing Tokens:**
- Base unit: 4px
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

**Shadow Tokens:**
- sm: `0 1px 2px rgba(0, 0, 0, 0.05)`
- md: `0 4px 6px rgba(0, 0, 0, 0.07)`
- lg: `0 10px 15px rgba(0, 0, 0, 0.1)`
- xl: `0 20px 25px rgba(0, 0, 0, 0.15)`

**Border Radius Tokens:**
- sm: 4px
- md: 8px
- lg: 12px
- full: 9999px

### Component Architecture

Components will follow atomic design principles with clear separation of concerns:

**Atoms** (`src/components/ui/atoms/`):
- Button, Input, Checkbox, Radio, Toggle, Badge, Tag, Icon, Typography

**Molecules** (`src/components/ui/molecules/`):
- FormField, SearchBar, Pagination, ProgressBar, TabGroup, Dropdown

**Organisms** (`src/components/ui/organisms/`):
- Header, Sidebar, DataTable, FormSection, Modal, Card, Timeline

**Templates** (`src/components/templates/`):
- DashboardLayout, FormLayout, DetailLayout, ListLayout

## Components and Interfaces

### Core Atom Components

#### Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'outline' | 'ghost' | 'link';
  size: 'sm' | 'md' | 'lg';
  colorScheme?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
```

**Variants:**
- `primary`: Solid background with primary color
- `outline`: Transparent background with colored border
- `ghost`: Transparent background, no border
- `link`: Text-only appearance

#### Input Component

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  size: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success' | 'disabled';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}
```

#### Badge Component

```typescript
interface BadgeProps {
  variant: 'solid' | 'outline' | 'subtle';
  colorScheme: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  size: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  children: ReactNode;
}
```

### Molecule Components

#### FormField Component

```typescript
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode; // Input, Select, Textarea, etc.
}
```

#### SearchBar Component

```typescript
interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSearch?: (value: string) => void;
  loading?: boolean;
}
```

#### Pagination Component

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant: 'primary' | 'boxed' | 'fullsize';
  showFirstLast?: boolean;
}
```

### Organism Components

#### Header Component

```typescript
interface HeaderProps {
  logo: ReactNode;
  navigation: NavigationItem[];
  searchEnabled?: boolean;
  userMenu: UserMenuProps;
  notifications?: NotificationProps;
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  badge?: number;
}
```

#### DataTable Component

```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: PaginationConfig;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyState?: ReactNode;
}

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
}
```

#### Modal Component

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}
```

## Data Models

### Design Token Structure

```typescript
interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  radii: RadiusTokens;
}

interface ColorTokens {
  primary: ColorScale;
  secondary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  neutral: ColorScale;
  background: BackgroundColors;
}

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base color
  600: string;
  700: string;
  800: string;
  900: string;
}

interface TypographyTokens {
  fontFamily: {
    primary: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, string>;
}
```

### Component Mapping Model

```typescript
interface ComponentMapping {
  penpotId: string;
  penpotName: string;
  componentPath: string;
  componentName: string;
  props: Record<string, any>;
  variants: VariantMapping[];
  notes: string;
}

interface VariantMapping {
  penpotVariant: string;
  propValue: string;
  description: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Design Token Consistency
*For any* component that uses a color value, that color value must exist in the design token system and match the Penpot specification exactly.
**Validates: Requirements 1.1, 1.5, 11.2**

### Property 2: Component Prop Type Safety
*For any* component with variants, the variant prop must be a string literal union that prevents invalid values at compile time.
**Validates: Requirements 7.2**

### Property 3: Atomic Design Hierarchy
*For any* molecule or organism component, all child components must be either atoms or lower-level molecules, never higher-level components.
**Validates: Requirements 2.1-2.5, 3.1-3.5, 4.1-4.5**

### Property 4: No Duplicate Components
*For any* two components in the codebase, they must not implement the same visual pattern or functionality.
**Validates: Requirements 12.1, 12.2**

### Property 5: Spacing Token Usage
*For any* component that applies spacing (margin, padding, gap), the spacing value must come from the design token spacing scale.
**Validates: Requirements 1.3, 11.1**

### Property 6: Typography Token Usage
*For any* text element, the font size, weight, and family must match a defined typography token from the design system.
**Validates: Requirements 1.2, 11.3**

### Property 7: Accessibility Contrast
*For any* text element on a background, the color combination must meet WCAG AA contrast ratio requirements (4.5:1 for normal text, 3:1 for large text).
**Validates: Requirements 10.2**

### Property 8: Component Props API Consistency
*For any* two components of the same category (e.g., all form inputs), they must use consistent prop naming conventions for similar functionality.
**Validates: Requirements 7.1, 7.4**

### Property 9: Responsive Breakpoint Consistency
*For any* component with responsive behavior, the breakpoints used must match the design system's defined breakpoint tokens.
**Validates: Requirements 9.1, 9.2**

### Property 10: Focus Management in Modals
*For any* modal dialog that is open, keyboard focus must be trapped within the modal and return to the trigger element on close.
**Validates: Requirements 10.5**

### Property 11: Penpot Mapping Completeness
*For any* Penpot component in the design system, there must exist a corresponding mapping entry linking it to an application component.
**Validates: Requirements 5.1, 5.2, 5.5**

### Property 12: No Inline Styles
*For any* refactored page component, there must be no inline style objects or className strings that don't reference design tokens.
**Validates: Requirements 6.1, 6.3**

## Error Handling

### Design Token Errors

**Missing Token Reference:**
- Detection: TypeScript compilation error when referencing non-existent token
- Handling: Provide clear error message indicating which token is missing and suggest alternatives
- Prevention: Use TypeScript const assertions and strict typing for token objects

**Invalid Color Format:**
- Detection: Runtime validation of hex color format
- Handling: Throw error with specific color value and expected format
- Prevention: Use Zod schema validation for color tokens

### Component Errors

**Invalid Prop Combination:**
- Detection: Runtime prop validation using PropTypes or Zod
- Handling: Console warning in development, graceful fallback in production
- Prevention: TypeScript interfaces with conditional types for mutually exclusive props

**Missing Required Children:**
- Detection: React.Children validation in component
- Handling: Throw error with clear message about required children
- Prevention: TypeScript interface requiring children prop

**Accessibility Violations:**
- Detection: eslint-plugin-jsx-a11y during development
- Handling: Build-time errors for critical violations, warnings for recommendations
- Prevention: Automated testing with jest-axe

### Refactoring Errors

**Broken Component References:**
- Detection: TypeScript compilation errors for missing imports
- Handling: Update import paths automatically where possible
- Prevention: Use absolute imports and barrel exports

**Missing Functionality After Refactor:**
- Detection: Existing test suite failures
- Handling: Identify failing tests and restore missing functionality
- Prevention: Maintain comprehensive test coverage before refactoring

**Style Regression:**
- Detection: Visual regression testing with Percy or Chromatic
- Handling: Review visual diffs and adjust component styling
- Prevention: Incremental refactoring with visual review at each step

## Testing Strategy

### Unit Testing

**Design Token Tests:**
- Verify all color tokens are valid hex codes
- Verify typography tokens have required properties (family, size, weight)
- Verify spacing scale follows consistent progression
- Test token utility functions (e.g., `getColor()`, `getSpacing()`)

**Component Tests:**
- Test each variant renders correctly
- Test prop combinations produce expected output
- Test event handlers are called with correct arguments
- Test conditional rendering based on props
- Test default prop values

**Example Unit Test:**
```typescript
describe('Button Component', () => {
  it('renders primary variant with correct styles', () => {
    const { getByRole } = render(<Button variant="primary">Click</Button>);
    const button = getByRole('button');
    expect(button).toHaveStyle({ backgroundColor: tokens.colors.primary[500] });
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Property-Based Testing

Property-based tests will use `fast-check` library to generate random inputs and verify universal properties hold across all valid inputs.

**Property Test Configuration:**
- Minimum iterations: 100 per property
- Seed: Deterministic for reproducibility
- Shrinking: Enabled to find minimal failing cases

**Example Property Test:**
```typescript
import fc from 'fast-check';

describe('Design Token Properties', () => {
  it('all color tokens are valid hex codes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(tokens.colors.primary)),
        (color) => {
          expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Page Refactoring Tests:**
- Test complete user flows still work after refactoring
- Test data fetching and state management integration
- Test navigation between refactored pages
- Test form submission with new form components

**Component Integration Tests:**
- Test organism components with real molecule/atom children
- Test form components with validation logic
- Test modal components with focus trap behavior
- Test table components with sorting and pagination

### Visual Regression Testing

**Approach:**
- Use Chromatic or Percy for automated visual testing
- Capture screenshots of all component variants
- Compare against Penpot design screenshots
- Review and approve visual changes

**Coverage:**
- All atomic components in all variants
- Key molecule and organism components
- Critical page layouts before and after refactoring
- Responsive breakpoints (mobile, tablet, desktop)

### Accessibility Testing

**Automated Testing:**
- Run jest-axe on all components
- Use eslint-plugin-jsx-a11y during development
- Test keyboard navigation with Testing Library
- Verify ARIA attributes are present and correct

**Manual Testing:**
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing
- Color contrast verification with tools
- Focus indicator visibility testing

### End-to-End Testing

**Critical Flows:**
- User login and authentication
- Lead creation and management
- Document upload and viewing
- Dashboard data visualization
- Form submission workflows

**Testing Tools:**
- Playwright or Cypress for E2E tests
- Test against refactored pages
- Verify no functionality regression
- Test responsive behavior

## Implementation Phases

### Phase 1: Foundation (Design Tokens & Atoms)
1. Extract and document all design tokens from Penpot
2. Create centralized token system in codebase
3. Implement atomic components (Button, Input, Badge, etc.)
4. Write unit and property tests for atoms
5. Create Storybook documentation for atoms

### Phase 2: Composition (Molecules & Organisms)
1. Build molecule components from atoms
2. Build organism components from molecules
3. Write integration tests for composed components
4. Document component composition patterns
5. Create visual regression test baseline

### Phase 3: Mapping & Planning
1. Audit existing application pages
2. Create Penpot-to-component mapping document
3. Identify duplicate components for consolidation
4. Plan refactoring order (least to most complex)
5. Establish refactoring checklist

### Phase 4: Incremental Refactoring
1. Refactor simple pages first (login, signup)
2. Refactor dashboard and list pages
3. Refactor complex form pages
4. Refactor admin pages
5. Remove deprecated components

### Phase 5: Validation & Polish
1. Run full test suite
2. Perform visual regression testing
3. Conduct accessibility audit
4. Perform cross-browser testing
5. Document any deviations from Penpot design

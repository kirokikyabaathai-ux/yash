# Molecule Components - Penpot Design System

This directory contains molecule-level components that compose atomic components into more complex, reusable UI elements. Molecules follow the atomic design methodology and serve as building blocks for organism-level components.

## Components

### FormField

Combines label, input, and error/help text into a complete form field component.

**Features:**
- Automatic label-input association
- Required field indicator
- Error message display with ARIA announcements
- Help text support
- Accessibility compliant (WCAG AA)

**Usage:**
```tsx
<FormField label="Email" required error="Invalid email">
  <Input type="email" placeholder="Enter your email" />
</FormField>
```

**Validates:** Requirements 3.1, 10.1, 10.4

---

### SearchBar

Combines input field with search icon and clear button for search functionality.

**Features:**
- Search icon indicator
- Clear button when value is present
- Loading state support
- Enter key submission
- Customizable size variants

**Usage:**
```tsx
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search leads..."
  onSearch={handleSearch}
/>
```

**Validates:** Requirements 3.2

---

### Pagination

Combines buttons and page indicators into navigation controls for paginated content.

**Features:**
- Smart page number display with ellipsis
- Previous/Next navigation
- Optional First/Last buttons
- Multiple visual variants (primary, boxed, fullsize)
- Keyboard navigation support
- ARIA labels for accessibility

**Usage:**
```tsx
<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={setPage}
  variant="primary"
  showFirstLast
/>
```

**Validates:** Requirements 3.3, 10.3

---

### ProgressBar

Combines progress bar with label and percentage display for progress indication.

**Features:**
- Percentage display
- Optional label text
- Multiple color schemes (primary, success, warning, error, info)
- Size variants (sm, md, lg)
- Smooth transitions
- ARIA progressbar role

**Usage:**
```tsx
<ProgressBar
  value={75}
  label="Upload Progress"
  showPercentage
  colorScheme="primary"
/>
```

**Validates:** Requirements 3.4, 10.1

---

### TabGroup

Combines tab buttons with active state indicators and content panels for tabbed interfaces.

**Features:**
- Controlled and uncontrolled modes
- Multiple visual variants (default, boxed, pills)
- Optional icons and badges
- Keyboard navigation (Arrow keys)
- Disabled tab support
- ARIA tablist/tab/tabpanel roles

**Usage:**
```tsx
<TabGroup
  tabs={[
    { id: 'overview', label: 'Overview', content: <OverviewPanel /> },
    { id: 'details', label: 'Details', content: <DetailsPanel /> },
  ]}
  defaultTab="overview"
/>
```

**Validates:** Requirements 3.5, 10.3

---

## Design Principles

All molecule components follow these principles:

1. **Atomic Composition**: Built from atomic components (Button, Input, Label, etc.)
2. **Accessibility First**: WCAG AA compliant with proper ARIA attributes
3. **Design Token Usage**: All styling uses Penpot design tokens
4. **Type Safety**: Full TypeScript support with comprehensive prop types
5. **Keyboard Navigation**: Full keyboard support where applicable
6. **Responsive**: Adapts to different screen sizes
7. **Consistent API**: Similar props patterns across components

## Accessibility Features

- Proper ARIA roles and attributes
- Keyboard navigation support
- Focus management
- Screen reader announcements
- Label associations
- Error announcements

## Related Documentation

- [Design Document](.kiro/specs/penpot-ui-modernization/design.md)
- [Requirements Document](.kiro/specs/penpot-ui-modernization/requirements.md)
- [Atomic Components](../atoms/README.md)
- [Design Tokens](../../../lib/design-system/tokens.ts)

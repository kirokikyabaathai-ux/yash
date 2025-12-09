# UI Components - Penpot Design System

This directory contains the complete UI component library for the YAS Natural Solar CRM application, built following atomic design principles and the Penpot design system specifications.

## 📚 Complete Documentation

**[→ View Complete Component Catalog](./COMPONENT_CATALOG.md)**

The Component Catalog provides comprehensive documentation for all components including:
- Design tokens and styling guidelines
- Component props and usage examples
- Accessibility guidelines
- Visual examples and best practices

## 🏗️ Component Structure

Components are organized by atomic design principles:

### Atomic Components
Basic building blocks that cannot be broken down further:
- **Button** - Primary interactive element with variants (primary, outline, ghost, link)
- **Input** - Text input fields with icon support and state variants
- **Badge** - Status indicators with color schemes
- **Checkbox** - Binary selection controls
- **Typography** - Text components (H1-H5, body, small, labels)
- **Tag** - Categorization labels with remove functionality

### Molecule Components (`./molecules/`)
Combinations of atoms creating functional UI patterns:
- **FormField** - Label + Input + Error/Help text
- **SearchBar** - Search input with icon and clear button
- **Pagination** - Page navigation controls
- **ProgressBar** - Progress indicator with label and percentage
- **TabGroup** - Tabbed interface with content panels

### Organism Components (`./organisms/`)
Complex UI sections combining molecules and atoms:
- **Modal** - Dialog overlays with focus trap
- **DataTable** - Feature-rich data tables with sorting, filtering, pagination
- **Card** - Content containers with header, content, and footer
- **FormSection** - Complete forms with sections and validation
- **Header** - Application navigation with logo, menu, search, and user profile


## 🚀 Quick Start

### Import Components

```tsx
// Atomic components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Typography, H1, Body } from '@/components/ui/typography'

// Molecule components
import { FormField } from '@/components/ui/molecules/FormField'
import { SearchBar } from '@/components/ui/molecules/SearchBar'
import { Pagination } from '@/components/ui/molecules/Pagination'

// Organism components
import { Modal } from '@/components/ui/organisms/Modal'
import { DataTable } from '@/components/ui/organisms/DataTable'
import { Card } from '@/components/ui/organisms/Card'
```

### Basic Usage Examples

```tsx
// Button with variants
<Button variant="primary" size="md">Save Changes</Button>
<Button variant="outline" leftIcon={<PlusIcon />}>Add Item</Button>

// Form field with input
<FormField label="Email" required error={errors.email}>
  <Input type="email" placeholder="Enter your email" />
</FormField>

// Data table with features
<DataTable
  columns={[
    { key: 'name', header: 'Name', sortable: true },
    { key: 'status', header: 'Status', render: (value) => <Badge>{value}</Badge> }
  ]}
  data={items}
  sortable
  filterable
  pagination={{ currentPage: 1, totalPages: 10, onPageChange: setPage }}
/>

// Modal dialog
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

## 🎨 Design System

All components use centralized design tokens from `@/lib/design-system/tokens`:

```tsx
import { 
  penpotColors, 
  penpotSpacing, 
  penpotTypography,
  penpotShadows,
  penpotRadii 
} from '@/lib/design-system/tokens'
```

### Key Design Tokens

**Colors:**
- Primary: `#5E81F4` (brand blue)
- Success: `#7CE7AC` (green)
- Warning: `#F4BE5E` (yellow)
- Error: `#FF808B` (red)
- Info: `#40E1FA` (cyan)

**Typography:**
- Font Family: Lato
- Sizes: 12px, 14px, 16px, 18px, 20px, 26px, 32px
- Weights: 300 (light), 400 (regular), 700 (bold)

**Spacing:**
- Base unit: 4px
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

**Shadows:**
- sm: `0 1px 2px rgba(0, 0, 0, 0.05)`
- md: `0 4px 6px rgba(0, 0, 0, 0.07)`
- lg: `0 10px 15px rgba(0, 0, 0, 0.1)`
- xl: `0 20px 25px rgba(0, 0, 0, 0.15)`

**Border Radius:**
- sm: 4px
- md: 8px
- lg: 12px
- full: 9999px


## ♿ Accessibility

All components follow WCAG 2.1 Level AA guidelines:

### Keyboard Navigation
- ✅ Tab/Shift+Tab - Navigate between elements
- ✅ Enter/Space - Activate buttons and controls
- ✅ Escape - Close modals and dropdowns
- ✅ Arrow keys - Navigate within components

### Screen Reader Support
- ✅ Proper ARIA attributes (aria-label, aria-labelledby, aria-describedby)
- ✅ Semantic HTML elements
- ✅ Live region announcements (aria-live)
- ✅ Form error announcements

### Color Contrast
- ✅ Primary text on white: 16.5:1
- ✅ Secondary text on white: 4.8:1
- ✅ All interactive elements meet 3:1 minimum
- ✅ Error states clearly indicated

### Focus Indicators
- ✅ Visible focus rings on all interactive elements
- ✅ 2px ring with 20% opacity
- ✅ Only visible on keyboard navigation (focus-visible)

See the [Component Catalog](./COMPONENT_CATALOG.md#accessibility) for detailed accessibility documentation.

## 🧪 Testing

Components are tested using:
- **Unit tests** - Jest + React Testing Library
- **Property-based tests** - fast-check for universal properties
- **Accessibility tests** - jest-axe for automated a11y testing
- **Visual regression** - Chromatic/Percy for visual changes

Example test:
```tsx
import { axe } from 'jest-axe'
import { render } from '@testing-library/react'

test('Button has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```


## 📦 Additional Components

### Loading States

#### Spinner
```tsx
import { Spinner } from "@/components/ui/spinner"
<Spinner size="md" />
```

#### LoadingButton
```tsx
import { LoadingButton } from "@/components/ui/loading-button"
<LoadingButton loading={isLoading}>Save Changes</LoadingButton>
```

#### Skeleton Loaders
Pre-built skeleton loaders for common components:
```tsx
import { 
  LeadListSkeleton,
  TimelineSkeleton,
  DocumentListSkeleton,
  DashboardMetricsSkeleton,
  FormSkeleton,
  TableSkeleton 
} from "@/components/ui/skeleton-loaders"

{isLoading ? <LeadListSkeleton /> : <LeadList data={leads} />}
```

### Notifications

#### Toast Notifications
```tsx
import { toast } from "@/lib/toast"

toast.success("Lead created successfully")
toast.error("Failed to save changes", "Please try again")
toast.loading("Uploading document...")
```

### Confirmation Dialogs

#### useConfirm Hook
```tsx
import { useConfirm } from "@/hooks/use-confirm"

const { confirm, ConfirmationDialog } = useConfirm()

const handleDelete = async () => {
  const confirmed = await confirm({
    title: "Delete Item",
    description: "Are you sure?",
    variant: "destructive",
  })
  
  if (confirmed) {
    // Proceed with deletion
  }
}
```

#### Specialized Dialogs
- `DeleteConfirmDialog` - For delete actions
- `StatusChangeDialog` - For status changes
- `CloseProjectDialog` - For closing projects
- `DocumentCorruptionDialog` - For marking documents as corrupted

### Accessibility Components

#### VisuallyHidden
```tsx
import { VisuallyHidden } from "@/components/ui/visually-hidden"

<button>
  <TrashIcon />
  <VisuallyHidden>Delete item</VisuallyHidden>
</button>
```

#### SkipToContent
```tsx
import { SkipToContent } from "@/components/ui/skip-to-content"
<SkipToContent targetId="main-content" />
```


## 🎯 Best Practices

### Component Selection
1. **Start with atoms** - Use Button, Input, Badge, Typography for basic elements
2. **Combine into molecules** - Use FormField, SearchBar for common patterns
3. **Build organisms** - Use Modal, DataTable, Card for complex sections
4. **Compose pages** - Combine organisms into complete interfaces

### Styling Guidelines
```tsx
// ✅ Good - Use design tokens
<div className="text-[var(--penpot-neutral-dark)] bg-[var(--penpot-bg-white)]">
  Content
</div>

// ❌ Bad - Hardcoded colors
<div className="text-gray-900 bg-white">
  Content
</div>
```

### State Management
```tsx
// ✅ Good - Controlled components
const [email, setEmail] = useState('')
const [error, setError] = useState('')

<FormField label="Email" error={error}>
  <Input 
    type="email" 
    value={email} 
    onChange={(e) => setEmail(e.target.value)}
    state={error ? 'error' : 'default'}
  />
</FormField>
```

### Responsive Design
```tsx
// ✅ Good - Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

## 🤝 Contributing

When adding or modifying components:

1. ✅ Follow atomic design principles
2. ✅ Use design tokens (no hardcoded values)
3. ✅ Add comprehensive JSDoc comments
4. ✅ Include usage examples in comments
5. ✅ Ensure accessibility compliance (WCAG AA)
6. ✅ Write tests (unit + property-based)
7. ✅ Update the Component Catalog

### Component Template

```tsx
/**
 * ComponentName - Penpot Design System
 * 
 * [Brief description of the component]
 * 
 * @example
 * ```tsx
 * <ComponentName prop="value">Content</ComponentName>
 * ```
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md - ComponentName
 * @validates Requirements X.Y
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { penpotColors } from '@/lib/design-system/tokens'

export interface ComponentNameProps {
  /** Prop description */
  propName: string
  children: React.ReactNode
}

export function ComponentName({ propName, children }: ComponentNameProps) {
  return (
    <div className={cn('base-classes')}>
      {children}
    </div>
  )
}
```

## 📖 Related Documentation

- **[Component Catalog](./COMPONENT_CATALOG.md)** - Complete component reference with examples
- **[Requirements](./.kiro/specs/penpot-ui-modernization/requirements.md)** - Feature requirements
- **[Design Document](./.kiro/specs/penpot-ui-modernization/design.md)** - Architecture and design
- **[Penpot Mapping](./.kiro/specs/penpot-ui-modernization/penpot-component-mapping.md)** - Design-to-code mapping
- **[Accessibility Guidelines](../../lib/ACCESSIBILITY.md)** - Accessibility best practices

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com)

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Maintained by:** YAS Natural Solar Development Team

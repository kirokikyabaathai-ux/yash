# Atomic UI Components - Penpot Design System

This directory contains atomic-level components from the Penpot design system. Atomic components are the basic building blocks that cannot be broken down further.

## Components

### Form Controls

- **Button**: Primary, outline, ghost, and link variants with multiple sizes and color schemes
- **Input**: Text input with icon support and state variants (default, error, success, disabled)
- **Checkbox**: Checkbox with checked, unchecked, and disabled states
- **Radio**: Radio button group with state variants
- **Switch**: Toggle switch with state variants

### Display Components

- **Badge**: Solid, outline, and subtle variants with color schemes
- **Tag**: Similar to badges but for categorization, with removable functionality

### Typography

- **Typography**: Heading levels (H1-H5) and body text variants
- **H1-H5**: Convenience components for headings
- **Body, BodyBold, Small, SmallBold, Light**: Convenience components for body text
- **LabelText, LabelSmall**: Convenience components for form labels

## Design Tokens

All components use Penpot design tokens defined in `src/lib/design-system/tokens.ts`:

- **Colors**: Primary (#5E81F4), Success (#7CE7AC), Warning (#F4BE5E), Error (#FF808B), etc.
- **Typography**: Lato font family with specific sizes and weights
- **Spacing**: 4px base unit with consistent scale
- **Shadows**: sm, md, lg, xl elevation levels
- **Border Radius**: sm (4px), md (8px), lg (12px), full (9999px)

## Usage Examples

### Button

```tsx
import { Button } from '@/components/ui/atoms'

<Button variant="primary" size="md">Click me</Button>
<Button variant="outline" colorScheme="green" leftIcon={<Icon />}>
  With Icon
</Button>
<Button variant="ghost" loading>Loading...</Button>
```

### Input

```tsx
import { Input } from '@/components/ui/atoms'

<Input type="text" placeholder="Enter text" />
<Input type="email" leftIcon={<MailIcon />} state="error" />
<Input type="password" rightIcon={<EyeIcon />} size="lg" />
```

### Badge

```tsx
import { Badge } from '@/components/ui/atoms'

<Badge variant="solid" colorScheme="blue">New</Badge>
<Badge variant="outline" colorScheme="green">Active</Badge>
<Badge variant="subtle" colorScheme="red" rounded>Error</Badge>
```

### Typography

```tsx
import { H1, Body, Small } from '@/components/ui/atoms'

<H1>Main Heading</H1>
<Body>Regular body text</Body>
<Small color="secondary">Small secondary text</Small>
```

## Requirements Validation

These components satisfy the following requirements from the Penpot UI Modernization spec:

- **Requirement 2.1**: Button component with all variants (primary, outline, disabled, hover, active states)
- **Requirement 2.2**: Input component with text, icon-left, icon-right, error, success, and disabled states
- **Requirement 2.3**: Form elements including checkbox, radio, toggle components with all states
- **Requirement 2.4**: Badge and tag components with color variants (blue, green, yellow, red, grey)
- **Requirement 2.5**: Typography components for heading levels (H1-H5) and body text variants

## Design System Compliance

All components:
- Use exact Penpot color values via CSS variables
- Follow Penpot spacing scale (4px base unit)
- Implement Penpot typography styles (Lato font, specific sizes/weights)
- Apply Penpot border radius values (4px, 8px, 12px)
- Support all required variants and states from the design system

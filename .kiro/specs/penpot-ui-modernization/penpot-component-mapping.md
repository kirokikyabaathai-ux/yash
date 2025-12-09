# Penpot-to-Component Mapping Document

## Overview

This document provides a comprehensive mapping between Penpot design system elements and their corresponding React component implementations in the YAS Natural Solar CRM application. It serves as the authoritative reference for ensuring pixel-perfect implementation of the Penpot design system.

**Design System Summary:**
- **Total Penpot Components Analyzed:** 170+
- **Color Tokens:** 15 unique colors
- **Typography Styles:** 25 variants
- **Component Categories:** Buttons, Forms, Navigation, Data Display, Layouts

**Implementation Status:**
- ✅ Design tokens extracted and implemented
- ✅ Atomic components (Button, Input, Badge, Typography, etc.)
- ✅ Molecule components (FormField, SearchBar, Pagination, etc.)
- ✅ Organism components (Header, DataTable, Modal, Card, FormSection)

---

## Table of Contents

1. [Color Mapping](#color-mapping)
2. [Typography Mapping](#typography-mapping)
3. [Button Component Mapping](#button-component-mapping)
4. [Form Element Mapping](#form-element-mapping)
5. [Badge and Tag Mapping](#badge-and-tag-mapping)
6. [Layout Component Mapping](#layout-component-mapping)
7. [Data Display Component Mapping](#data-display-component-mapping)
8. [Navigation Component Mapping](#navigation-component-mapping)
9. [Modal and Dialog Mapping](#modal-and-dialog-mapping)
10. [Spacing and Layout Tokens](#spacing-and-layout-tokens)

---


## 1. Color Mapping

### Penpot Color Palette → Application Usage Contexts

| Penpot Color | Hex Value | Token Path | Usage Context | Component Examples |
|--------------|-----------|------------|---------------|-------------------|
| **Primary Blue** | `#5E81F4` | `penpotColors.primary.main` | Primary actions, brand elements, links | Primary buttons, active states, brand headers |
| **Light Blue** | `#9698D6` | `penpotColors.primary.light` | Hover states, subtle accents | Button hover, secondary highlights |
| **Dark Blue** | `#4D4CAC` | `penpotColors.primary.dark` | Active/pressed states | Button active state, selected items |
| **Success Green** | `#7CE7AC` | `penpotColors.success.main` | Success states, positive feedback | Success badges, confirmation messages, positive status |
| **Warning Yellow** | `#F4BE5E` | `penpotColors.warning.main` | Warning states, caution indicators | Warning badges, pending status, alerts |
| **Error Red** | `#FF808B` | `penpotColors.error.main` | Error states, destructive actions | Error badges, delete buttons, validation errors |
| **Info Cyan** | `#40E1FA` | `penpotColors.info.main` | Informational states, neutral feedback | Info badges, tooltips, help text |
| **Info Light Cyan** | `#2CE5F6` | `penpotColors.info.light` | Subtle info highlights | Background accents, hover states |
| **Dark Text** | `#1C1D21` | `penpotColors.neutral.darkText` | Primary text, headings | All body text, headings, labels |
| **Secondary Text** | `#8181A5` | `penpotColors.neutral.secondaryText` | Secondary text, placeholders | Placeholder text, disabled text, captions |
| **White** | `#FFFFFF` | `penpotColors.background.white` | Primary background, cards | Page backgrounds, card backgrounds, modals |
| **Gray 50** | `#F6F6F6` | `penpotColors.background.gray50` | Subtle backgrounds, hover states | Input hover, table row hover, disabled backgrounds |
| **Gray 100** | `#F5F5FA` | `penpotColors.background.gray100` | Section backgrounds | Page sections, sidebar backgrounds |
| **Gray 200** | `#F0F0F3` | `penpotColors.background.gray200` | Borders, dividers | Card borders, section dividers, disabled states |
| **Border Light** | `#ECECF2` | `penpotColors.border.light` | Default borders | Input borders, card borders, table borders |

### Color Usage Guidelines

**Primary Actions:**
- Use `primary.main` (#5E81F4) for all primary CTAs
- Use `primary.light` (#9698D6) for hover states
- Use `primary.dark` (#4D4CAC) for active/pressed states

**State Colors:**
- Success: `success.main` (#7CE7AC) - completed, approved, active
- Warning: `warning.main` (#F4BE5E) - pending, in-progress, caution
- Error: `error.main` (#FF808B) - failed, rejected, destructive
- Info: `info.main` (#40E1FA) - informational, neutral

**Text Hierarchy:**
- Primary text: `neutral.darkText` (#1C1D21)
- Secondary text: `neutral.secondaryText` (#8181A5)
- Disabled text: `neutral.secondaryText` with 50% opacity

**Backgrounds:**
- Primary: `background.white` (#FFFFFF)
- Subtle: `background.gray50` (#F6F6F6)
- Section: `background.gray100` (#F5F5FA)
- Disabled: `background.gray200` (#F0F0F3)


## 2. Typography Mapping

### Penpot Typography Styles → React Component Props

| Penpot Style | Font Size | Font Weight | Line Height | Token Path | Component Usage | React Props |
|--------------|-----------|-------------|-------------|------------|-----------------|-------------|
| **Heading 1** | 32px | 700 (Bold) | 1.2 | `penpotTypography.headings.h1` | Page titles, main headings | `<H1>` or `<Typography variant="h1">` |
| **Heading 2** | 26px | 700 (Bold) | 1.2 | `penpotTypography.headings.h2` | Section titles | `<H2>` or `<Typography variant="h2">` |
| **Heading 3** | 20px | 700 (Bold) | 1.3 | `penpotTypography.headings.h3` | Subsection titles, card headers | `<H3>` or `<Typography variant="h3">` |
| **Heading 4** | 18px | 700 (Bold) | 1.3 | `penpotTypography.headings.h4` | Component titles | `<H4>` or `<Typography variant="h4">` |
| **Heading 5** | 16px | 700 (Bold) | 1.4 | `penpotTypography.headings.h5` | Small headings, emphasized text | `<H5>` or `<Typography variant="h5">` |
| **Body Regular** | 14px | 400 (Normal) | 1.5 | `penpotTypography.body.regular` | Default body text, paragraphs | `<Body>` or `<Typography variant="body">` |
| **Body Bold** | 14px | 700 (Bold) | 1.5 | `penpotTypography.body.bold` | Emphasized body text | `<BodyBold>` or `<Typography variant="bodyBold">` |
| **Small Regular** | 12px | 400 (Normal) | 1.5 | `penpotTypography.body.small` | Captions, helper text, metadata | `<Small>` or `<Typography variant="small">` |
| **Small Bold** | 12px | 700 (Bold) | 1.5 | `penpotTypography.body.smallBold` | Emphasized small text, badges | `<SmallBold>` or `<Typography variant="smallBold">` |
| **Light** | 14px | 300 (Light) | 1.5 | `penpotTypography.body.light` | Subtle text, secondary content | `<Light>` or `<Typography variant="light">` |
| **Label Regular** | 14px | 700 (Bold) | 1.4 | `penpotTypography.labels.regular` | Form labels, input labels | `<LabelText>` or `<Typography variant="label">` |
| **Label Small** | 12px | 700 (Bold) | 1.4 | `penpotTypography.labels.small` | Small form labels, compact labels | `<LabelSmall>` or `<Typography variant="labelSmall">` |

### Typography Usage Guidelines

**Semantic Hierarchy:**
```tsx
// Page structure
<H1>Dashboard</H1>                    // Page title
<H2>Recent Activity</H2>               // Section title
<H3>Lead Details</H3>                  // Subsection title
<H4>Contact Information</H4>           // Component title
<H5>Additional Notes</H5>              // Small heading

// Content
<Body>This is the main content text.</Body>
<BodyBold>This is emphasized content.</BodyBold>
<Small>Last updated: 2 hours ago</Small>
<Light>Optional secondary information</Light>

// Forms
<LabelText>Email Address</LabelText>
<LabelSmall>Optional</LabelSmall>
```

**Color Variants:**
```tsx
<Typography variant="h2" color="primary">Default dark text</Typography>
<Typography variant="body" color="secondary">Secondary gray text</Typography>
<Typography variant="small" color="brand">Brand blue text</Typography>
<Typography variant="body" color="error">Error red text</Typography>
<Typography variant="body" color="success">Success green text</Typography>
```

### Font Family

**Primary Font:** Lato (sans-serif)
- Regular (400): Body text, paragraphs
- Light (300): Subtle text
- Bold (700): Headings, labels, emphasis

**Icon Fonts (Penpot):**
- `la-solid-900`: Solid icons
- `la-regular-400`: Regular icons
- `la-brands-400`: Brand icons


## 3. Button Component Mapping

### Penpot Button Variants → React Component Props

| Penpot Button | Visual Style | Component Path | React Props | Usage Context |
|---------------|--------------|----------------|-------------|---------------|
| **Primary Button** | Solid blue background, white text | `src/components/ui/button.tsx` | `variant="primary"` | Primary CTAs, submit actions |
| **Primary Button (Hover)** | Slightly transparent blue | Auto-applied | `variant="primary"` (hover state) | Hover state |
| **Primary Button (Active)** | Darker blue | Auto-applied | `variant="primary"` (active state) | Pressed state |
| **Primary Button (Disabled)** | 50% opacity | Auto-applied | `variant="primary" disabled` | Disabled state |
| **Outline Button** | Transparent bg, blue border | `src/components/ui/button.tsx` | `variant="outline"` | Secondary actions |
| **Ghost Button** | Transparent bg, no border | `src/components/ui/button.tsx` | `variant="ghost"` | Tertiary actions, icon buttons |
| **Link Button** | Text only, underline on hover | `src/components/ui/button.tsx` | `variant="link"` | Text links, inline actions |
| **Success Button** | Green background | `src/components/ui/button.tsx` | `variant="primary" colorScheme="green"` | Approve, confirm actions |
| **Warning Button** | Yellow background | `src/components/ui/button.tsx` | `variant="primary" colorScheme="yellow"` | Caution actions |
| **Danger Button** | Red background | `src/components/ui/button.tsx` | `variant="primary" colorScheme="red"` | Delete, destructive actions |
| **Small Button** | Compact size (h-8) | `src/components/ui/button.tsx` | `size="sm"` | Compact layouts, tables |
| **Medium Button** | Default size (h-10) | `src/components/ui/button.tsx` | `size="md"` | Standard forms, cards |
| **Large Button** | Prominent size (h-12) | `src/components/ui/button.tsx` | `size="lg"` | Hero sections, important CTAs |
| **Button with Left Icon** | Icon before text | `src/components/ui/button.tsx` | `leftIcon={<Icon />}` | Actions with visual context |
| **Button with Right Icon** | Icon after text | `src/components/ui/button.tsx` | `rightIcon={<Icon />}` | Dropdown indicators, external links |
| **Loading Button** | Spinner replaces content | `src/components/ui/button.tsx` | `loading={true}` | Async operations |
| **Full Width Button** | Spans container width | `src/components/ui/button.tsx` | `fullWidth={true}` | Mobile layouts, forms |

### Button Usage Examples

```tsx
import { Button } from '@/components/ui/atoms'

// Primary actions
<Button variant="primary" size="md">Save Changes</Button>
<Button variant="primary" colorScheme="green">Approve Lead</Button>
<Button variant="primary" colorScheme="red">Delete User</Button>

// Secondary actions
<Button variant="outline">Cancel</Button>
<Button variant="ghost">View Details</Button>
<Button variant="link">Learn More</Button>

// With icons
<Button variant="primary" leftIcon={<PlusIcon />}>Add Lead</Button>
<Button variant="outline" rightIcon={<ChevronDownIcon />}>Options</Button>

// States
<Button variant="primary" loading>Saving...</Button>
<Button variant="primary" disabled>Unavailable</Button>

// Sizes
<Button variant="primary" size="sm">Small</Button>
<Button variant="primary" size="md">Medium</Button>
<Button variant="primary" size="lg">Large</Button>

// Full width (mobile)
<Button variant="primary" fullWidth>Submit Form</Button>
```

### Button Color Scheme Mapping

| Color Scheme | Background Color | Text Color | Border Color | Usage |
|--------------|------------------|------------|--------------|-------|
| `blue` (default) | `#5E81F4` | White | N/A | Primary actions |
| `green` | `#7CE7AC` | `#1C1D21` | N/A | Success, approve |
| `yellow` | `#F4BE5E` | `#1C1D21` | N/A | Warning, caution |
| `red` | `#FF808B` | White | N/A | Danger, delete |
| `gray` | `#F0F0F3` | `#1C1D21` | N/A | Neutral, disabled |


## 4. Form Element Mapping

### Penpot Form Components → React Components

| Penpot Component | Visual Style | Component Path | React Props | Usage Context |
|------------------|--------------|----------------|-------------|---------------|
| **Text Input (Default)** | White bg, light border | `src/components/ui/input.tsx` | `type="text"` | Text entry fields |
| **Text Input (Focus)** | Blue border, ring | Auto-applied | `type="text"` (focus state) | Active input |
| **Text Input (Error)** | Red border, ring | `src/components/ui/input.tsx` | `state="error"` | Validation errors |
| **Text Input (Success)** | Green border, ring | `src/components/ui/input.tsx` | `state="success"` | Validated input |
| **Text Input (Disabled)** | Gray bg, 50% opacity | `src/components/ui/input.tsx` | `state="disabled"` or `disabled` | Disabled field |
| **Input with Left Icon** | Icon on left side | `src/components/ui/input.tsx` | `leftIcon={<Icon />}` | Search, email, etc. |
| **Input with Right Icon** | Icon on right side | `src/components/ui/input.tsx` | `rightIcon={<Icon />}` | Password toggle, clear |
| **Small Input** | Compact (h-8) | `src/components/ui/input.tsx` | `size="sm"` | Compact forms, filters |
| **Medium Input** | Default (h-10) | `src/components/ui/input.tsx` | `size="md"` | Standard forms |
| **Large Input** | Prominent (h-12) | `src/components/ui/input.tsx` | `size="lg"` | Important fields |
| **Email Input** | Email validation | `src/components/ui/input.tsx` | `type="email"` | Email addresses |
| **Password Input** | Masked text | `src/components/ui/input.tsx` | `type="password"` | Password fields |
| **Number Input** | Numeric only | `src/components/ui/input.tsx` | `type="number"` | Numeric values |
| **Tel Input** | Phone validation | `src/components/ui/input.tsx` | `type="tel"` | Phone numbers |
| **Checkbox (Unchecked)** | Empty box | `src/components/ui/checkbox.tsx` | `checked={false}` | Boolean options |
| **Checkbox (Checked)** | Blue box with checkmark | `src/components/ui/checkbox.tsx` | `checked={true}` | Selected option |
| **Checkbox (Disabled)** | Gray, 50% opacity | `src/components/ui/checkbox.tsx` | `disabled` | Disabled option |
| **Radio Button (Unselected)** | Empty circle | `src/components/ui/radio-group.tsx` | `value` not selected | Single choice |
| **Radio Button (Selected)** | Blue circle with dot | `src/components/ui/radio-group.tsx` | `value` selected | Selected choice |
| **Toggle/Switch (Off)** | Gray background | `src/components/ui/switch.tsx` | `checked={false}` | Boolean toggle |
| **Toggle/Switch (On)** | Blue background | `src/components/ui/switch.tsx` | `checked={true}` | Enabled toggle |
| **Select Dropdown** | Dropdown with arrow | `src/components/ui/select.tsx` | `<Select>` | Single selection |
| **Textarea** | Multi-line input | `src/components/ui/textarea.tsx` | `<Textarea>` | Long text entry |

### Form Field Molecule

The `FormField` molecule combines label, input, and error message:

```tsx
import { FormField } from '@/components/ui/molecules'
import { Input } from '@/components/ui/atoms'

<FormField
  label="Email Address"
  required={true}
  error="Please enter a valid email"
  helpText="We'll never share your email"
>
  <Input type="email" placeholder="you@example.com" state="error" />
</FormField>
```

### Form Usage Examples

```tsx
import { Input, Checkbox, RadioGroup, RadioGroupItem, Switch } from '@/components/ui/atoms'

// Text inputs
<Input type="text" placeholder="Enter your name" />
<Input type="email" leftIcon={<MailIcon />} placeholder="Email" />
<Input type="password" rightIcon={<EyeIcon />} placeholder="Password" />

// Input states
<Input type="text" state="error" />
<Input type="text" state="success" />
<Input type="text" state="disabled" />

// Input sizes
<Input type="text" size="sm" />
<Input type="text" size="md" />
<Input type="text" size="lg" />

// Checkbox
<Checkbox checked={true} />
<Checkbox checked={false} />
<Checkbox disabled />

// Radio group
<RadioGroup value="option1">
  <RadioGroupItem value="option1" />
  <RadioGroupItem value="option2" />
</RadioGroup>

// Toggle switch
<Switch checked={true} />
<Switch checked={false} />
```

### Form Section Organism

The `FormSection` organism groups multiple form fields:

```tsx
import { FormSection } from '@/components/ui/organisms'
import { FormField } from '@/components/ui/molecules'
import { Input } from '@/components/ui/atoms'

<FormSection
  title="Contact Information"
  description="Enter your contact details"
>
  <FormField label="Name" required>
    <Input type="text" />
  </FormField>
  <FormField label="Email" required>
    <Input type="email" />
  </FormField>
  <FormField label="Phone">
    <Input type="tel" />
  </FormField>
</FormSection>
```


## 5. Badge and Tag Mapping

### Penpot Badge Variants → React Component Props

| Penpot Badge | Visual Style | Component Path | React Props | Usage Context |
|--------------|--------------|----------------|-------------|---------------|
| **Solid Blue Badge** | Blue bg, white text | `src/components/ui/badge.tsx` | `variant="solid" colorScheme="blue"` | Primary status, new items |
| **Solid Green Badge** | Green bg, dark text | `src/components/ui/badge.tsx` | `variant="solid" colorScheme="green"` | Success, active, approved |
| **Solid Yellow Badge** | Yellow bg, dark text | `src/components/ui/badge.tsx` | `variant="solid" colorScheme="yellow"` | Warning, pending, in-progress |
| **Solid Red Badge** | Red bg, white text | `src/components/ui/badge.tsx` | `variant="solid" colorScheme="red"` | Error, rejected, urgent |
| **Solid Gray Badge** | Gray bg, dark text | `src/components/ui/badge.tsx` | `variant="solid" colorScheme="gray"` | Neutral, inactive, archived |
| **Outline Blue Badge** | Transparent, blue border | `src/components/ui/badge.tsx` | `variant="outline" colorScheme="blue"` | Secondary status |
| **Outline Green Badge** | Transparent, green border | `src/components/ui/badge.tsx` | `variant="outline" colorScheme="green"` | Success outline |
| **Outline Yellow Badge** | Transparent, yellow border | `src/components/ui/badge.tsx` | `variant="outline" colorScheme="yellow"` | Warning outline |
| **Outline Red Badge** | Transparent, red border | `src/components/ui/badge.tsx` | `variant="outline" colorScheme="red"` | Error outline |
| **Outline Gray Badge** | Transparent, gray border | `src/components/ui/badge.tsx` | `variant="outline" colorScheme="gray"` | Neutral outline |
| **Subtle Blue Badge** | Light blue bg, blue text | `src/components/ui/badge.tsx` | `variant="subtle" colorScheme="blue"` | Soft emphasis |
| **Subtle Green Badge** | Light green bg, green text | `src/components/ui/badge.tsx` | `variant="subtle" colorScheme="green"` | Soft success |
| **Subtle Yellow Badge** | Light yellow bg, yellow text | `src/components/ui/badge.tsx` | `variant="subtle" colorScheme="yellow"` | Soft warning |
| **Subtle Red Badge** | Light red bg, red text | `src/components/ui/badge.tsx` | `variant="subtle" colorScheme="red"` | Soft error |
| **Subtle Gray Badge** | Light gray bg, gray text | `src/components/ui/badge.tsx` | `variant="subtle" colorScheme="gray"` | Soft neutral |
| **Small Badge** | Compact (10px text) | `src/components/ui/badge.tsx` | `size="sm"` | Compact layouts |
| **Medium Badge** | Default (12px text) | `src/components/ui/badge.tsx` | `size="md"` | Standard usage |
| **Large Badge** | Prominent (14px text) | `src/components/ui/badge.tsx` | `size="lg"` | Emphasis |
| **Rounded Badge** | Pill shape | `src/components/ui/badge.tsx` | `rounded={true}` | Counts, notifications |
| **Square Badge** | 4px corners | `src/components/ui/badge.tsx` | `rounded={false}` | Status labels |

### Tag Component

Tags are similar to badges but support removal:

```tsx
import { Tag } from '@/components/ui/atoms'

<Tag variant="solid" colorScheme="blue" onRemove={() => {}}>
  React
</Tag>
```

### Badge Usage Examples

```tsx
import { Badge } from '@/components/ui/atoms'

// Status badges
<Badge variant="solid" colorScheme="green">Active</Badge>
<Badge variant="solid" colorScheme="yellow">Pending</Badge>
<Badge variant="solid" colorScheme="red">Rejected</Badge>
<Badge variant="solid" colorScheme="gray">Archived</Badge>

// Outline variants
<Badge variant="outline" colorScheme="blue">Draft</Badge>
<Badge variant="outline" colorScheme="green">Verified</Badge>

// Subtle variants
<Badge variant="subtle" colorScheme="blue">Info</Badge>
<Badge variant="subtle" colorScheme="yellow">Warning</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Rounded (for counts)
<Badge rounded colorScheme="red">5</Badge>
<Badge rounded colorScheme="blue">New</Badge>
```

### Lead Status Badge Mapping

Application-specific lead status badges:

| Lead Status | Badge Props | Visual |
|-------------|-------------|--------|
| New | `variant="solid" colorScheme="blue"` | Blue solid |
| Contacted | `variant="solid" colorScheme="yellow"` | Yellow solid |
| Qualified | `variant="solid" colorScheme="green"` | Green solid |
| Proposal Sent | `variant="outline" colorScheme="blue"` | Blue outline |
| Negotiation | `variant="solid" colorScheme="yellow"` | Yellow solid |
| Won | `variant="solid" colorScheme="green"` | Green solid |
| Lost | `variant="solid" colorScheme="red"` | Red solid |
| On Hold | `variant="solid" colorScheme="gray"` | Gray solid |


## 6. Layout Component Mapping

### Penpot Layout Elements → React Components

| Penpot Element | Visual Style | Component Path | React Props | Usage Context |
|----------------|--------------|----------------|-------------|---------------|
| **Card Container** | White bg, border, shadow | `src/components/ui/organisms/Card.tsx` | `<Card>` | Content grouping |
| **Card Header** | Top section with title | `src/components/ui/organisms/Card.tsx` | `title`, `subtitle` | Card title area |
| **Card Content** | Main content area | `src/components/ui/organisms/Card.tsx` | `children` | Card body |
| **Card Actions** | Bottom action area | `src/components/ui/organisms/Card.tsx` | `actions` | Card buttons |
| **Card Grid** | Responsive grid layout | `src/components/ui/organisms/Card.tsx` | `<CardGrid>` | Multiple cards |
| **Modal Overlay** | Dark semi-transparent | `src/components/ui/organisms/Modal.tsx` | Auto-applied | Modal backdrop |
| **Modal Container** | White centered box | `src/components/ui/organisms/Modal.tsx` | `<Modal>` | Dialog content |
| **Modal Header** | Title with close button | `src/components/ui/organisms/Modal.tsx` | `title` | Modal title |
| **Modal Content** | Scrollable content area | `src/components/ui/organisms/Modal.tsx` | `children` | Modal body |
| **Modal Footer** | Action buttons area | `src/components/ui/organisms/Modal.tsx` | `footer` | Modal actions |
| **Separator/Divider** | Horizontal line | `src/components/ui/separator.tsx` | `<Separator>` | Section divider |
| **Skeleton Loader** | Animated placeholder | `src/components/ui/skeleton.tsx` | `<Skeleton>` | Loading state |

### Card Component Usage

```tsx
import { Card, CardGrid } from '@/components/ui/organisms'
import { Button } from '@/components/ui/atoms'

// Single card
<Card
  title="Lead Details"
  subtitle="Contact information and status"
  actions={
    <>
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Save</Button>
    </>
  }
>
  <p>Card content goes here</p>
</Card>

// Card grid (responsive)
<CardGrid columns={3}>
  <Card title="Card 1">Content 1</Card>
  <Card title="Card 2">Content 2</Card>
  <Card title="Card 3">Content 3</Card>
</CardGrid>
```

### Modal Component Usage

```tsx
import { Modal } from '@/components/ui/organisms'
import { Button } from '@/components/ui/atoms'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### Modal Size Mapping

| Penpot Modal Size | Width | React Props | Usage |
|-------------------|-------|-------------|-------|
| Small | 400px | `size="sm"` | Confirmations, alerts |
| Medium | 600px | `size="md"` | Forms, details |
| Large | 800px | `size="lg"` | Complex forms, data |
| Extra Large | 1000px | `size="xl"` | Full content |
| Full Screen | 100vw | `size="full"` | Immersive experience |


## 7. Data Display Component Mapping

### Penpot Data Components → React Components

| Penpot Component | Visual Style | Component Path | React Props | Usage Context |
|------------------|--------------|----------------|-------------|---------------|
| **Data Table** | Bordered table with header | `src/components/ui/organisms/DataTable.tsx` | `<DataTable>` | Tabular data |
| **Table Header** | Bold text, sortable | `src/components/ui/organisms/DataTable.tsx` | `columns` prop | Column headers |
| **Table Row** | Alternating bg on hover | `src/components/ui/organisms/DataTable.tsx` | `data` prop | Data rows |
| **Table Cell** | Padded content | `src/components/ui/organisms/DataTable.tsx` | Auto-rendered | Cell content |
| **Sortable Column** | Header with sort icon | `src/components/ui/organisms/DataTable.tsx` | `sortable: true` | Sortable data |
| **Table Pagination** | Bottom navigation | `src/components/ui/organisms/DataTable.tsx` | `pagination` prop | Page controls |
| **Empty State** | Centered message | `src/components/ui/organisms/DataTable.tsx` | `emptyState` prop | No data |
| **Loading State** | Skeleton rows | `src/components/ui/organisms/DataTable.tsx` | `loading={true}` | Data loading |
| **Progress Bar** | Filled bar with label | `src/components/ui/molecules/ProgressBar.tsx` | `<ProgressBar>` | Progress indicator |
| **Avatar** | Circular image/initials | `src/components/ui/avatar.tsx` | `<Avatar>` | User representation |
| **Tooltip** | Hover popup | `src/components/ui/tooltip.tsx` | `<Tooltip>` | Additional info |

### DataTable Component Usage

```tsx
import { DataTable } from '@/components/ui/organisms'
import { Badge } from '@/components/ui/atoms'

const columns = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => (
      <Badge variant="solid" colorScheme={getStatusColor(value)}>
        {value}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (_, row) => (
      <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
        Edit
      </Button>
    ),
  },
]

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Pending' },
]

<DataTable
  columns={columns}
  data={data}
  sortable={true}
  pagination={{
    currentPage: 1,
    totalPages: 5,
    pageSize: 10,
  }}
  onRowClick={(row) => console.log('Clicked:', row)}
  loading={false}
  emptyState={<p>No data available</p>}
/>
```

### Progress Bar Usage

```tsx
import { ProgressBar } from '@/components/ui/molecules'

<ProgressBar
  value={75}
  max={100}
  label="Installation Progress"
  showPercentage={true}
  colorScheme="blue"
/>
```

### Avatar Usage

```tsx
import { Avatar } from '@/components/ui/atoms'

// With image
<Avatar src="/user.jpg" alt="John Doe" size="md" />

// With initials
<Avatar fallback="JD" size="md" />

// Sizes
<Avatar fallback="JD" size="sm" />  // 32px
<Avatar fallback="JD" size="md" />  // 40px
<Avatar fallback="JD" size="lg" />  // 48px
```


## 8. Navigation Component Mapping

### Penpot Navigation Elements → React Components

| Penpot Component | Visual Style | Component Path | React Props | Usage Context |
|------------------|--------------|----------------|-------------|---------------|
| **Header/Navbar** | Top bar with logo, nav, actions | `src/components/ui/organisms/Header.tsx` | `<Header>` | Main navigation |
| **Logo Area** | Left-aligned branding | `src/components/ui/organisms/Header.tsx` | `logo` prop | Brand identity |
| **Nav Menu** | Horizontal menu items | `src/components/ui/organisms/Header.tsx` | `navigation` prop | Main links |
| **Nav Item (Active)** | Blue text/underline | `src/components/ui/organisms/Header.tsx` | `active: true` | Current page |
| **Nav Item (Inactive)** | Gray text | `src/components/ui/organisms/Header.tsx` | `active: false` | Other pages |
| **Search Bar** | Input with search icon | `src/components/ui/molecules/SearchBar.tsx` | `<SearchBar>` | Global search |
| **User Menu** | Avatar with dropdown | `src/components/ui/organisms/Header.tsx` | `userMenu` prop | User actions |
| **Notification Bell** | Icon with badge count | `src/components/ui/organisms/Header.tsx` | `notifications` prop | Alerts |
| **Breadcrumbs** | Path navigation | `src/components/ui/breadcrumb.tsx` | `<Breadcrumb>` | Page hierarchy |
| **Tabs** | Horizontal tab buttons | `src/components/ui/molecules/TabGroup.tsx` | `<TabGroup>` | Content sections |
| **Tab (Active)** | Blue underline | `src/components/ui/molecules/TabGroup.tsx` | Active tab | Current section |
| **Tab (Inactive)** | Gray text | `src/components/ui/molecules/TabGroup.tsx` | Inactive tab | Other sections |
| **Pagination** | Page number controls | `src/components/ui/molecules/Pagination.tsx` | `<Pagination>` | Page navigation |
| **Dropdown Menu** | Popup menu | `src/components/ui/dropdown-menu.tsx` | `<DropdownMenu>` | Action menu |

### Header Component Usage

```tsx
import { Header } from '@/components/ui/organisms'

<Header
  logo={<img src="/logo.png" alt="YAS Natural" />}
  navigation={[
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Leads', href: '/leads', active: false, badge: 5 },
    { label: 'Documents', href: '/documents', active: false },
    { label: 'Reports', href: '/reports', active: false },
  ]}
  searchEnabled={true}
  userMenu={{
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatar.jpg',
    items: [
      { label: 'Profile', href: '/profile' },
      { label: 'Settings', href: '/settings' },
      { label: 'Logout', onClick: handleLogout },
    ],
  }}
  notifications={{
    count: 3,
    items: [
      { title: 'New lead assigned', time: '5 min ago' },
      { title: 'Document uploaded', time: '1 hour ago' },
    ],
  }}
/>
```

### SearchBar Component Usage

```tsx
import { SearchBar } from '@/components/ui/molecules'

<SearchBar
  placeholder="Search leads..."
  value={searchQuery}
  onChange={setSearchQuery}
  onClear={() => setSearchQuery('')}
  onSearch={handleSearch}
  loading={isSearching}
/>
```

### TabGroup Component Usage

```tsx
import { TabGroup } from '@/components/ui/molecules'

<TabGroup
  tabs={[
    { id: 'details', label: 'Details', content: <DetailsPanel /> },
    { id: 'documents', label: 'Documents', content: <DocumentsPanel /> },
    { id: 'history', label: 'History', content: <HistoryPanel /> },
  ]}
  defaultTab="details"
  onChange={(tabId) => console.log('Tab changed:', tabId)}
/>
```

### Pagination Component Usage

```tsx
import { Pagination } from '@/components/ui/molecules'

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  variant="primary"
  showFirstLast={true}
/>
```

### Breadcrumb Usage

```tsx
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb'

<Breadcrumb>
  <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
  <BreadcrumbItem href="/leads">Leads</BreadcrumbItem>
  <BreadcrumbItem>Lead Details</BreadcrumbItem>
</Breadcrumb>
```


## 9. Modal and Dialog Mapping

### Penpot Dialog Variants → React Components

| Penpot Dialog | Visual Style | Component Path | React Props | Usage Context |
|---------------|--------------|----------------|-------------|---------------|
| **Confirmation Dialog** | Small modal with actions | `src/components/ui/confirm-dialog.tsx` | `<ConfirmDialog>` | Yes/No confirmations |
| **Alert Dialog** | Modal with single action | `src/components/ui/alert-dialog.tsx` | `<AlertDialog>` | Alerts, warnings |
| **Delete Confirmation** | Red-themed confirm dialog | `src/components/ui/delete-confirm-dialog.tsx` | `<DeleteConfirmDialog>` | Destructive actions |
| **Form Dialog** | Modal with form content | `src/components/ui/organisms/Modal.tsx` | `<Modal>` with form | Data entry |
| **Full Screen Dialog** | Full viewport modal | `src/components/ui/organisms/Modal.tsx` | `size="full"` | Immersive content |
| **Sheet/Drawer** | Side panel | `src/components/ui/sheet.tsx` | `<Sheet>` | Side navigation, filters |
| **Popover** | Small floating panel | `src/components/ui/popover.tsx` | `<Popover>` | Contextual info |
| **Tooltip** | Hover text | `src/components/ui/tooltip.tsx` | `<Tooltip>` | Help text |

### Dialog Usage Examples

```tsx
import { ConfirmDialog, DeleteConfirmDialog } from '@/components/ui'
import { Modal } from '@/components/ui/organisms'

// Confirmation dialog
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  confirmText="Yes, proceed"
  cancelText="Cancel"
/>

// Delete confirmation
<DeleteConfirmDialog
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  onConfirm={handleDelete}
  title="Delete Lead"
  description="This action cannot be undone."
  itemName="Lead #12345"
/>

// Custom modal
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Edit Lead"
  size="lg"
>
  <form onSubmit={handleSubmit}>
    {/* Form content */}
  </form>
</Modal>
```


## 10. Spacing and Layout Tokens

### Penpot Spacing Scale → CSS Values

| Penpot Spacing | Pixel Value | Token Path | Usage Context | CSS Class |
|----------------|-------------|------------|---------------|-----------|
| **1 unit** | 4px | `penpotSpacing[1]` | Minimal spacing, tight layouts | `gap-1`, `p-1`, `m-1` |
| **2 units** | 8px | `penpotSpacing[2]` | Small spacing, compact elements | `gap-2`, `p-2`, `m-2` |
| **3 units** | 12px | `penpotSpacing[3]` | Default spacing, form fields | `gap-3`, `p-3`, `m-3` |
| **4 units** | 16px | `penpotSpacing[4]` | Standard spacing, cards | `gap-4`, `p-4`, `m-4` |
| **5 units** | 20px | `penpotSpacing[5]` | Medium spacing, sections | `gap-5`, `p-5`, `m-5` |
| **6 units** | 24px | `penpotSpacing[6]` | Large spacing, page sections | `gap-6`, `p-6`, `m-6` |
| **8 units** | 32px | `penpotSpacing[8]` | Extra large spacing | `gap-8`, `p-8`, `m-8` |
| **10 units** | 40px | `penpotSpacing[10]` | Section dividers | `gap-10`, `p-10`, `m-10` |
| **12 units** | 48px | `penpotSpacing[12]` | Major sections | `gap-12`, `p-12`, `m-12` |
| **16 units** | 64px | `penpotSpacing[16]` | Page-level spacing | `gap-16`, `p-16`, `m-16` |

### Spacing Usage Guidelines

**Component Internal Spacing:**
- Button padding: 12px horizontal, 8px vertical (3 units x 2 units)
- Input padding: 12px horizontal, 8px vertical (3 units x 2 units)
- Card padding: 24px (6 units)
- Modal padding: 24px (6 units)

**Component Gaps:**
- Form field gap: 16px (4 units)
- Button group gap: 8px (2 units)
- Card grid gap: 24px (6 units)
- List item gap: 12px (3 units)

**Page Layout:**
- Page padding: 24px mobile, 32px desktop (6-8 units)
- Section spacing: 48px (12 units)
- Content max-width: 1200px

### Border Radius Tokens

| Penpot Radius | Pixel Value | Token Path | Usage Context |
|---------------|-------------|------------|---------------|
| **None** | 0px | `penpotRadii.none` | Sharp corners |
| **Small** | 4px | `penpotRadii.sm` | Badges, small elements |
| **Medium** | 8px | `penpotRadii.md` | Buttons, inputs, cards |
| **Large** | 12px | `penpotRadii.lg` | Modals, large cards |
| **Full** | 9999px | `penpotRadii.full` | Pills, avatars, rounded badges |

### Shadow Tokens

| Penpot Shadow | CSS Value | Token Path | Usage Context |
|---------------|-----------|------------|---------------|
| **None** | none | `penpotShadows.none` | Flat elements |
| **Small** | 0 1px 2px rgba(0,0,0,0.05) | `penpotShadows.sm` | Subtle elevation |
| **Medium** | 0 4px 6px rgba(0,0,0,0.07) | `penpotShadows.md` | Cards, dropdowns |
| **Large** | 0 10px 15px rgba(0,0,0,0.1) | `penpotShadows.lg` | Modals, popovers |
| **Extra Large** | 0 20px 25px rgba(0,0,0,0.15) | `penpotShadows.xl` | Floating elements |


## 11. Component Hierarchy and Composition

### Atomic Design Structure

```
Atoms (Basic building blocks)
├── Button
├── Input
├── Checkbox
├── Radio
├── Switch
├── Badge
├── Tag
├── Typography (H1-H5, Body, Small, Label)
└── Avatar

Molecules (Composed from atoms)
├── FormField (Label + Input + Error)
├── SearchBar (Input + Icon + Clear button)
├── Pagination (Buttons + Page indicators)
├── ProgressBar (Bar + Label + Percentage)
└── TabGroup (Tab buttons + Content panels)

Organisms (Complex components)
├── Header (Logo + Navigation + Search + User menu)
├── DataTable (Headers + Rows + Sorting + Pagination)
├── Modal (Overlay + Header + Content + Footer)
├── Card (Header + Content + Actions)
└── FormSection (Title + Description + Multiple FormFields)

Templates (Page layouts)
├── DashboardLayout
├── FormLayout
├── DetailLayout
└── ListLayout
```

### Component Composition Examples

**FormField Molecule Composition:**
```
FormField
├── LabelText (atom)
├── Input (atom)
└── Small (atom) - for error/help text
```

**Card Organism Composition:**
```
Card
├── H3 (atom) - title
├── Small (atom) - subtitle
├── Content area (children)
└── Button group (atoms) - actions
```

**DataTable Organism Composition:**
```
DataTable
├── Table headers (Typography atoms)
├── Table rows (data)
├── Badge (atom) - for status columns
├── Button (atom) - for action columns
└── Pagination (molecule)
```

**Header Organism Composition:**
```
Header
├── Logo (image/component)
├── Navigation items (Typography + Badge atoms)
├── SearchBar (molecule)
├── Avatar (atom)
└── DropdownMenu (for user menu)
```


## 12. Application-Specific Component Mapping

### YAS Natural Solar CRM Components

This section maps application-specific components to Penpot design elements.

#### Lead Management Components

| Application Component | Penpot Elements Used | Implementation Path |
|----------------------|---------------------|---------------------|
| **LeadList** | DataTable + Badge + Button | `src/components/leads/LeadList.tsx` |
| **LeadDetail** | Card + FormSection + Badge | `src/components/leads/LeadDetail.tsx` |
| **LeadForm** | FormSection + FormField + Input | `src/components/leads/LeadForm.tsx` |
| **LeadStatusBadge** | Badge (color-coded) | `src/components/leads/LeadStatusBadge.tsx` |
| **QuickStatusUpdate** | Dropdown + Badge | `src/components/leads/QuickStatusUpdate.tsx` |
| **FilterPanel** | Card + Checkbox + Select | `src/components/leads/FilterPanel.tsx` |
| **SearchBar** | SearchBar molecule | `src/components/leads/SearchBar.tsx` |

#### Dashboard Components

| Application Component | Penpot Elements Used | Implementation Path |
|----------------------|---------------------|---------------------|
| **DashboardLayout** | Header + Card Grid | `src/app/(protected)/*/dashboard/page.tsx` |
| **MetricCard** | Card + Typography + Badge | Dashboard pages |
| **ActivityFeed** | Card + List + Avatar + Small | Dashboard pages |
| **ChartCard** | Card + Typography | Dashboard pages |

#### Document Management Components

| Application Component | Penpot Elements Used | Implementation Path |
|----------------------|---------------------|---------------------|
| **DocumentList** | DataTable + Badge + Button | `src/components/documents/DocumentList.tsx` |
| **DocumentUploader** | Card + Input + ProgressBar | `src/components/documents/DocumentUploader.tsx` |
| **DocumentViewer** | Modal + Typography | `src/components/documents/DocumentViewer.tsx` |
| **DocumentStatusBadge** | Badge (color-coded) | `src/components/documents/DocumentStatusBadge.tsx` |

#### Form Components

| Application Component | Penpot Elements Used | Implementation Path |
|----------------------|---------------------|---------------------|
| **BankLetterForm** | FormSection + FormField + Input | `src/components/forms/BankLetterForm.tsx` |
| **PPAForm** | FormSection + FormField + Input | `src/components/forms/PPAForm.tsx` |
| **QuotationForm** | FormSection + FormField + Input | `src/components/forms/QuotationForm.tsx` |
| **CustomerProfileForm** | FormSection + FormField + Input | `src/components/customers/CustomerProfileForm.tsx` |

#### Timeline Components

| Application Component | Penpot Elements Used | Implementation Path |
|----------------------|---------------------|---------------------|
| **Timeline** | Card + Badge + Typography | `src/components/timeline/Timeline.tsx` |
| **TimelineStep** | Badge + Typography + Button | `src/components/timeline/TimelineStep.tsx` |
| **StepCompletionModal** | Modal + FormSection | `src/components/timeline/StepCompletionModal.tsx` |


## 13. Migration Guide

### Refactoring Existing Components to Use Penpot Design System

This guide provides step-by-step instructions for refactoring existing components to use the Penpot design system.

#### Step 1: Identify Component Type

Determine if the component is:
- **Atom**: Basic UI element (button, input, badge)
- **Molecule**: Composition of atoms (form field, search bar)
- **Organism**: Complex section (header, table, modal)
- **Page**: Full page layout

#### Step 2: Replace Inline Styles

**Before:**
```tsx
<button
  style={{
    backgroundColor: '#5E81F4',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
  }}
>
  Click me
</button>
```

**After:**
```tsx
import { Button } from '@/components/ui/atoms'

<Button variant="primary" size="md">
  Click me
</Button>
```

#### Step 3: Replace Color Values

**Before:**
```tsx
<div className="bg-blue-500 text-white">
  Content
</div>
```

**After:**
```tsx
<div className="bg-[var(--penpot-primary)] text-white">
  Content
</div>
```

Or use the component:
```tsx
import { Card } from '@/components/ui/organisms'

<Card>
  Content
</Card>
```

#### Step 4: Replace Typography

**Before:**
```tsx
<h1 className="text-3xl font-bold">
  Page Title
</h1>
<p className="text-sm text-gray-600">
  Description text
</p>
```

**After:**
```tsx
import { H1, Body } from '@/components/ui/atoms'

<H1>Page Title</H1>
<Body color="secondary">Description text</Body>
```

#### Step 5: Replace Form Elements

**Before:**
```tsx
<div>
  <label>Email</label>
  <input type="email" placeholder="Enter email" />
  <span className="text-red-500">Error message</span>
</div>
```

**After:**
```tsx
import { FormField } from '@/components/ui/molecules'
import { Input } from '@/components/ui/atoms'

<FormField
  label="Email"
  error="Error message"
>
  <Input type="email" placeholder="Enter email" state="error" />
</FormField>
```

#### Step 6: Replace Status Badges

**Before:**
```tsx
<span className="px-2 py-1 bg-green-100 text-green-800 rounded">
  Active
</span>
```

**After:**
```tsx
import { Badge } from '@/components/ui/atoms'

<Badge variant="subtle" colorScheme="green">
  Active
</Badge>
```

#### Step 7: Consolidate Duplicate Components

If you find multiple implementations of the same pattern:

1. Identify the canonical Penpot component
2. Update all usage sites to reference the canonical component
3. Remove duplicate implementations
4. Verify no broken imports

**Example:**
```tsx
// Remove these duplicates:
// src/components/CustomButton.tsx
// src/components/PrimaryButton.tsx
// src/components/ActionButton.tsx

// Use this instead:
import { Button } from '@/components/ui/atoms'
```


## 14. Validation Checklist

Use this checklist to ensure components are correctly mapped to the Penpot design system.

### Design Token Validation

- [ ] All colors use exact Penpot hex values from `penpotColors`
- [ ] All typography uses Penpot font sizes, weights, and line heights
- [ ] All spacing uses values from `penpotSpacing` scale (4px base unit)
- [ ] All border radii use values from `penpotRadii` (4px, 8px, 12px, 9999px)
- [ ] All shadows use values from `penpotShadows`

### Component Validation

- [ ] Component uses correct variant prop names
- [ ] Component supports all required states (default, hover, active, disabled)
- [ ] Component uses TypeScript interfaces for type safety
- [ ] Component follows atomic design hierarchy (atoms < molecules < organisms)
- [ ] Component has proper accessibility attributes (ARIA labels, roles)

### Visual Validation

- [ ] Component matches Penpot design pixel-perfect (±1px tolerance)
- [ ] Colors match exactly (no approximations)
- [ ] Typography matches (font family, size, weight, line height)
- [ ] Spacing matches Penpot specifications
- [ ] Hover and active states match Penpot interactions

### Code Quality Validation

- [ ] No inline styles (use design tokens or Tailwind classes)
- [ ] No hardcoded colors (use CSS variables or tokens)
- [ ] No duplicate component implementations
- [ ] Component is properly documented with JSDoc comments
- [ ] Component has usage examples

### Accessibility Validation

- [ ] Color contrast meets WCAG AA standards (4.5:1 for text, 3:1 for large text)
- [ ] Interactive elements have proper focus indicators
- [ ] Form elements have associated labels
- [ ] Modals trap focus and support escape key
- [ ] Keyboard navigation works correctly


## 15. Quick Reference Tables

### Component Import Paths

| Component | Import Statement |
|-----------|------------------|
| Button | `import { Button } from '@/components/ui/atoms'` |
| Input | `import { Input } from '@/components/ui/atoms'` |
| Badge | `import { Badge } from '@/components/ui/atoms'` |
| Typography | `import { H1, Body, Small } from '@/components/ui/atoms'` |
| FormField | `import { FormField } from '@/components/ui/molecules'` |
| SearchBar | `import { SearchBar } from '@/components/ui/molecules'` |
| Pagination | `import { Pagination } from '@/components/ui/molecules'` |
| Header | `import { Header } from '@/components/ui/organisms'` |
| DataTable | `import { DataTable } from '@/components/ui/organisms'` |
| Modal | `import { Modal } from '@/components/ui/organisms'` |
| Card | `import { Card } from '@/components/ui/organisms'` |

### Color Quick Reference

| Usage | Color Token | Hex Value |
|-------|-------------|-----------|
| Primary action | `penpotColors.primary.main` | `#5E81F4` |
| Success | `penpotColors.success.main` | `#7CE7AC` |
| Warning | `penpotColors.warning.main` | `#F4BE5E` |
| Error | `penpotColors.error.main` | `#FF808B` |
| Info | `penpotColors.info.main` | `#40E1FA` |
| Dark text | `penpotColors.neutral.darkText` | `#1C1D21` |
| Secondary text | `penpotColors.neutral.secondaryText` | `#8181A5` |
| Border | `penpotColors.border.light` | `#ECECF2` |

### Spacing Quick Reference

| Spacing | Value | Usage |
|---------|-------|-------|
| 1 | 4px | Minimal spacing |
| 2 | 8px | Small spacing |
| 3 | 12px | Default spacing |
| 4 | 16px | Standard spacing |
| 6 | 24px | Large spacing |
| 8 | 32px | Extra large spacing |
| 12 | 48px | Section spacing |

### Typography Quick Reference

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 32px | 700 | Page titles |
| H2 | 26px | 700 | Section titles |
| H3 | 20px | 700 | Subsection titles |
| Body | 14px | 400 | Default text |
| Small | 12px | 400 | Captions, metadata |
| Label | 14px | 700 | Form labels |

---

## Summary

This mapping document provides a comprehensive reference for implementing the Penpot design system in the YAS Natural Solar CRM application. It covers:

- **15 unique colors** mapped to usage contexts
- **25 typography styles** mapped to semantic usage
- **170+ Penpot components** mapped to React implementations
- **Atomic design hierarchy** (atoms, molecules, organisms)
- **Application-specific components** mapped to Penpot elements
- **Migration guide** for refactoring existing components
- **Validation checklist** for ensuring design system compliance

**Key Principles:**
1. Use exact Penpot color values (no approximations)
2. Follow atomic design hierarchy
3. Use design tokens instead of hardcoded values
4. Eliminate duplicate component implementations
5. Maintain accessibility standards (WCAG AA)

**Next Steps:**
1. Use this document as reference during page refactoring
2. Validate all components against the checklist
3. Update components that don't match Penpot specifications
4. Remove duplicate implementations
5. Document any deviations from Penpot design

---

**Document Version:** 1.0  
**Last Updated:** December 9, 2024  
**Maintained By:** Development Team  
**Related Documents:**
- `.kiro/specs/penpot-ui-modernization/requirements.md`
- `.kiro/specs/penpot-ui-modernization/design.md`
- `.kiro/specs/penpot-ui-modernization/tasks.md`


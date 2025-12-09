# Penpot Design Token System

This document describes the design token system extracted from the Penpot design specifications for the YAS Natural Solar CRM application.

## Overview

The design token system provides a centralized, type-safe way to access design values throughout the application. All tokens are exact matches to the Penpot design specifications to ensure pixel-perfect accuracy.

## Color Tokens

### Primary Colors
- **Primary Main**: `#5E81F4` - Brand blue for primary actions
- **Primary Light**: `#9698D6` - Lighter variant for hover states
- **Primary Dark**: `#4D4CAC` - Darker variant for active states

### State Colors
- **Success**: `#7CE7AC` - Green for positive states and success messages
- **Warning**: `#F4BE5E` - Yellow for caution states and warnings
- **Error**: `#FF808B` - Red for error states and destructive actions
- **Info Main**: `#40E1FA` - Cyan for informational states
- **Info Light**: `#2CE5F6` - Lighter cyan variant

### Neutral Colors
- **Dark Text**: `#1C1D21` - Primary text color
- **Secondary Text**: `#8181A5` - Secondary/muted text color

### Background Colors
- **White**: `#FFFFFF` - Primary background
- **Gray 50**: `#F6F6F6` - Lightest gray background
- **Gray 100**: `#F5F5FA` - Light gray background
- **Gray 200**: `#F0F0F3` - Medium gray background

### Border Colors
- **Light**: `#ECECF2` - Light borders for subtle separation

## Typography Tokens

### Font Family
- **Primary**: `Lato, sans-serif` - Main font for all text
- **Icon Solid**: `la-solid-900` - Solid icon font
- **Icon Regular**: `la-regular-400` - Regular icon font
- **Icon Brands**: `la-brands-400` - Brand icon font

### Headings
| Level | Font Size | Font Weight | Line Height |
|-------|-----------|-------------|-------------|
| H1    | 32px      | 700 (Bold)  | 1.2         |
| H2    | 26px      | 700 (Bold)  | 1.2         |
| H3    | 20px      | 700 (Bold)  | 1.3         |
| H4    | 18px      | 700 (Bold)  | 1.3         |
| H5    | 16px      | 700 (Bold)  | 1.4         |

### Body Text
| Style      | Font Size | Font Weight | Line Height |
|------------|-----------|-------------|-------------|
| Regular    | 14px      | 400         | 1.5         |
| Bold       | 14px      | 700         | 1.5         |
| Small      | 12px      | 400         | 1.5         |
| Small Bold | 12px      | 700         | 1.5         |
| Light      | 14px      | 300         | 1.5         |

### Labels
| Style   | Font Size | Font Weight | Line Height |
|---------|-----------|-------------|-------------|
| Regular | 14px      | 700         | 1.4         |
| Small   | 12px      | 700         | 1.4         |

## Spacing Tokens

Base unit: **4px**

| Scale | Value |
|-------|-------|
| 1     | 4px   |
| 2     | 8px   |
| 3     | 12px  |
| 4     | 16px  |
| 5     | 20px  |
| 6     | 24px  |
| 8     | 32px  |
| 10    | 40px  |
| 12    | 48px  |
| 16    | 64px  |

## Shadow Tokens

| Size | Value                              | Use Case                    |
|------|------------------------------------|-----------------------------|
| sm   | `0 1px 2px rgba(0, 0, 0, 0.05)`   | Subtle elevation            |
| md   | `0 4px 6px rgba(0, 0, 0, 0.07)`   | Cards, dropdowns            |
| lg   | `0 10px 15px rgba(0, 0, 0, 0.1)`  | Modals, popovers            |
| xl   | `0 20px 25px rgba(0, 0, 0, 0.15)` | Large modals, overlays      |

## Border Radius Tokens

| Size | Value  | Use Case                    |
|------|--------|-----------------------------|
| sm   | 4px    | Small elements, badges      |
| md   | 8px    | Buttons, inputs, cards      |
| lg   | 12px   | Large cards, containers     |
| full | 9999px | Circular elements, pills    |

## Usage Examples

### Accessing Colors

```typescript
import { getPenpotColor, penpotColors } from '@/lib/design-system';

// Using utility function
const primaryColor = getPenpotColor('primary', 'main'); // '#5E81F4'
const successColor = getPenpotColor('success', 'main'); // '#7CE7AC'

// Direct access
const errorColor = penpotColors.error.main; // '#FF808B'
```

### Accessing Typography

```typescript
import { getPenpotTypography, penpotTypography } from '@/lib/design-system';

// Using utility function
const h1Style = getPenpotTypography('heading', 'h1');
// Returns: { fontSize: '32px', fontWeight: 700, lineHeight: 1.2 }

const bodyStyle = getPenpotTypography('body', 'regular');
// Returns: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5 }

// Direct access
const h2 = penpotTypography.headings.h2;
```

### Accessing Spacing

```typescript
import { getPenpotSpacing, penpotSpacing } from '@/lib/design-system';

// Using utility function
const spacing = getPenpotSpacing(4); // '16px'
const largeSpacing = getPenpotSpacing(8); // '32px'

// Direct access
const smallSpacing = penpotSpacing[2]; // '8px'
```

### Accessing Shadows and Radii

```typescript
import { getPenpotShadow, getPenpotRadius } from '@/lib/design-system';

// Shadows
const cardShadow = getPenpotShadow('md'); // '0 4px 6px rgba(0, 0, 0, 0.07)'

// Border radius
const buttonRadius = getPenpotRadius('md'); // '8px'
const pillRadius = getPenpotRadius('full'); // '9999px'
```

### Validation Functions

```typescript
import { isValidPenpotColor, isValidPenpotSpacing } from '@/lib/design-system';

// Validate colors
const isValid = isValidPenpotColor('#5E81F4'); // true
const isInvalid = isValidPenpotColor('#123456'); // false

// Validate spacing
const validSpacing = isValidPenpotSpacing('16px'); // true
const invalidSpacing = isValidPenpotSpacing('15px'); // false
```

## Component Usage

### Button Component Example

```typescript
import { getPenpotColor, getPenpotRadius, getPenpotSpacing } from '@/lib/design-system';

const buttonStyles = {
  backgroundColor: getPenpotColor('primary', 'main'),
  borderRadius: getPenpotRadius('md'),
  padding: `${getPenpotSpacing(2)} ${getPenpotSpacing(4)}`,
};
```

### Card Component Example

```typescript
import { 
  getPenpotColor, 
  getPenpotRadius, 
  getPenpotShadow,
  getPenpotSpacing 
} from '@/lib/design-system';

const cardStyles = {
  backgroundColor: getPenpotColor('background', 'white'),
  borderRadius: getPenpotRadius('lg'),
  boxShadow: getPenpotShadow('md'),
  padding: getPenpotSpacing(6),
};
```

### Typography Component Example

```typescript
import { getPenpotTypography, getPenpotColor } from '@/lib/design-system';

const h1Style = getPenpotTypography('heading', 'h1');

const HeadingStyles = {
  fontSize: h1Style.fontSize,
  fontWeight: h1Style.fontWeight,
  lineHeight: h1Style.lineHeight,
  color: getPenpotColor('neutral', 'darkText'),
};
```

## Best Practices

1. **Always use tokens**: Never hardcode color, spacing, or typography values. Always use the token system.

2. **Use utility functions**: Prefer utility functions like `getPenpotColor()` over direct access for better type safety.

3. **Validate values**: Use validation functions when accepting dynamic values to ensure they match the design system.

4. **Maintain consistency**: Use the same token for the same purpose across the application.

5. **Document deviations**: If you must deviate from the design system, document why and get approval.

## Migration from Legacy Tokens

The system maintains backward compatibility with legacy tokens. To migrate:

1. Replace `colorTokens` with `penpotColors`
2. Replace `typographyTokens` with `penpotTypography`
3. Replace `spacingTokens` with `penpotSpacing`
4. Replace `shadowTokens` with `penpotShadows`
5. Replace `radiusTokens` with `penpotRadii`

Example migration:

```typescript
// Before
import { colorTokens } from '@/lib/design-system';
const color = colorTokens.primary;

// After
import { getPenpotColor } from '@/lib/design-system';
const color = getPenpotColor('primary', 'main');
```

## References

- Design Specification: `.kiro/specs/penpot-ui-modernization/design.md`
- Requirements: `.kiro/specs/penpot-ui-modernization/requirements.md`
- Implementation: `src/lib/design-system/tokens.ts`

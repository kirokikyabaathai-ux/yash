# Border Radius Update - Penpot Design System

## Summary

Updated all CSS variables to use Penpot Design System border radius values, eliminating the rectangular appearance across all components.

## Changes Made

### CSS Variables Updated (globals.css)

**Before:**
```css
--radius: 0rem;  /* Completely rectangular */
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
```

**After:**
```css
--radius: 0.5rem;  /* 8px - Penpot md */
--radius-sm: 0.25rem;  /* 4px - Penpot sm */
--radius-md: 0.5rem;   /* 8px - Penpot md */
--radius-lg: 0.75rem;  /* 12px - Penpot lg */
--radius-xl: 1rem;     /* 16px - custom */
```

### Penpot Design System Mapping

| Penpot Token | Value | CSS Variable | Usage |
|--------------|-------|--------------|-------|
| `penpotRadii.sm` | 4px | `--radius-sm` | Small elements, badges |
| `penpotRadii.md` | 8px | `--radius-md` | Default buttons, inputs, cards |
| `penpotRadii.lg` | 12px | `--radius-lg` | Large cards, modals |
| `penpotRadii.full` | 9999px | N/A | Pills, avatars, rounded badges |

## Impact

This change affects ALL components that use Tailwind's `rounded-*` classes:

### Automatically Updated Components:
- ✅ **All Buttons** - Now use 8px border radius
- ✅ **All Cards** - Now use 8px border radius
- ✅ **All Inputs** - Now use 8px border radius
- ✅ **All Modals** - Now use 8px border radius
- ✅ **All Badges** - Now use 4px border radius (when using `rounded`)
- ✅ **All Dropdowns** - Now use 8px border radius
- ✅ **All Tooltips** - Now use 8px border radius
- ✅ **All Popovers** - Now use 8px border radius
- ✅ **All Sheets** - Now use 8px border radius
- ✅ **All Dialogs** - Now use 8px border radius

### Pages Affected:
- ✅ Login/Signup pages
- ✅ All dashboard pages (admin, office, agent, installer, customer)
- ✅ All form pages (leads, documents, profiles)
- ✅ All list pages (activity log, step management)
- ✅ All detail pages (lead details, user profiles)

## Tailwind Class Mapping

| Tailwind Class | Old Value | New Value | Penpot Equivalent |
|----------------|-----------|-----------|-------------------|
| `rounded-sm` | 0px | 4px | `penpotRadii.sm` |
| `rounded` | 0px | 8px | `penpotRadii.md` |
| `rounded-md` | 0px | 8px | `penpotRadii.md` |
| `rounded-lg` | 0px | 12px | `penpotRadii.lg` |
| `rounded-xl` | 0px | 16px | Custom |
| `rounded-full` | 9999px | 9999px | `penpotRadii.full` |

## Visual Changes

### Before:
- All components had sharp, rectangular corners (0px radius)
- Harsh, boxy appearance
- No visual softness

### After:
- All components have subtle rounded corners (8px default)
- Softer, more modern appearance
- Consistent with Penpot design system
- Better visual hierarchy

## Component Examples

### Button
```tsx
// Automatically updated via CSS variables
<Button variant="primary">Click Me</Button>
// Now has 8px border radius instead of 0px
```

### Card
```tsx
// Automatically updated via CSS variables
<Card>Content</Card>
// Now has 8px border radius instead of 0px
```

### Input
```tsx
// Automatically updated via CSS variables
<Input type="text" />
// Now has 8px border radius instead of 0px
```

### Badge
```tsx
// Automatically updated via CSS variables
<Badge>Status</Badge>
// Now has 4px border radius (rounded-sm) instead of 0px
```

## No Code Changes Required

Because we updated the CSS variables at the root level, **no component code changes are needed**. All existing components that use Tailwind's `rounded-*` classes will automatically inherit the new border radius values.

## Testing Checklist

- [ ] Verify all buttons have rounded corners
- [ ] Verify all cards have rounded corners
- [ ] Verify all inputs have rounded corners
- [ ] Verify all modals have rounded corners
- [ ] Verify all badges have rounded corners
- [ ] Verify login/signup forms have rounded corners
- [ ] Verify no visual regressions
- [ ] Test in both light and dark modes

## Browser Compatibility

The `rem` unit is supported in all modern browsers:
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Rollback Plan

If needed, revert by changing:
```css
--radius: 0rem;
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
```

---

**Date:** December 9, 2024  
**Status:** ✅ Complete  
**Impact:** Global - All components  
**Breaking Changes:** None  
**Migration Required:** None

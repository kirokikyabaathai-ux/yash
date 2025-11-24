# Accessibility Guidelines for Solar CRM

This document outlines the accessibility features and best practices implemented in the Solar CRM application.

## WCAG 2.1 Level AA Compliance

The application aims to meet WCAG 2.1 Level AA standards for accessibility.

## Key Accessibility Features

### 1. Keyboard Navigation

- **Tab Navigation**: All interactive elements are keyboard accessible
- **Skip to Content**: Skip link available for keyboard users to bypass navigation
- **Focus Indicators**: Clear visual focus indicators on all interactive elements
- **Keyboard Shortcuts**: Common actions have keyboard shortcuts (documented in UI)
- **Focus Trap**: Modals and dialogs trap focus within them

### 2. Screen Reader Support

- **ARIA Labels**: All interactive elements have appropriate ARIA labels
- **ARIA Live Regions**: Dynamic content updates are announced to screen readers
- **Semantic HTML**: Proper use of semantic HTML elements
- **Alt Text**: All images have descriptive alt text
- **Form Labels**: All form inputs have associated labels

### 3. Color and Contrast

- **Color Contrast**: All text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- **Color Independence**: Information is not conveyed by color alone
- **Dark Mode Support**: Application supports both light and dark themes

### 4. Visual Design

- **Text Sizing**: Text can be resized up to 200% without loss of functionality
- **Responsive Design**: Application works on all screen sizes
- **Focus Indicators**: Clear 2px focus rings on all interactive elements
- **Touch Targets**: Minimum 44x44px touch targets for mobile

## Component Accessibility

### Buttons

```tsx
// Good: Accessible button with loading state
<LoadingButton loading={isLoading} aria-label="Save changes">
  Save
</LoadingButton>

// Good: Icon button with label
<button aria-label="Delete item">
  <TrashIcon />
</button>
```

### Forms

```tsx
// Good: Accessible form field
<AccessibleFormField
  label="Email Address"
  error={errors.email}
  hint="We'll never share your email"
  required
>
  <input type="email" />
</AccessibleFormField>
```

### Status Indicators

```tsx
// Good: Accessible status badge
<AccessibleBadge status="completed" variant="success">
  Completed
</AccessibleBadge>
```

### Dialogs and Modals

```tsx
// Good: Accessible confirmation dialog
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Delete Item"
  description="Are you sure you want to delete this item?"
  onConfirm={handleDelete}
/>
```

### Loading States

```tsx
// Good: Accessible loading state
<div role="status" aria-live="polite">
  <Spinner />
  <span className="sr-only">Loading data...</span>
</div>
```

## Testing Checklist

### Keyboard Testing

- [ ] All interactive elements are reachable via Tab key
- [ ] Tab order is logical and follows visual layout
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes modals and dialogs
- [ ] Arrow keys work in lists and menus
- [ ] Focus is visible on all interactive elements

### Screen Reader Testing

- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with TalkBack (Android)
- [ ] All content is announced correctly
- [ ] Form errors are announced
- [ ] Dynamic updates are announced

### Visual Testing

- [ ] Test with 200% zoom
- [ ] Test with Windows High Contrast mode
- [ ] Test color contrast with tools (e.g., axe DevTools)
- [ ] Test with color blindness simulators
- [ ] Verify focus indicators are visible

### Mobile Testing

- [ ] Test with screen reader on mobile
- [ ] Verify touch targets are at least 44x44px
- [ ] Test with device zoom enabled
- [ ] Test landscape and portrait orientations

## Common Patterns

### Announcing Dynamic Content

```tsx
import { announceToScreenReader } from "@/lib/accessibility";

// Announce success message
announceToScreenReader("Lead created successfully", "polite");

// Announce error (assertive for important messages)
announceToScreenReader("Error: Failed to save changes", "assertive");
```

### Keyboard Shortcuts

```tsx
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

// Add keyboard shortcut
useKeyboardShortcut(
  { key: "s", ctrl: true },
  () => handleSave()
);
```

### Focus Management

```tsx
import { useFocusTrap } from "@/hooks/use-focus-trap";

function Modal({ open }) {
  const containerRef = useFocusTrap<HTMLDivElement>(open);
  
  return (
    <div ref={containerRef}>
      {/* Modal content */}
    </div>
  );
}
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Reporting Accessibility Issues

If you discover an accessibility issue, please report it with:
1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Assistive technology used (if applicable)
6. Browser and OS information

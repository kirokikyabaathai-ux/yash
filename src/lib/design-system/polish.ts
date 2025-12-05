/**
 * Visual Polish Utilities
 * 
 * Standardized classes for consistent shadows, borders, transitions, and animations
 * across the entire application.
 */

import { cn } from '@/lib/utils';

/**
 * Standard shadow classes
 * Use these instead of arbitrary shadow values
 */
export const standardShadows = {
  none: 'shadow-none',
  xs: 'shadow-xs',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
} as const;

/**
 * Standard border classes
 * Use these for consistent borders throughout the app
 */
export const standardBorders = {
  none: 'border-0',
  default: 'border border-border',
  thick: 'border-2 border-border',
  primary: 'border border-primary',
  muted: 'border border-muted',
  input: 'border border-input',
  destructive: 'border border-destructive',
} as const;

/**
 * Standard transition classes
 * Use these for smooth, consistent animations
 */
export const standardTransitions = {
  // Single property transitions
  colors: 'transition-colors duration-200 ease-in-out',
  opacity: 'transition-opacity duration-150 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out',
  shadow: 'transition-shadow duration-200 ease-in-out',
  
  // Combined transitions
  all: 'transition-all duration-200 ease-in-out',
  common: 'transition-[colors,transform,shadow] duration-200 ease-in-out',
  
  // Specific use cases
  button: 'transition-all duration-200 ease-in-out',
  card: 'transition-all duration-200 ease-in-out',
  input: 'transition-[color,box-shadow] duration-200 ease-in-out',
  modal: 'transition-all duration-300 ease-in-out',
} as const;

/**
 * Standard hover effects
 * Consistent hover states for interactive elements
 */
export const standardHovers = {
  button: 'hover:opacity-90',
  card: 'hover:shadow-md hover:border-primary/50',
  link: 'hover:underline hover:text-primary/80',
  row: 'hover:bg-muted/50',
  scale: 'hover:scale-[1.02]',
  lift: 'hover:-translate-y-0.5',
} as const;

/**
 * Standard focus rings
 * Consistent focus indicators for accessibility
 */
export const standardFocusRings = {
  default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  inset: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
  thick: 'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
  none: 'focus-visible:outline-none',
} as const;

/**
 * Standard rounded corners
 * Consistent border radius values
 */
export const standardRounded = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const;

/**
 * Get polished button classes
 * Combines shadow, border, transition, and hover for buttons
 */
export function getPolishedButtonClasses(className?: string): string {
  return cn(
    standardShadows.sm,
    standardTransitions.button,
    standardHovers.button,
    standardFocusRings.default,
    className
  );
}

/**
 * Get polished card classes
 * Combines shadow, border, transition, and hover for cards
 */
export function getPolishedCardClasses(interactive: boolean = false, className?: string): string {
  const base = cn(
    standardShadows.sm,
    standardBorders.default,
    standardRounded.lg
  );
  
  if (interactive) {
    return cn(
      base,
      standardTransitions.card,
      standardHovers.card,
      'cursor-pointer',
      className
    );
  }
  
  return cn(base, className);
}

/**
 * Get polished input classes
 * Combines border, shadow, transition, and focus for inputs
 */
export function getPolishedInputClasses(className?: string): string {
  return cn(
    standardBorders.input,
    standardShadows.sm,
    standardTransitions.input,
    standardFocusRings.thick,
    standardRounded.md,
    'disabled:opacity-50 disabled:cursor-not-allowed',
    className
  );
}

/**
 * Get polished modal/dialog classes
 * Combines shadow and transition for modals
 */
export function getPolishedModalClasses(className?: string): string {
  return cn(
    standardShadows.xl,
    standardTransitions.modal,
    standardRounded.lg,
    className
  );
}

/**
 * Get polished table row classes
 * Combines transition and hover for table rows
 */
export function getPolishedTableRowClasses(className?: string): string {
  return cn(
    standardTransitions.colors,
    standardHovers.row,
    className
  );
}

/**
 * Animation presets
 * Standard animations for common use cases
 */
export const standardAnimations = {
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-150',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  slideOut: 'animate-out slide-out-to-bottom-4 duration-200',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-150',
} as const;

/**
 * Get animation class
 */
export function getAnimationClass(
  animation: keyof typeof standardAnimations,
  className?: string
): string {
  return cn(standardAnimations[animation], className);
}

/**
 * Spacing consistency helpers
 * Standard spacing patterns for common layouts
 */
export const standardSpacing = {
  // Page-level spacing
  page: {
    padding: 'p-6 md:p-8 lg:p-10',
    gap: 'space-y-8',
  },
  
  // Section-level spacing
  section: {
    padding: 'p-4 md:p-6',
    gap: 'space-y-6',
  },
  
  // Card-level spacing
  card: {
    padding: 'p-4 md:p-6',
    gap: 'space-y-4',
  },
} as const;

/**
 * Form-specific spacing patterns
 */
export const formSpacing = {
  fieldGap: 'space-y-4',
  sectionGap: 'space-y-6',
  labelGap: 'space-y-2',
  buttonGap: 'space-x-2',
} as const;

/**
 * Get spacing class
 */
export function getSpacingClass(
  level: keyof typeof standardSpacing,
  type: 'padding' | 'gap',
  className?: string
): string {
  return cn(standardSpacing[level][type], className);
}

/**
 * Get form spacing class
 */
export function getFormSpacingClass(
  type: keyof typeof formSpacing,
  className?: string
): string {
  return cn(formSpacing[type], className);
}

/**
 * Visual balance helpers
 * Ensures proper visual weight distribution
 */
export const visualBalance = {
  // Emphasis levels
  emphasis: {
    high: 'font-bold text-lg',
    medium: 'font-semibold text-base',
    low: 'font-normal text-sm',
  },
  
  // Color emphasis
  colorEmphasis: {
    high: 'text-foreground',
    medium: 'text-foreground/80',
    low: 'text-muted-foreground',
  },
} as const;

/**
 * Get emphasis class
 */
export function getEmphasisClass(
  level: 'high' | 'medium' | 'low',
  includeColor: boolean = true,
  className?: string
): string {
  if (includeColor) {
    return cn(
      visualBalance.emphasis[level],
      visualBalance.colorEmphasis[level],
      className
    );
  }
  return cn(visualBalance.emphasis[level], className);
}


/**
 * Visual Hierarchy Utilities
 * 
 * Helper functions and validators for maintaining consistent visual hierarchy
 * throughout the application. These utilities ensure proper element relationships,
 * interactive affordances, and visual balance.
 */

import { cn } from '@/lib/utils';

/**
 * Heading hierarchy classes
 * 
 * Progressive heading sizes from h1 to h6
 */
export const headingClasses = {
  h1: 'scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
  h6: 'scroll-m-20 text-base font-semibold tracking-tight',
} as const;

/**
 * Content hierarchy classes
 * 
 * Distinguishes primary from secondary content through font weight
 */
export const contentClasses = {
  primary: 'font-semibold text-foreground',
  secondary: 'font-normal text-muted-foreground',
  tertiary: 'font-normal text-muted-foreground/80',
  label: 'font-medium text-foreground',
  value: 'font-normal text-foreground',
} as const;

/**
 * Interactive element affordance classes
 * 
 * Provides clear visual cues for interactive elements
 */
export const interactiveClasses = {
  link: 'text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors cursor-pointer',
  button: 'transition-all hover:shadow-md active:scale-[0.98]',
  card: 'transition-all hover:shadow-md hover:border-primary/50 cursor-pointer',
  input: 'transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2',
  clickable: 'cursor-pointer transition-colors hover:bg-accent/50',
} as const;

/**
 * Status styling classes
 * 
 * Appropriate styling for different status types
 */
export const statusClasses = {
  success: 'text-green-600 dark:text-green-400 font-medium',
  warning: 'text-yellow-600 dark:text-yellow-400 font-medium',
  error: 'text-destructive font-medium',
  info: 'text-primary font-medium',
  neutral: 'text-muted-foreground font-normal',
} as const;

/**
 * Spacing relationship classes
 * 
 * Shows element relationships through spacing
 */
export const spacingRelationships = {
  // Related elements (tight spacing)
  related: {
    vertical: 'space-y-2',
    horizontal: 'space-x-2',
    grid: 'gap-2',
  },
  // Section elements (medium spacing)
  section: {
    vertical: 'space-y-4',
    horizontal: 'space-x-4',
    grid: 'gap-4',
  },
  // Unrelated elements (loose spacing)
  unrelated: {
    vertical: 'space-y-8',
    horizontal: 'space-x-8',
    grid: 'gap-8',
  },
} as const;

/**
 * Get heading class
 * 
 * @param level - Heading level (1-6)
 * @param className - Additional classes
 * @returns Combined class string
 */
export function getHeadingClass(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  className?: string
): string {
  return cn(headingClasses[`h${level}`], className);
}

/**
 * Get content hierarchy class
 * 
 * @param type - Content type (primary, secondary, tertiary, label, value)
 * @param className - Additional classes
 * @returns Combined class string
 */
export function getContentClass(
  type: keyof typeof contentClasses,
  className?: string
): string {
  return cn(contentClasses[type], className);
}

/**
 * Get interactive element class
 * 
 * @param type - Interactive element type
 * @param className - Additional classes
 * @returns Combined class string
 */
export function getInteractiveClass(
  type: keyof typeof interactiveClasses,
  className?: string
): string {
  return cn(interactiveClasses[type], className);
}

/**
 * Get status styling class
 * 
 * @param status - Status type
 * @param className - Additional classes
 * @returns Combined class string
 */
export function getStatusClass(
  status: keyof typeof statusClasses,
  className?: string
): string {
  return cn(statusClasses[status], className);
}

/**
 * Get spacing relationship class
 * 
 * @param relationship - Relationship type (related, section, unrelated)
 * @param direction - Direction (vertical, horizontal, grid)
 * @param className - Additional classes
 * @returns Combined class string
 */
export function getSpacingClass(
  relationship: keyof typeof spacingRelationships,
  direction: 'vertical' | 'horizontal' | 'grid',
  className?: string
): string {
  return cn(spacingRelationships[relationship][direction], className);
}

/**
 * Page section wrapper with proper spacing
 */
export const pageSectionClasses = {
  wrapper: 'space-y-8',
  header: 'space-y-2 mb-6',
  content: 'space-y-6',
  footer: 'mt-8 pt-6 border-t border-border',
} as const;

/**
 * Card section wrapper with proper spacing
 */
export const cardSectionClasses = {
  wrapper: 'space-y-6',
  header: 'space-y-1',
  content: 'space-y-4',
  footer: 'mt-6 pt-4 border-t border-border',
} as const;

/**
 * Form section wrapper with proper spacing
 */
export const formSectionClasses = {
  wrapper: 'space-y-6',
  fieldGroup: 'space-y-4',
  field: 'space-y-2',
  actions: 'flex gap-2 pt-4',
} as const;

/**
 * Data display classes
 */
export const dataDisplayClasses = {
  label: 'text-sm font-medium text-muted-foreground',
  value: 'mt-1 text-sm text-foreground',
  valueLarge: 'mt-1 text-base font-medium text-foreground',
  valueEmphasis: 'mt-1 text-lg font-semibold text-foreground',
} as const;

/**
 * Metric display classes (for dashboard cards)
 */
export const metricClasses = {
  container: 'space-y-2',
  label: 'text-sm font-medium text-muted-foreground',
  value: 'text-3xl font-bold text-foreground',
  description: 'text-xs text-muted-foreground',
  trend: {
    up: 'text-xs font-medium text-green-600 dark:text-green-400',
    down: 'text-xs font-medium text-red-600 dark:text-red-400',
    neutral: 'text-xs font-medium text-muted-foreground',
  },
} as const;

/**
 * Table hierarchy classes
 */
export const tableClasses = {
  header: 'text-xs font-medium text-muted-foreground uppercase tracking-wider',
  cell: 'text-sm text-foreground',
  cellSecondary: 'text-sm text-muted-foreground',
  cellEmphasis: 'text-sm font-medium text-foreground',
} as const;

/**
 * Validate heading hierarchy
 * 
 * Checks if heading sizes follow proper progression
 */
export function validateHeadingHierarchy(
  headings: Array<{ level: number; fontSize: number }>
): boolean {
  for (let i = 0; i < headings.length - 1; i++) {
    const current = headings[i];
    const next = headings[i + 1];
    
    // If next heading is a lower level (higher number), it should be smaller or equal
    if (next.level > current.level && next.fontSize > current.fontSize) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validate font weight hierarchy
 * 
 * Checks if primary content has heavier weight than secondary
 */
export function validateFontWeightHierarchy(
  primary: number,
  secondary: number
): boolean {
  return primary >= secondary;
}

/**
 * Validate spacing relationships
 * 
 * Checks if related elements have tighter spacing than unrelated
 */
export function validateSpacingRelationships(
  relatedSpacing: number,
  unrelatedSpacing: number
): boolean {
  return relatedSpacing < unrelatedSpacing;
}

/**
 * Get appropriate heading level for context
 * 
 * @param context - The context (page, section, subsection, etc.)
 * @returns Recommended heading level
 */
export function getRecommendedHeadingLevel(
  context: 'page' | 'section' | 'subsection' | 'card' | 'detail'
): 1 | 2 | 3 | 4 | 5 | 6 {
  const contextMap = {
    page: 1,
    section: 2,
    subsection: 3,
    card: 3,
    detail: 4,
  } as const;
  
  return contextMap[context];
}

/**
 * Visual hierarchy component wrapper
 * 
 * Provides consistent structure for page sections
 */
export function createHierarchyWrapper(
  level: 'page' | 'section' | 'subsection'
) {
  const spacingMap = {
    page: 'space-y-8',
    section: 'space-y-6',
    subsection: 'space-y-4',
  };
  
  return {
    wrapper: spacingMap[level],
    heading: getHeadingClass(getRecommendedHeadingLevel(level)),
  };
}

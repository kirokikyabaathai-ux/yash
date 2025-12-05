/**
 * Spacing Utilities
 * 
 * Helper functions for consistent spacing throughout the application.
 * These utilities ensure that all margins, padding, and gaps follow the design system's spacing scale.
 */

import { spacingTokens } from './tokens';
import { cn } from '@/lib/utils';

/**
 * Spacing scale type
 */
export type SpacingScale = keyof typeof spacingTokens;

/**
 * Get spacing value from token
 * 
 * @param scale - The spacing scale key
 * @returns The spacing value
 * 
 * @example
 * ```tsx
 * const spacing = getSpacing(4); // Returns '1rem' (16px)
 * ```
 */
export function getSpacing(scale: SpacingScale): string {
  return spacingTokens[scale];
}

/**
 * Spacing validator
 * 
 * Checks if a spacing value matches one from the spacing token set
 * 
 * @param value - The spacing value to validate (e.g., '1rem', '16px')
 * @returns true if the value is in the token set
 */
export function isValidSpacingToken(value: string): boolean {
  const validSpacing = Object.values(spacingTokens);
  return validSpacing.includes(value);
}

/**
 * Visual grouping validator
 * 
 * Validates that spacing between related elements is smaller than spacing to unrelated elements
 * 
 * @param relatedSpacing - Spacing between related elements
 * @param unrelatedSpacing - Spacing to unrelated elements
 * @returns true if related spacing is smaller
 */
export function validateVisualGrouping(
  relatedSpacing: string,
  unrelatedSpacing: string
): boolean {
  const related = parseFloat(relatedSpacing);
  const unrelated = parseFloat(unrelatedSpacing);
  
  return related < unrelated;
}

/**
 * Common spacing patterns
 * 
 * Pre-defined spacing combinations for common use cases
 */
export const spacingPatterns = {
  // Section spacing
  section: {
    padding: 'p-6 md:p-8 lg:p-10',
    margin: 'my-8 md:my-10 lg:my-12',
    gap: 'space-y-6 md:space-y-8',
  },
  
  // Card spacing
  card: {
    padding: 'p-4 md:p-6',
    gap: 'space-y-4',
  },
  
  // Form spacing
  form: {
    fieldGap: 'space-y-4',
    sectionGap: 'space-y-6',
    labelGap: 'space-y-2',
    buttonGap: 'space-x-2',
  },
  
  // List spacing
  list: {
    gap: 'space-y-2',
    itemPadding: 'py-2',
  },
  
  // Grid spacing
  grid: {
    gap: 'gap-4 md:gap-6',
    columnGap: 'gap-x-4 md:gap-x-6',
    rowGap: 'gap-y-4 md:gap-y-6',
  },
  
  // Stack spacing (vertical)
  stack: {
    tight: 'space-y-1',
    normal: 'space-y-2',
    relaxed: 'space-y-4',
    loose: 'space-y-6',
  },
  
  // Inline spacing (horizontal)
  inline: {
    tight: 'space-x-1',
    normal: 'space-x-2',
    relaxed: 'space-x-4',
    loose: 'space-x-6',
  },
  
  // Container spacing
  container: {
    padding: 'px-4 md:px-6 lg:px-8',
    maxWidth: 'max-w-7xl mx-auto',
  },
} as const;

/**
 * Get spacing pattern class
 * 
 * @param pattern - The pattern category
 * @param variant - The specific variant within the pattern
 * @param className - Additional classes to merge
 * @returns Combined class string
 * 
 * @example
 * ```tsx
 * <div className={getSpacingPattern('card', 'padding')}>
 *   Card content
 * </div>
 * ```
 */
export function getSpacingPattern<
  T extends keyof typeof spacingPatterns,
  K extends keyof (typeof spacingPatterns)[T]
>(
  pattern: T,
  variant: K,
  className?: string
): string {
  return cn(spacingPatterns[pattern][variant] as string, className);
}

/**
 * Margin utilities
 */
export const marginUtils = {
  /**
   * Get margin class for all sides
   */
  all: (scale: SpacingScale) => `m-${scale}`,
  
  /**
   * Get margin class for top
   */
  top: (scale: SpacingScale) => `mt-${scale}`,
  
  /**
   * Get margin class for right
   */
  right: (scale: SpacingScale) => `mr-${scale}`,
  
  /**
   * Get margin class for bottom
   */
  bottom: (scale: SpacingScale) => `mb-${scale}`,
  
  /**
   * Get margin class for left
   */
  left: (scale: SpacingScale) => `ml-${scale}`,
  
  /**
   * Get margin class for horizontal (left and right)
   */
  horizontal: (scale: SpacingScale) => `mx-${scale}`,
  
  /**
   * Get margin class for vertical (top and bottom)
   */
  vertical: (scale: SpacingScale) => `my-${scale}`,
};

/**
 * Padding utilities
 */
export const paddingUtils = {
  /**
   * Get padding class for all sides
   */
  all: (scale: SpacingScale) => `p-${scale}`,
  
  /**
   * Get padding class for top
   */
  top: (scale: SpacingScale) => `pt-${scale}`,
  
  /**
   * Get padding class for right
   */
  right: (scale: SpacingScale) => `pr-${scale}`,
  
  /**
   * Get padding class for bottom
   */
  bottom: (scale: SpacingScale) => `pb-${scale}`,
  
  /**
   * Get padding class for left
   */
  left: (scale: SpacingScale) => `pl-${scale}`,
  
  /**
   * Get padding class for horizontal (left and right)
   */
  horizontal: (scale: SpacingScale) => `px-${scale}`,
  
  /**
   * Get padding class for vertical (top and bottom)
   */
  vertical: (scale: SpacingScale) => `py-${scale}`,
};

/**
 * Gap utilities
 */
export const gapUtils = {
  /**
   * Get gap class for grid/flex
   */
  all: (scale: SpacingScale) => `gap-${scale}`,
  
  /**
   * Get column gap class
   */
  column: (scale: SpacingScale) => `gap-x-${scale}`,
  
  /**
   * Get row gap class
   */
  row: (scale: SpacingScale) => `gap-y-${scale}`,
  
  /**
   * Get space-y class for vertical stack
   */
  vertical: (scale: SpacingScale) => `space-y-${scale}`,
  
  /**
   * Get space-x class for horizontal stack
   */
  horizontal: (scale: SpacingScale) => `space-x-${scale}`,
};

/**
 * Responsive spacing helper
 * 
 * Creates responsive spacing classes for different breakpoints
 * 
 * @param base - Base spacing scale
 * @param md - Medium breakpoint spacing scale (optional)
 * @param lg - Large breakpoint spacing scale (optional)
 * @returns Responsive spacing class string
 * 
 * @example
 * ```tsx
 * <div className={responsiveSpacing('p', 4, 6, 8)}>
 *   // p-4 md:p-6 lg:p-8
 * </div>
 * ```
 */
export function responsiveSpacing(
  type: 'p' | 'm' | 'px' | 'py' | 'mx' | 'my' | 'gap',
  base: SpacingScale,
  md?: SpacingScale,
  lg?: SpacingScale
): string {
  const classes = [`${type}-${base}`];
  
  if (md) {
    classes.push(`md:${type}-${md}`);
  }
  
  if (lg) {
    classes.push(`lg:${type}-${lg}`);
  }
  
  return classes.join(' ');
}

/**
 * Extract spacing value from CSS
 * 
 * Extracts numeric spacing value from CSS string (e.g., '1rem' -> 16, '8px' -> 8)
 * 
 * @param value - CSS spacing value
 * @returns Numeric value in pixels
 */
export function extractSpacingValue(value: string): number {
  const match = value.match(/^([\d.]+)(rem|px|em)$/);
  
  if (!match) {
    return 0;
  }
  
  const [, num, unit] = match;
  const numValue = parseFloat(num);
  
  switch (unit) {
    case 'rem':
      return numValue * 16; // Assuming 1rem = 16px
    case 'px':
      return numValue;
    case 'em':
      return numValue * 16; // Assuming 1em = 16px (base font size)
    default:
      return 0;
  }
}

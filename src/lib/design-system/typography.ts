/**
 * Typography Utilities
 * 
 * Helper functions and classes for consistent typography throughout the application.
 * These utilities ensure that all text elements follow the design system's typography scale.
 */

import { typographyTokens } from './tokens';
import { cn } from '@/lib/utils';

/**
 * Typography variant definitions
 * 
 * These variants provide semantic typography styles that can be applied
 * to different text elements throughout the application.
 */
export const typographyVariants = {
  // Heading variants
  h1: 'scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
  h6: 'scroll-m-20 text-base font-semibold tracking-tight',
  
  // Body text variants
  body: 'text-base leading-normal',
  bodyLarge: 'text-lg leading-relaxed',
  bodySmall: 'text-sm leading-normal',
  
  // Special text variants
  lead: 'text-xl text-muted-foreground leading-relaxed',
  large: 'text-lg font-semibold',
  small: 'text-sm font-medium leading-none',
  muted: 'text-sm text-muted-foreground',
  
  // Code and monospace
  code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
  inlineCode: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
  
  // List variants
  list: 'my-6 ml-6 list-disc [&>li]:mt-2',
  
  // Blockquote
  blockquote: 'mt-6 border-l-2 pl-6 italic',
} as const;

/**
 * Typography variant type
 */
export type TypographyVariant = keyof typeof typographyVariants;

/**
 * Get typography class for a specific variant
 * 
 * @param variant - The typography variant to use
 * @param className - Additional classes to merge
 * @returns Combined class string
 * 
 * @example
 * ```tsx
 * <h1 className={getTypographyClass('h1')}>Page Title</h1>
 * <p className={getTypographyClass('body', 'text-center')}>Body text</p>
 * ```
 */
export function getTypographyClass(
  variant: TypographyVariant,
  className?: string
): string {
  return cn(typographyVariants[variant], className);
}

/**
 * Heading size progression validator
 * 
 * Validates that heading sizes follow proper hierarchy (h1 > h2 > h3 > h4 > h5 > h6)
 * 
 * @param headings - Array of heading elements with their computed font sizes
 * @returns true if hierarchy is correct, false otherwise
 */
export function validateHeadingHierarchy(
  headings: Array<{ level: 1 | 2 | 3 | 4 | 5 | 6; fontSize: string }>
): boolean {
  const sortedByLevel = [...headings].sort((a, b) => a.level - b.level);
  
  for (let i = 0; i < sortedByLevel.length - 1; i++) {
    const current = parseFloat(sortedByLevel[i].fontSize);
    const next = parseFloat(sortedByLevel[i + 1].fontSize);
    
    // Current heading should be larger than or equal to next heading
    if (current < next) {
      return false;
    }
  }
  
  return true;
}

/**
 * Font weight hierarchy validator
 * 
 * Validates that primary content uses heavier weights than secondary content
 * 
 * @param primary - Font weight of primary content
 * @param secondary - Font weight of secondary content
 * @returns true if primary weight is heavier than secondary
 */
export function validateFontWeightHierarchy(
  primary: number,
  secondary: number
): boolean {
  return primary >= secondary;
}

/**
 * Typography token validator
 * 
 * Checks if a font size value matches one from the typography token set
 * 
 * @param fontSize - The font size to validate
 * @returns true if the font size is in the token set
 */
export function isValidTypographyToken(fontSize: string): boolean {
  const validSizes = Object.values(typographyTokens.fontSize) as string[];
  return validSizes.includes(fontSize);
}

/**
 * Get font size from token
 * 
 * @param size - The size token key
 * @returns The font size value
 * 
 * @example
 * ```tsx
 * const size = getFontSize('xl'); // Returns '1.25rem'
 * ```
 */
export function getFontSize(size: keyof typeof typographyTokens.fontSize): string {
  return typographyTokens.fontSize[size];
}

/**
 * Get font weight from token
 * 
 * @param weight - The weight token key
 * @returns The font weight value
 * 
 * @example
 * ```tsx
 * const weight = getFontWeight('semibold'); // Returns 600
 * ```
 */
export function getFontWeight(weight: keyof typeof typographyTokens.fontWeight): number {
  return typographyTokens.fontWeight[weight];
}

/**
 * Get line height from token
 * 
 * @param height - The line height token key
 * @returns The line height value
 * 
 * @example
 * ```tsx
 * const lineHeight = getLineHeight('relaxed'); // Returns 1.625
 * ```
 */
export function getLineHeight(height: keyof typeof typographyTokens.lineHeight): number {
  return typographyTokens.lineHeight[height];
}

/**
 * Get appropriate HTML element for typography variant
 * 
 * @param variant - The typography variant
 * @returns The HTML element tag name
 * 
 * @example
 * ```tsx
 * const Element = getTypographyElement('h1'); // Returns 'h1'
 * ```
 */
export function getTypographyElement(variant: TypographyVariant): string {
  const elementMap: Record<TypographyVariant, string> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body: 'p',
    bodyLarge: 'p',
    bodySmall: 'p',
    lead: 'p',
    large: 'div',
    small: 'small',
    muted: 'p',
    code: 'code',
    inlineCode: 'code',
    list: 'ul',
    blockquote: 'blockquote',
  };
  
  return elementMap[variant];
}

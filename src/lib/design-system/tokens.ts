/**
 * Design Tokens - Penpot Design System
 * 
 * This file exports design tokens extracted from the Penpot design system.
 * All values are exact matches to the Penpot specifications to ensure pixel-perfect accuracy.
 * 
 * Usage:
 * import { penpotColors, penpotTypography, penpotSpacing } from '@/lib/design-system/tokens';
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md for full specifications
 */

/**
 * Penpot Color Tokens
 * 
 * Exact color values from the Penpot design system.
 * All colors are specified as hex values matching the design specifications.
 */
export const penpotColors = {
  // Primary brand color
  primary: {
    main: '#5E81F4',
    light: '#9698D6',
    dark: '#4D4CAC',
  },
  
  // State colors
  success: {
    main: '#7CE7AC',
  },
  
  warning: {
    main: '#F4BE5E',
  },
  
  error: {
    main: '#FF808B',
  },
  
  info: {
    main: '#40E1FA',
    light: '#2CE5F6',
  },
  
  // Neutral colors
  neutral: {
    darkText: '#1C1D21',
    secondaryText: '#8181A5',
  },
  
  // Background colors
  background: {
    white: '#FFFFFF',
    gray50: '#F6F6F6',
    gray100: '#F5F5FA',
    gray200: '#F0F0F3',
  },
  
  // Border colors
  border: {
    light: '#ECECF2',
  },
} as const;

/**
 * Legacy color tokens for backward compatibility
 * Maps to CSS custom properties defined in globals.css
 */
export const colorTokens = {
  // Base colors
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  
  // Card colors
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',
  
  // Popover colors
  popover: 'hsl(var(--popover))',
  popoverForeground: 'hsl(var(--popover-foreground))',
  
  // Primary colors
  primary: 'hsl(var(--primary))',
  primaryForeground: 'hsl(var(--primary-foreground))',
  
  // Secondary colors
  secondary: 'hsl(var(--secondary))',
  secondaryForeground: 'hsl(var(--secondary-foreground))',
  
  // Muted colors
  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',
  
  // Accent colors
  accent: 'hsl(var(--accent))',
  accentForeground: 'hsl(var(--accent-foreground))',
  
  // Destructive colors
  destructive: 'hsl(var(--destructive))',
  destructiveForeground: 'hsl(var(--destructive-foreground))',
  
  // Border and input colors
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  
  // Chart colors
  chart1: 'hsl(var(--chart-1))',
  chart2: 'hsl(var(--chart-2))',
  chart3: 'hsl(var(--chart-3))',
  chart4: 'hsl(var(--chart-4))',
  chart5: 'hsl(var(--chart-5))',
  
  // Sidebar colors
  sidebar: 'hsl(var(--sidebar))',
  sidebarForeground: 'hsl(var(--sidebar-foreground))',
  sidebarPrimary: 'hsl(var(--sidebar-primary))',
  sidebarPrimaryForeground: 'hsl(var(--sidebar-primary-foreground))',
  sidebarAccent: 'hsl(var(--sidebar-accent))',
  sidebarAccentForeground: 'hsl(var(--sidebar-accent-foreground))',
  sidebarBorder: 'hsl(var(--sidebar-border))',
  sidebarRing: 'hsl(var(--sidebar-ring))',
} as const;

/**
 * Penpot Typography Tokens
 * 
 * Exact typography values from the Penpot design system.
 * Font Family: Lato (primary), with icon fonts for special characters
 */
export const penpotTypography = {
  // Font families from Penpot
  fontFamily: {
    primary: 'Lato, sans-serif',
    iconSolid: 'la-solid-900',
    iconRegular: 'la-regular-400',
    iconBrands: 'la-brands-400',
  },
  
  // Heading styles (size/weight)
  headings: {
    h1: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '26px',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '18px',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '16px',
      fontWeight: 700,
      lineHeight: 1.4,
    },
  },
  
  // Body text styles
  body: {
    regular: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    bold: {
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    small: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    smallBold: {
      fontSize: '12px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    light: {
      fontSize: '14px',
      fontWeight: 300,
      lineHeight: 1.5,
    },
  },
  
  // Label styles
  labels: {
    regular: {
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: 1.4,
    },
    small: {
      fontSize: '12px',
      fontWeight: 700,
      lineHeight: 1.4,
    },
  },
} as const;

/**
 * Legacy typography tokens for backward compatibility
 * Font families, sizes, weights, and line heights used throughout the application.
 */
export const typographyTokens = {
  fontFamily: {
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    mono: 'var(--font-mono)',
  },
  
  // Font sizes (Tailwind default scale)
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem',      // 128px
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: 'var(--tracking-tighter)',
    tight: 'var(--tracking-tight)',
    normal: 'var(--tracking-normal)',
    wide: 'var(--tracking-wide)',
    wider: 'var(--tracking-wider)',
    widest: 'var(--tracking-widest)',
  },
} as const;

/**
 * Penpot Spacing Tokens
 * 
 * Exact spacing values from the Penpot design system.
 * Base unit: 4px
 * Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
 */
export const penpotSpacing = {
  1: '4px',    // Base unit
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

/**
 * Legacy spacing tokens for backward compatibility
 * Consistent spacing values for margins, padding, and gaps.
 * Based on Tailwind's default spacing scale (0.25rem = 4px base unit).
 */
export const spacingTokens = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
  36: '9rem',        // 144px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  52: '13rem',       // 208px
  56: '14rem',       // 224px
  60: '15rem',       // 240px
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem',       // 384px
} as const;

/**
 * Penpot Shadow Tokens
 * 
 * Exact shadow values from the Penpot design system for elevation.
 */
export const penpotShadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  none: 'none',
} as const;

/**
 * Penpot Border Radius Tokens
 * 
 * Exact border radius values from the Penpot design system.
 */
export const penpotRadii = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
  none: '0',
} as const;

/**
 * Legacy border radius tokens for backward compatibility
 * Consistent border radius values.
 */
export const radiusTokens = {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  '3xl': 'calc(var(--radius) + 12px)',
  full: '9999px',
} as const;

/**
 * Legacy shadow tokens for backward compatibility
 * Consistent shadow values for elevation.
 */
export const shadowTokens = {
  '2xs': 'var(--shadow-2xs)',
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  '2xl': 'var(--shadow-2xl)',
  none: 'none',
} as const;

/**
 * Transition Tokens
 * 
 * Consistent transition durations and timing functions.
 */
export const transitionTokens = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
} as const;

/**
 * Type definitions for Penpot design tokens
 */
export type PenpotColorCategory = keyof typeof penpotColors;
export type PenpotHeading = keyof typeof penpotTypography.headings;
export type PenpotBodyStyle = keyof typeof penpotTypography.body;
export type PenpotLabelStyle = keyof typeof penpotTypography.labels;
export type PenpotSpacing = keyof typeof penpotSpacing;
export type PenpotRadius = keyof typeof penpotRadii;
export type PenpotShadow = keyof typeof penpotShadows;

/**
 * Type definitions for legacy design tokens
 */
export type ColorToken = keyof typeof colorTokens;
export type FontSize = keyof typeof typographyTokens.fontSize;
export type FontWeight = keyof typeof typographyTokens.fontWeight;
export type Spacing = keyof typeof spacingTokens;
export type Radius = keyof typeof radiusTokens;
export type Shadow = keyof typeof shadowTokens;

/**
 * Utility Functions for Accessing Penpot Design Tokens
 */

/**
 * Get a color value from the Penpot color palette
 * 
 * @param category - The color category (primary, success, warning, etc.)
 * @param variant - The variant within the category (main, light, dark)
 * @returns The hex color value
 * 
 * @example
 * ```tsx
 * const primaryColor = getPenpotColor('primary', 'main'); // Returns '#5E81F4'
 * const successColor = getPenpotColor('success', 'main'); // Returns '#7CE7AC'
 * ```
 */
export function getPenpotColor(
  category: keyof typeof penpotColors,
  variant: string
): string {
  const colorCategory = penpotColors[category] as Record<string, string>;
  return colorCategory[variant] || colorCategory.main || '';
}

/**
 * Get a spacing value from the Penpot spacing scale
 * 
 * @param scale - The spacing scale key (1-16)
 * @returns The spacing value in pixels
 * 
 * @example
 * ```tsx
 * const spacing = getPenpotSpacing(4); // Returns '16px'
 * const largeSpacing = getPenpotSpacing(8); // Returns '32px'
 * ```
 */
export function getPenpotSpacing(scale: PenpotSpacing): string {
  return penpotSpacing[scale];
}

/**
 * Get a typography style from the Penpot typography system
 * 
 * @param type - The typography type ('heading', 'body', or 'label')
 * @param variant - The variant within the type
 * @returns An object with fontSize, fontWeight, and lineHeight
 * 
 * @example
 * ```tsx
 * const h1Style = getPenpotTypography('heading', 'h1');
 * // Returns { fontSize: '32px', fontWeight: 700, lineHeight: 1.2 }
 * 
 * const bodyStyle = getPenpotTypography('body', 'regular');
 * // Returns { fontSize: '14px', fontWeight: 400, lineHeight: 1.5 }
 * ```
 */
export function getPenpotTypography(
  type: 'heading' | 'body' | 'label',
  variant: string
): { fontSize: string; fontWeight: number; lineHeight: number } {
  if (type === 'heading') {
    return penpotTypography.headings[variant as PenpotHeading];
  } else if (type === 'body') {
    return penpotTypography.body[variant as PenpotBodyStyle];
  } else if (type === 'label') {
    return penpotTypography.labels[variant as PenpotLabelStyle];
  }
  
  // Default fallback
  return penpotTypography.body.regular;
}

/**
 * Get a shadow value from the Penpot shadow system
 * 
 * @param size - The shadow size (sm, md, lg, xl)
 * @returns The CSS box-shadow value
 * 
 * @example
 * ```tsx
 * const shadow = getPenpotShadow('md'); // Returns '0 4px 6px rgba(0, 0, 0, 0.07)'
 * ```
 */
export function getPenpotShadow(size: PenpotShadow): string {
  return penpotShadows[size];
}

/**
 * Get a border radius value from the Penpot radius system
 * 
 * @param size - The radius size (sm, md, lg, full)
 * @returns The border-radius value
 * 
 * @example
 * ```tsx
 * const radius = getPenpotRadius('md'); // Returns '8px'
 * const rounded = getPenpotRadius('full'); // Returns '9999px'
 * ```
 */
export function getPenpotRadius(size: PenpotRadius): string {
  return penpotRadii[size];
}

/**
 * Validate if a color value exists in the Penpot color system
 * 
 * @param hexColor - The hex color to validate
 * @returns true if the color exists in the Penpot palette
 * 
 * @example
 * ```tsx
 * const isValid = isValidPenpotColor('#5E81F4'); // Returns true
 * const isInvalid = isValidPenpotColor('#123456'); // Returns false
 * ```
 */
export function isValidPenpotColor(hexColor: string): boolean {
  const allColors: string[] = [];
  
  Object.values(penpotColors).forEach((category) => {
    if (typeof category === 'object') {
      Object.values(category).forEach((color) => {
        allColors.push(color);
      });
    }
  });
  
  return allColors.includes(hexColor.toUpperCase());
}

/**
 * Validate if a spacing value exists in the Penpot spacing system
 * 
 * @param spacing - The spacing value to validate (e.g., '16px', '32px')
 * @returns true if the spacing exists in the Penpot scale
 * 
 * @example
 * ```tsx
 * const isValid = isValidPenpotSpacing('16px'); // Returns true
 * const isInvalid = isValidPenpotSpacing('15px'); // Returns false
 * ```
 */
export function isValidPenpotSpacing(spacing: string): boolean {
  const validSpacings = Object.values(penpotSpacing) as string[];
  return validSpacings.includes(spacing);
}

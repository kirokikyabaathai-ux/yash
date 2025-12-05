/**
 * Design Tokens
 * 
 * This file exports design tokens that are used throughout the application.
 * These tokens are derived from CSS custom properties defined in globals.css.
 * 
 * Usage:
 * import { colorTokens, typographyTokens, spacingTokens } from '@/lib/design-system/tokens';
 */

/**
 * Color Tokens
 * 
 * All color values used in the application should come from this palette.
 * These map to CSS custom properties defined in globals.css.
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
 * Typography Tokens
 * 
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
 * Spacing Tokens
 * 
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
 * Border Radius Tokens
 * 
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
 * Shadow Tokens
 * 
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
 * Type definitions for design tokens
 */
export type ColorToken = keyof typeof colorTokens;
export type FontSize = keyof typeof typographyTokens.fontSize;
export type FontWeight = keyof typeof typographyTokens.fontWeight;
export type Spacing = keyof typeof spacingTokens;
export type Radius = keyof typeof radiusTokens;
export type Shadow = keyof typeof shadowTokens;

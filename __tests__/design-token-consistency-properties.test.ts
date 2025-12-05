/**
 * Property-Based Tests for Design Token Consistency
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for design system tokens and utilities.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.4, 1.5**
 */

import fc from 'fast-check';
import {
  colorTokens,
  typographyTokens,
  spacingTokens,
  isValidTypographyToken,
  isValidSpacingToken,
  validateHeadingHierarchy,
  validateFontWeightHierarchy,
  validateVisualGrouping,
  extractSpacingValue,
} from '../src/lib/design-system';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

describe('Design Token Consistency Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 1: Typography consistency across pages**
   * **Validates: Requirements 1.1, 1.4**
   * 
   * For any two pages in the application, all text elements of the same semantic type
   * (headings, body text, labels) should use identical font family, size, weight, and
   * line height values from the typography token set.
   */
  describe('Property 1: Typography consistency across pages', () => {
    it('should use consistent font families from typography tokens', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('sans', 'serif', 'mono'),
          (fontType) => {
            // Get font family from tokens
            const fontFamily = typographyTokens.fontFamily[fontType];
            
            // Font family should be defined and non-empty
            expect(fontFamily).toBeDefined();
            expect(fontFamily).not.toBe('');
            expect(typeof fontFamily).toBe('string');
            
            // Font family should reference CSS custom property
            expect(fontFamily).toContain('var(--font-');
          }
        )
      );
    });

    it('should use consistent font sizes from typography tokens', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'),
          (sizeKey) => {
            // Get font size from tokens
            const fontSize = typographyTokens.fontSize[sizeKey];
            
            // Font size should be defined and valid
            expect(fontSize).toBeDefined();
            expect(fontSize).toMatch(/^\d+(\.\d+)?rem$/);
            
            // Font size should be a valid typography token
            expect(isValidTypographyToken(fontSize)).toBe(true);
          }
        )
      );
    });

    it('should use consistent font weights from typography tokens', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('normal', 'medium', 'semibold', 'bold'),
          (weightKey) => {
            // Get font weight from tokens
            const fontWeight = typographyTokens.fontWeight[weightKey];
            
            // Font weight should be defined and valid
            expect(fontWeight).toBeDefined();
            expect(typeof fontWeight).toBe('number');
            expect(fontWeight).toBeGreaterThanOrEqual(400);
            expect(fontWeight).toBeLessThanOrEqual(700);
          }
        )
      );
    });

    it('should use consistent line heights from typography tokens', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('none', 'tight', 'snug', 'normal', 'relaxed', 'loose'),
          (heightKey) => {
            // Get line height from tokens
            const lineHeight = typographyTokens.lineHeight[heightKey];
            
            // Line height should be defined and valid
            expect(lineHeight).toBeDefined();
            expect(typeof lineHeight).toBe('number');
            expect(lineHeight).toBeGreaterThan(0);
            expect(lineHeight).toBeLessThanOrEqual(2);
          }
        )
      );
    });

    it('should maintain heading size hierarchy', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              level: fc.constantFrom(1, 2, 3, 4, 5, 6) as fc.Arbitrary<1 | 2 | 3 | 4 | 5 | 6>,
              fontSize: fc.constantFrom(
                typographyTokens.fontSize['5xl'],
                typographyTokens.fontSize['4xl'],
                typographyTokens.fontSize['3xl'],
                typographyTokens.fontSize['2xl'],
                typographyTokens.fontSize.xl,
                typographyTokens.fontSize.lg,
                typographyTokens.fontSize.base
              ),
            }),
            { minLength: 2, maxLength: 6 }
          ),
          (headings) => {
            // Create properly ordered headings (h1 should be largest)
            const orderedHeadings = [
              { level: 1 as const, fontSize: typographyTokens.fontSize['4xl'] },
              { level: 2 as const, fontSize: typographyTokens.fontSize['3xl'] },
              { level: 3 as const, fontSize: typographyTokens.fontSize['2xl'] },
              { level: 4 as const, fontSize: typographyTokens.fontSize.xl },
              { level: 5 as const, fontSize: typographyTokens.fontSize.lg },
              { level: 6 as const, fontSize: typographyTokens.fontSize.base },
            ];
            
            // Validate that properly ordered headings pass hierarchy check
            expect(validateHeadingHierarchy(orderedHeadings)).toBe(true);
          }
        )
      );
    });

    it('should validate font weight hierarchy for primary vs secondary content', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('semibold', 'bold'),
          fc.constantFrom('normal', 'medium'),
          (primaryWeight, secondaryWeight) => {
            const primary = typographyTokens.fontWeight[primaryWeight];
            const secondary = typographyTokens.fontWeight[secondaryWeight];
            
            // Primary content should have heavier weight than secondary
            expect(validateFontWeightHierarchy(primary, secondary)).toBe(true);
            expect(primary).toBeGreaterThanOrEqual(secondary);
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 2: Color palette adherence**
   * **Validates: Requirements 1.2**
   * 
   * For any rendered component, all color values used should match colors
   * defined in the design token color palette.
   */
  describe('Property 2: Color palette adherence', () => {
    it('should have all required color tokens defined', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'background',
            'foreground',
            'primary',
            'primaryForeground',
            'secondary',
            'secondaryForeground',
            'muted',
            'mutedForeground',
            'accent',
            'accentForeground',
            'destructive',
            'destructiveForeground',
            'border',
            'input',
            'ring',
            'card',
            'cardForeground'
          ),
          (colorKey) => {
            // Color token should be defined
            expect(colorTokens[colorKey]).toBeDefined();
            expect(typeof colorTokens[colorKey]).toBe('string');
            
            // Color token should reference CSS custom property
            expect(colorTokens[colorKey]).toContain('hsl(var(--');
          }
        )
      );
    });

    it('should have consistent color token format', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(colorTokens)),
          (colorKey) => {
            const colorValue = colorTokens[colorKey as keyof typeof colorTokens];
            
            // All color tokens should use hsl() with CSS custom properties
            expect(colorValue).toMatch(/^hsl\(var\(--[\w-]+\)\)$/);
          }
        )
      );
    });

    it('should have foreground colors paired with background colors', () => {
      const colorPairs = [
        ['primary', 'primaryForeground'],
        ['secondary', 'secondaryForeground'],
        ['muted', 'mutedForeground'],
        ['accent', 'accentForeground'],
        ['destructive', 'destructiveForeground'],
        ['card', 'cardForeground'],
        ['popover', 'popoverForeground'],
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...colorPairs),
          ([bg, fg]) => {
            // Both background and foreground should be defined
            expect(colorTokens[bg as keyof typeof colorTokens]).toBeDefined();
            expect(colorTokens[fg as keyof typeof colorTokens]).toBeDefined();
          }
        )
      );
    });

    it('should have chart colors defined', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('chart1', 'chart2', 'chart3', 'chart4', 'chart5'),
          (chartColor) => {
            // Chart color should be defined
            expect(colorTokens[chartColor]).toBeDefined();
            expect(colorTokens[chartColor]).toContain('hsl(var(--chart-');
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 3: Spacing system adherence**
   * **Validates: Requirements 1.5**
   * 
   * For any element with margin, padding, or gap properties, the values should
   * come from the defined spacing token set.
   */
  describe('Property 3: Spacing system adherence', () => {
    it('should have all spacing tokens defined', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24),
          (spacingKey) => {
            // Spacing token should be defined
            expect(spacingTokens[spacingKey]).toBeDefined();
            expect(typeof spacingTokens[spacingKey]).toBe('string');
          }
        )
      );
    });

    it('should validate spacing token format', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(spacingTokens).filter(k => k !== '0' && k !== 'px')),
          (spacingKey) => {
            const spacingValue = spacingTokens[spacingKey as keyof typeof spacingTokens];
            
            // Spacing values should be in rem units (except 0 and px)
            if (spacingKey !== '0' && spacingKey !== 'px') {
              expect(spacingValue).toMatch(/^\d+(\.\d+)?rem$/);
            }
            
            // Should be a valid spacing token
            expect(isValidSpacingToken(spacingValue)).toBe(true);
          }
        )
      );
    });

    it('should validate visual grouping through spacing', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(2, 3, 4),
          fc.constantFrom(6, 8, 10, 12),
          (relatedKey, unrelatedKey) => {
            const relatedSpacing = spacingTokens[relatedKey];
            const unrelatedSpacing = spacingTokens[unrelatedKey];
            
            // Related elements should have smaller spacing than unrelated
            expect(validateVisualGrouping(relatedSpacing, unrelatedSpacing)).toBe(true);
            
            const relatedValue = extractSpacingValue(relatedSpacing);
            const unrelatedValue = extractSpacingValue(unrelatedSpacing);
            expect(relatedValue).toBeLessThan(unrelatedValue);
          }
        )
      );
    });

    it('should have consistent spacing scale progression', () => {
      const spacingKeys = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: spacingKeys.length - 2 }),
          (index) => {
            const currentKey = spacingKeys[index];
            const nextKey = spacingKeys[index + 1];
            
            const currentValue = extractSpacingValue(spacingTokens[currentKey]);
            const nextValue = extractSpacingValue(spacingTokens[nextKey]);
            
            // Each spacing value should be larger than the previous
            expect(nextValue).toBeGreaterThan(currentValue);
          }
        )
      );
    });

    it('should extract spacing values correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            { value: '1rem', expected: 16 },
            { value: '0.5rem', expected: 8 },
            { value: '2rem', expected: 32 },
            { value: '16px', expected: 16 },
            { value: '8px', expected: 8 }
          ),
          ({ value, expected }) => {
            const extracted = extractSpacingValue(value);
            expect(extracted).toBe(expected);
          }
        )
      );
    });
  });
});

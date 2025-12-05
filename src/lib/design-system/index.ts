/**
 * Design System
 * 
 * Central export point for all design system utilities, tokens, and helpers.
 * 
 * @example
 * ```tsx
 * import { colorTokens, getTypographyClass, getSpacing } from '@/lib/design-system';
 * ```
 */

// Export all tokens
export {
  colorTokens,
  typographyTokens,
  spacingTokens,
  radiusTokens,
  shadowTokens,
  transitionTokens,
  type ColorToken,
  type FontSize,
  type FontWeight,
  type Spacing,
  type Radius,
  type Shadow,
} from './tokens';

// Export typography utilities
export {
  typographyVariants,
  getTypographyClass,
  getTypographyElement,
  validateHeadingHierarchy,
  validateFontWeightHierarchy,
  isValidTypographyToken,
  getFontSize,
  getFontWeight,
  getLineHeight,
  type TypographyVariant,
} from './typography';

// Export spacing utilities
export {
  getSpacing,
  isValidSpacingToken,
  validateVisualGrouping,
  spacingPatterns,
  getSpacingPattern,
  marginUtils,
  paddingUtils,
  gapUtils,
  responsiveSpacing,
  extractSpacingValue,
  type SpacingScale,
} from './spacing';

// Export visual hierarchy utilities
export {
  headingClasses,
  contentClasses,
  interactiveClasses,
  statusClasses,
  spacingRelationships,
  pageSectionClasses,
  cardSectionClasses,
  formSectionClasses,
  dataDisplayClasses,
  metricClasses,
  tableClasses,
  getHeadingClass,
  getContentClass,
  getInteractiveClass,
  getStatusClass,
  getSpacingClass,
  validateSpacingRelationships,
  getRecommendedHeadingLevel,
  createHierarchyWrapper,
} from './visual-hierarchy';

// Export polish utilities
export {
  standardShadows,
  standardBorders,
  standardTransitions,
  standardHovers,
  standardFocusRings,
  standardRounded,
  standardAnimations,
  standardSpacing,
  formSpacing,
  visualBalance,
  getPolishedButtonClasses,
  getPolishedCardClasses,
  getPolishedInputClasses,
  getPolishedModalClasses,
  getPolishedTableRowClasses,
  getAnimationClass,
  getFormSpacingClass,
  getEmphasisClass,
} from './polish';

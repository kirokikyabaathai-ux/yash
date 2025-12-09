/**
 * Atomic UI Components - Penpot Design System
 * 
 * This file exports all atomic-level components from the Penpot design system.
 * Atomic components are the basic building blocks that cannot be broken down further.
 * 
 * @see .kiro/specs/penpot-ui-modernization/design.md for design specifications
 */

// Form Controls
export { Button, buttonVariants, type ButtonProps } from '../button'
export { Input, type InputProps } from '../input'
export { Checkbox, type CheckboxProps } from '../checkbox'
export { RadioGroup, RadioGroupItem, type RadioGroupItemProps } from '../radio-group'
export { Switch, type SwitchProps } from '../switch'

// Display Components
export { Badge, badgeVariants, type BadgeProps } from '../badge'
export { Tag, tagVariants, type TagProps } from '../tag'

// Typography
export {
  Typography,
  typographyVariants,
  type TypographyProps,
  type HeadingProps,
  type BodyProps,
  type LabelTextProps,
  // Heading components
  H1,
  H2,
  H3,
  H4,
  H5,
  // Body text components
  Body,
  BodyBold,
  Small,
  SmallBold,
  Light,
  // Label components
  LabelText,
  LabelSmall,
} from '../typography'

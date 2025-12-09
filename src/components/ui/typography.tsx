import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { penpotTypography, penpotColors } from "@/lib/design-system/tokens"

/**
 * Typography Component - Penpot Design System
 * 
 * Atomic component implementing typography styles from the Penpot design system.
 * Supports heading levels (H1-H5) and body text variants.
 * 
 * @example
 * ```tsx
 * <Typography variant="h1">Main Heading</Typography>
 * <Typography variant="body">Regular body text</Typography>
 * <Typography variant="bodyBold">Bold body text</Typography>
 * <Typography variant="small" color="secondary">Small text</Typography>
 * ```
 */

const typographyVariants = cva(
  "font-[Lato,sans-serif]",
  {
    variants: {
      variant: {
        h1: "text-[32px] font-bold leading-[1.2]",
        h2: "text-[26px] font-bold leading-[1.2]",
        h3: "text-[20px] font-bold leading-[1.3]",
        h4: "text-[18px] font-bold leading-[1.3]",
        h5: "text-[16px] font-bold leading-[1.4]",
        body: "text-[14px] font-normal leading-[1.5]",
        bodyBold: "text-[14px] font-bold leading-[1.5]",
        small: "text-[12px] font-normal leading-[1.5]",
        smallBold: "text-[12px] font-bold leading-[1.5]",
        light: "text-[14px] font-light leading-[1.5]",
        label: "text-[14px] font-bold leading-[1.4]",
        labelSmall: "text-[12px] font-bold leading-[1.4]",
      },
      color: {
        primary: "text-[var(--penpot-neutral-dark)]",
        secondary: "text-[var(--penpot-neutral-secondary)]",
        brand: "text-[var(--penpot-primary)]",
        success: "text-[var(--penpot-success)]",
        warning: "text-[var(--penpot-warning)]",
        error: "text-[var(--penpot-error)]",
        white: "text-white",
      },
    },
    defaultVariants: {
      variant: "body",
      color: "primary",
    },
  }
)

export interface TypographyProps extends React.ComponentProps<"p">, VariantProps<typeof typographyVariants> {
  /**
   * Render as a child component (using Radix Slot)
   */
  asChild?: boolean
  /**
   * The HTML element to render
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label'
}

function Typography({
  className,
  variant,
  color,
  asChild = false,
  as,
  ...props
}: TypographyProps) {
  // Determine the default element based on variant
  const getDefaultElement = () => {
    if (as) return as
    if (variant?.startsWith('h')) return variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5'
    if (variant?.startsWith('label')) return 'label'
    return 'p'
  }
  
  const Comp = asChild ? Slot : getDefaultElement()

  return (
    <Comp
      data-slot="typography"
      className={cn(typographyVariants({ variant, color }), className)}
      {...props}
    />
  )
}

/**
 * Heading Components - Convenience wrappers for common heading levels
 */

export interface HeadingProps extends Omit<TypographyProps, 'variant' | 'as'> {}

function H1(props: HeadingProps) {
  return <Typography variant="h1" as="h1" {...props} />
}

function H2(props: HeadingProps) {
  return <Typography variant="h2" as="h2" {...props} />
}

function H3(props: HeadingProps) {
  return <Typography variant="h3" as="h3" {...props} />
}

function H4(props: HeadingProps) {
  return <Typography variant="h4" as="h4" {...props} />
}

function H5(props: HeadingProps) {
  return <Typography variant="h5" as="h5" {...props} />
}

/**
 * Body Text Components - Convenience wrappers for common body text styles
 */

export interface BodyProps extends Omit<TypographyProps, 'variant'> {}

function Body(props: BodyProps) {
  return <Typography variant="body" {...props} />
}

function BodyBold(props: BodyProps) {
  return <Typography variant="bodyBold" {...props} />
}

function Small(props: BodyProps) {
  return <Typography variant="small" {...props} />
}

function SmallBold(props: BodyProps) {
  return <Typography variant="smallBold" {...props} />
}

function Light(props: BodyProps) {
  return <Typography variant="light" {...props} />
}

/**
 * Label Components - Convenience wrappers for form labels
 */

export interface LabelTextProps extends Omit<TypographyProps, 'variant'> {}

function LabelText(props: LabelTextProps) {
  return <Typography variant="label" as="label" {...props} />
}

function LabelSmall(props: LabelTextProps) {
  return <Typography variant="labelSmall" as="label" {...props} />
}

export {
  Typography,
  typographyVariants,
  // Headings
  H1,
  H2,
  H3,
  H4,
  H5,
  // Body text
  Body,
  BodyBold,
  Small,
  SmallBold,
  Light,
  // Labels
  LabelText,
  LabelSmall,
}

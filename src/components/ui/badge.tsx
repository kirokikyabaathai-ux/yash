import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { penpotColors, penpotRadii } from "@/lib/design-system/tokens"

/**
 * Badge Component - Penpot Design System
 * 
 * Atomic component implementing badge variants from the Penpot design system.
 * Supports solid, outline, and subtle variants with multiple color schemes.
 * 
 * @example
 * ```tsx
 * <Badge variant="solid" colorScheme="blue">New</Badge>
 * <Badge variant="outline" colorScheme="green">Active</Badge>
 * <Badge variant="subtle" colorScheme="red" rounded>Error</Badge>
 * ```
 */

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all overflow-hidden",
  {
    variants: {
      variant: {
        solid: "border-transparent text-white",
        outline: "bg-transparent",
        subtle: "border-transparent",
      },
      colorScheme: {
        blue: "",
        green: "",
        yellow: "",
        red: "",
        gray: "",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0.5",
        md: "text-xs px-2 py-0.5",
        lg: "text-sm px-3 py-1",
      },
      rounded: {
        true: "rounded-full",
        false: "rounded-[4px]",
      },
    },
    compoundVariants: [
      // Solid variants
      {
        variant: "solid",
        colorScheme: "blue",
        className: "bg-[var(--penpot-primary)]",
      },
      {
        variant: "solid",
        colorScheme: "green",
        className: "bg-[var(--penpot-success)] text-[var(--penpot-neutral-dark)]",
      },
      {
        variant: "solid",
        colorScheme: "yellow",
        className: "bg-[var(--penpot-warning)] text-[var(--penpot-neutral-dark)]",
      },
      {
        variant: "solid",
        colorScheme: "red",
        className: "bg-[var(--penpot-error)]",
      },
      {
        variant: "solid",
        colorScheme: "gray",
        className: "bg-[var(--penpot-bg-gray-200)] text-[var(--penpot-neutral-dark)]",
      },
      // Outline variants
      {
        variant: "outline",
        colorScheme: "blue",
        className: "border-[var(--penpot-primary)] text-[var(--penpot-primary)]",
      },
      {
        variant: "outline",
        colorScheme: "green",
        className: "border-[var(--penpot-success)] text-[var(--penpot-success)]",
      },
      {
        variant: "outline",
        colorScheme: "yellow",
        className: "border-[var(--penpot-warning)] text-[var(--penpot-warning)]",
      },
      {
        variant: "outline",
        colorScheme: "red",
        className: "border-[var(--penpot-error)] text-[var(--penpot-error)]",
      },
      {
        variant: "outline",
        colorScheme: "gray",
        className: "border-[var(--penpot-border-light)] text-[var(--penpot-neutral-secondary)]",
      },
      // Subtle variants
      {
        variant: "subtle",
        colorScheme: "blue",
        className: "bg-[var(--penpot-primary)]/10 text-[var(--penpot-primary)]",
      },
      {
        variant: "subtle",
        colorScheme: "green",
        className: "bg-[var(--penpot-success)]/10 text-[var(--penpot-success)]",
      },
      {
        variant: "subtle",
        colorScheme: "yellow",
        className: "bg-[var(--penpot-warning)]/10 text-[var(--penpot-warning)]",
      },
      {
        variant: "subtle",
        colorScheme: "red",
        className: "bg-[var(--penpot-error)]/10 text-[var(--penpot-error)]",
      },
      {
        variant: "subtle",
        colorScheme: "gray",
        className: "bg-[var(--penpot-bg-gray-100)] text-[var(--penpot-neutral-secondary)]",
      },
    ],
    defaultVariants: {
      variant: "solid",
      colorScheme: "blue",
      size: "md",
      rounded: false,
    },
  }
)

export interface BadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  /**
   * Render as a child component (using Radix Slot)
   */
  asChild?: boolean
}

function Badge({
  className,
  variant,
  colorScheme,
  size,
  rounded,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, colorScheme, size, rounded }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

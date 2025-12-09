"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { penpotColors, penpotRadii } from "@/lib/design-system/tokens"

/**
 * Tag Component - Penpot Design System
 * 
 * Atomic component implementing tags from the Penpot design system.
 * Tags are similar to badges but are typically used for categorization and can be editable/removable.
 * 
 * @example
 * ```tsx
 * <Tag colorScheme="blue">React</Tag>
 * <Tag colorScheme="green" onRemove={() => handleRemove()}>TypeScript</Tag>
 * <Tag colorScheme="red" editable>Important</Tag>
 * ```
 */

const tagVariants = cva(
  "inline-flex items-center justify-center border px-2 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-all rounded-[4px]",
  {
    variants: {
      colorScheme: {
        blue: "bg-[var(--penpot-primary)]/10 border-[var(--penpot-primary)]/20 text-[var(--penpot-primary)]",
        green: "bg-[var(--penpot-success)]/10 border-[var(--penpot-success)]/20 text-[var(--penpot-success)]",
        yellow: "bg-[var(--penpot-warning)]/10 border-[var(--penpot-warning)]/20 text-[var(--penpot-warning)]",
        red: "bg-[var(--penpot-error)]/10 border-[var(--penpot-error)]/20 text-[var(--penpot-error)]",
        gray: "bg-[var(--penpot-bg-gray-100)] border-[var(--penpot-border-light)] text-[var(--penpot-neutral-secondary)]",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0.5",
        md: "text-xs px-2 py-1",
        lg: "text-sm px-3 py-1.5",
      },
    },
    defaultVariants: {
      colorScheme: "blue",
      size: "md",
    },
  }
)

export interface TagProps extends React.ComponentProps<"span">, VariantProps<typeof tagVariants> {
  /**
   * Whether the tag can be removed
   */
  onRemove?: () => void
  /**
   * Whether the tag is editable
   */
  editable?: boolean
}

function Tag({
  className,
  colorScheme,
  size,
  onRemove,
  editable,
  children,
  ...props
}: TagProps) {
  return (
    <span
      data-slot="tag"
      className={cn(
        tagVariants({ colorScheme, size }),
        editable && "cursor-text",
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity focus:outline-none focus:ring-1 focus:ring-current rounded-sm"
          aria-label="Remove tag"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  )
}

export { Tag, tagVariants }

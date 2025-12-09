/**
 * Penpot Style Utilities
 * 
 * Helper functions to generate inline styles using Penpot design tokens.
 * Used when Tailwind's arbitrary values don't work well with dynamic colors.
 */

import { penpotColors } from './tokens'

export function getPenpotColorStyle(colorPath: string): React.CSSProperties {
  const parts = colorPath.split('.')
  let value: any = penpotColors
  
  for (const part of parts) {
    value = value?.[part]
  }
  
  if (typeof value === 'string') {
    return { color: value }
  }
  
  return {}
}

export function getPenpotBgStyle(colorPath: string): React.CSSProperties {
  const parts = colorPath.split('.')
  let value: any = penpotColors
  
  for (const part of parts) {
    value = value?.[part]
  }
  
  if (typeof value === 'string') {
    return { backgroundColor: value }
  }
  
  return {}
}

export function getPenpotBorderStyle(colorPath: string): React.CSSProperties {
  const parts = colorPath.split('.')
  let value: any = penpotColors
  
  for (const part of parts) {
    value = value?.[part]
  }
  
  if (typeof value === 'string') {
    return { borderColor: value }
  }
  
  return {}
}

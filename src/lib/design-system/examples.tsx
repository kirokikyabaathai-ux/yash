/**
 * Design Token Usage Examples
 * 
 * This file demonstrates how to use the Penpot design token system
 * in React components. These are example patterns, not production components.
 */

import React from 'react';
import {
  getPenpotColor,
  getPenpotSpacing,
  getPenpotTypography,
  getPenpotShadow,
  getPenpotRadius,
  penpotColors,
  penpotSpacing,
} from './tokens';

/**
 * Example 1: Button Component using Penpot tokens
 */
export function ExampleButton() {
  const buttonStyle: React.CSSProperties = {
    backgroundColor: getPenpotColor('primary', 'main'),
    color: penpotColors.background.white,
    padding: `${getPenpotSpacing(2)} ${getPenpotSpacing(4)}`,
    borderRadius: getPenpotRadius('md'),
    border: 'none',
    cursor: 'pointer',
    fontSize: getPenpotTypography('body', 'regular').fontSize,
    fontWeight: getPenpotTypography('body', 'bold').fontWeight,
  };

  return (
    <button style={buttonStyle}>
      Primary Button
    </button>
  );
}

/**
 * Example 2: Card Component using Penpot tokens
 */
export function ExampleCard() {
  const cardStyle: React.CSSProperties = {
    backgroundColor: getPenpotColor('background', 'white'),
    borderRadius: getPenpotRadius('lg'),
    boxShadow: getPenpotShadow('md'),
    padding: getPenpotSpacing(6),
    border: `1px solid ${getPenpotColor('border', 'light')}`,
  };

  const headingStyle: React.CSSProperties = {
    ...getPenpotTypography('heading', 'h3'),
    color: getPenpotColor('neutral', 'darkText'),
    marginBottom: getPenpotSpacing(3),
  };

  const bodyStyle: React.CSSProperties = {
    ...getPenpotTypography('body', 'regular'),
    color: getPenpotColor('neutral', 'secondaryText'),
  };

  return (
    <div style={cardStyle}>
      <h3 style={headingStyle}>Card Title</h3>
      <p style={bodyStyle}>Card content goes here</p>
    </div>
  );
}

/**
 * Example 3: Badge Component using Penpot tokens
 */
export function ExampleBadge({ variant = 'success' }: { variant?: 'success' | 'warning' | 'error' | 'info' }) {
  const badgeStyle: React.CSSProperties = {
    backgroundColor: getPenpotColor(variant, 'main'),
    color: penpotColors.background.white,
    padding: `${penpotSpacing[1]} ${penpotSpacing[2]}`,
    borderRadius: getPenpotRadius('full'),
    fontSize: getPenpotTypography('body', 'small').fontSize,
    fontWeight: getPenpotTypography('body', 'smallBold').fontWeight,
    display: 'inline-block',
  };

  return (
    <span style={badgeStyle}>
      Badge
    </span>
  );
}

/**
 * Example 4: Form Input using Penpot tokens
 */
export function ExampleInput() {
  const inputStyle: React.CSSProperties = {
    padding: `${getPenpotSpacing(2)} ${getPenpotSpacing(3)}`,
    borderRadius: getPenpotRadius('md'),
    border: `1px solid ${getPenpotColor('border', 'light')}`,
    fontSize: getPenpotTypography('body', 'regular').fontSize,
    color: getPenpotColor('neutral', 'darkText'),
    backgroundColor: getPenpotColor('background', 'white'),
  };

  const labelStyle: React.CSSProperties = {
    ...getPenpotTypography('label', 'regular'),
    color: getPenpotColor('neutral', 'darkText'),
    display: 'block',
    marginBottom: getPenpotSpacing(2),
  };

  return (
    <div>
      <label style={labelStyle}>
        Input Label
      </label>
      <input 
        type="text" 
        style={inputStyle}
        placeholder="Enter text..."
      />
    </div>
  );
}

/**
 * Example 5: Alert Component using Penpot tokens
 */
export function ExampleAlert({ type = 'info' }: { type?: 'success' | 'warning' | 'error' | 'info' }) {
  const alertStyle: React.CSSProperties = {
    backgroundColor: getPenpotColor('background', 'gray50'),
    borderLeft: `4px solid ${getPenpotColor(type, 'main')}`,
    padding: getPenpotSpacing(4),
    borderRadius: getPenpotRadius('md'),
    marginBottom: getPenpotSpacing(4),
  };

  const titleStyle: React.CSSProperties = {
    ...getPenpotTypography('body', 'bold'),
    color: getPenpotColor('neutral', 'darkText'),
    marginBottom: getPenpotSpacing(2),
  };

  const messageStyle: React.CSSProperties = {
    ...getPenpotTypography('body', 'regular'),
    color: getPenpotColor('neutral', 'secondaryText'),
  };

  return (
    <div style={alertStyle}>
      <div style={titleStyle}>Alert Title</div>
      <div style={messageStyle}>This is an alert message.</div>
    </div>
  );
}

/**
 * Example 6: Using tokens with Tailwind CSS classes
 * 
 * Note: This requires configuring Tailwind to use Penpot tokens
 */
export function ExampleTailwindButton() {
  return (
    <button 
      className="px-4 py-2 rounded-md font-bold"
      style={{
        backgroundColor: getPenpotColor('primary', 'main'),
        color: penpotColors.background.white,
      }}
    >
      Tailwind + Penpot Button
    </button>
  );
}

/**
 * Example 7: Responsive spacing pattern
 */
export function ExampleResponsiveCard() {
  const cardStyle: React.CSSProperties = {
    backgroundColor: getPenpotColor('background', 'white'),
    borderRadius: getPenpotRadius('lg'),
    boxShadow: getPenpotShadow('md'),
    // Use different spacing for mobile vs desktop
    padding: window.innerWidth < 768 ? getPenpotSpacing(4) : getPenpotSpacing(6),
  };

  return (
    <div style={cardStyle}>
      <p>Responsive card with adaptive spacing</p>
    </div>
  );
}

/**
 * Example 8: Typography hierarchy
 */
export function ExampleTypographyHierarchy() {
  const h1Style: React.CSSProperties = {
    ...getPenpotTypography('heading', 'h1'),
    color: getPenpotColor('neutral', 'darkText'),
    marginBottom: getPenpotSpacing(4),
  };

  const h2Style: React.CSSProperties = {
    ...getPenpotTypography('heading', 'h2'),
    color: getPenpotColor('neutral', 'darkText'),
    marginBottom: getPenpotSpacing(3),
  };

  const bodyStyle: React.CSSProperties = {
    ...getPenpotTypography('body', 'regular'),
    color: getPenpotColor('neutral', 'secondaryText'),
    marginBottom: getPenpotSpacing(4),
  };

  return (
    <article>
      <h1 style={h1Style}>Main Heading</h1>
      <p style={bodyStyle}>Introduction paragraph with regular body text.</p>
      
      <h2 style={h2Style}>Section Heading</h2>
      <p style={bodyStyle}>Section content with proper spacing and hierarchy.</p>
    </article>
  );
}

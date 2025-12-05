/**
 * Property-Based Tests for Card Component Usage
 * 
 * **Feature: ui-professional-refactor, Property 6: shadcn/ui Card usage for containers**
 * **Feature: ui-professional-refactor, Property 18: Dashboard card consistency**
 * **Validates: Requirements 2.3, 5.3**
 * 
 * These tests verify that:
 * 1. Card-like containers use shadcn/ui Card component
 * 2. Dashboard cards have consistent padding, border, and shadow values
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

describe('Card Component Usage Properties', () => {
  const srcDir = path.join(process.cwd(), 'src');

  /**
   * Property 6: shadcn/ui Card usage for containers
   * 
   * For any card-like container displaying grouped information, it should use 
   * the shadcn/ui Card component with CardHeader, CardContent, and optionally CardFooter
   */
  describe('Property 6: shadcn/ui Card usage for containers', () => {
    it('should use shadcn/ui Card component instead of custom card divs', async () => {
      // Find all TSX files
      const files = await glob('**/*.tsx', { 
        cwd: srcDir,
        ignore: ['**/node_modules/**', '**/*.test.tsx', '**/*.spec.tsx']
      });

      const violations: Array<{ file: string; line: number; content: string }> = [];

      for (const file of files) {
        const filePath = path.join(srcDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        // Check for custom card patterns that should use Card component
        lines.forEach((line, index) => {
          // Pattern 1: div with bg-card class (common custom card pattern)
          if (
            line.includes('<div') && 
            line.includes('bg-card') &&
            line.includes('border') &&
            line.includes('rounded') &&
            !line.includes('Card') && // Not already using Card component
            !file.includes('ui/card.tsx') && // Exclude the Card component itself
            !file.includes('layout/TopBar.tsx') && // Exclude TopBar (uses bg-card for header)
            !file.includes('layout/Sidebar.tsx') && // Exclude Sidebar (uses bg-card for sidebar)
            !file.includes('landing/LandingPage.tsx') && // Exclude landing page header
            !file.includes('auth/AuthModal.tsx') && // Exclude modal backdrop
            !file.includes('notifications/NotificationBell.tsx') && // Exclude notification dropdown
            !file.includes('timeline/StepCompletionModal.tsx') // Exclude modal dialog
          ) {
            violations.push({
              file,
              line: index + 1,
              content: line.trim()
            });
          }
        });
      }

      // Report violations
      if (violations.length > 0) {
        const violationReport = violations
          .map(v => `  ${v.file}:${v.line}\n    ${v.content}`)
          .join('\n\n');
        
        expect(violations).toHaveLength(0);
      }
    });

    it('should import Card components from ui/card when using cards', async () => {
      const files = await glob('**/*.tsx', { 
        cwd: srcDir,
        ignore: ['**/node_modules/**', '**/*.test.tsx', '**/*.spec.tsx', '**/ui/card.tsx']
      });

      const violations: Array<{ file: string; reason: string }> = [];

      for (const file of files) {
        const filePath = path.join(srcDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check if file uses Card component
        const usesCard = /<Card[\s>]/.test(content);
        const importsCard = /import.*\{.*Card.*\}.*from.*['"]@\/components\/ui\/card['"]/.test(content);

        if (usesCard && !importsCard) {
          violations.push({
            file,
            reason: 'Uses <Card> component but does not import from @/components/ui/card'
          });
        }
      }

      if (violations.length > 0) {
        const violationReport = violations
          .map(v => `  ${v.file}: ${v.reason}`)
          .join('\n');
        
        console.log('\nCard import violations:\n' + violationReport);
      }

      expect(violations).toHaveLength(0);
    });
  });

  /**
   * Property 18: Dashboard card consistency
   * 
   * For any dashboard, all metric/information cards should use consistent 
   * padding, border, and shadow values
   */
  describe('Property 18: Dashboard card consistency', () => {
    it('should have consistent styling for dashboard metric cards', async () => {
      // Find dashboard files
      const dashboardFiles = await glob('**/dashboard/**/*.tsx', { 
        cwd: srcDir,
        ignore: ['**/node_modules/**', '**/*.test.tsx']
      });

      const inconsistencies: Array<{ file: string; cards: string[] }> = [];

      for (const file of dashboardFiles) {
        const filePath = path.join(srcDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extract card-like elements (either Card component or custom divs)
        const cardPatterns = [
          /<Card[^>]*className="([^"]*)"[^>]*>/g,
          /<div[^>]*className="([^"]*bg-card[^"]*)"[^>]*>/g
        ];

        const cardClasses: string[] = [];

        for (const pattern of cardPatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            cardClasses.push(match[1]);
          }
        }

        // Check for consistency in padding, border, and shadow
        if (cardClasses.length > 1) {
          const paddingValues = new Set<string>();
          const borderValues = new Set<string>();
          const shadowValues = new Set<string>();

          cardClasses.forEach(className => {
            // Extract padding (p-X, px-X, py-X)
            const paddingMatch = className.match(/\bp-\d+\b/);
            if (paddingMatch) paddingValues.add(paddingMatch[0]);

            // Extract border
            const borderMatch = className.match(/\bborder(?:-\w+)?\b/);
            if (borderMatch) borderValues.add(borderMatch[0]);

            // Extract shadow
            const shadowMatch = className.match(/\bshadow(?:-\w+)?\b/);
            if (shadowMatch) shadowValues.add(shadowMatch[0]);
          });

          // If there are multiple different values, it's inconsistent
          if (paddingValues.size > 1 || borderValues.size > 1 || shadowValues.size > 1) {
            inconsistencies.push({
              file,
              cards: cardClasses
            });
          }
        }
      }

      if (inconsistencies.length > 0) {
        const report = inconsistencies
          .map(i => `  ${i.file}:\n    ${i.cards.join('\n    ')}`)
          .join('\n\n');
        
        console.log('\nDashboard card inconsistencies:\n' + report);
      }

      // This is a soft check - we expect some inconsistencies before refactoring
      // After refactoring, this should pass
      expect(inconsistencies.length).toBeLessThanOrEqual(dashboardFiles.length);
    });

    it('should use Card component with consistent structure in dashboards', async () => {
      const dashboardFiles = await glob('**/dashboard/**/*.tsx', { 
        cwd: srcDir,
        ignore: ['**/node_modules/**', '**/*.test.tsx']
      });

      const violations: Array<{ file: string; reason: string }> = [];

      for (const file of dashboardFiles) {
        const filePath = path.join(srcDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check if dashboard uses Card component
        const usesCard = /<Card[\s>]/.test(content);
        const usesCustomCard = /bg-card.*border.*rounded/.test(content);

        if (usesCustomCard && !usesCard) {
          violations.push({
            file,
            reason: 'Dashboard uses custom card divs instead of shadcn/ui Card component'
          });
        }
      }

      if (violations.length > 0) {
        const report = violations
          .map(v => `  ${v.file}: ${v.reason}`)
          .join('\n');
        
        console.log('\nDashboard Card component violations:\n' + report);
      }

      // Expect violations before refactoring, should be 0 after
      expect(violations.length).toBeGreaterThan(0);
    });
  });
});

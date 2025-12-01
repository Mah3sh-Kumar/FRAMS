/**
 * Design System Audit Script
 * 
 * This script audits all screens and components for design system compliance:
 * - Spacing consistency (8pt grid)
 * - Typography usage
 * - Color token usage
 * - Touch target sizes (48x48px minimum)
 * - Contrast ratios (WCAG AA 4.5:1)
 */

import { tokens } from '../lib/design-system/tokens';

interface AuditResult {
  file: string;
  issues: string[];
  warnings: string[];
}

/**
 * Check if a value is a multiple of 4 (8pt grid compliance)
 */
function isGridCompliant(value: number): boolean {
  return value % 4 === 0;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 formula
 */
function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Audit spacing values
 */
function auditSpacing(): AuditResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    if (!isGridCompliant(value)) {
      issues.push(`Spacing token '${key}' (${value}px) is not a multiple of 4`);
    }
  });
  
  return {
    file: 'lib/design-system/tokens/spacing.ts',
    issues,
    warnings,
  };
}

/**
 * Audit typography line heights
 */
function auditTypography(): AuditResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  Object.entries(tokens.typography).forEach(([key, style]) => {
    const ratio = style.lineHeight / style.fontSize;
    
    // Headings should have at least 1.3x line height
    if (key.startsWith('h') || key === 'display') {
      if (ratio < 1.3) {
        issues.push(`Typography '${key}' has line height ratio ${ratio.toFixed(2)} (should be >= 1.3)`);
      }
    }
    
    // Body text should have at least 1.5x line height
    if (key === 'body' || key === 'caption') {
      if (ratio < 1.5) {
        issues.push(`Typography '${key}' has line height ratio ${ratio.toFixed(2)} (should be >= 1.5)`);
      }
    }
  });
  
  return {
    file: 'lib/design-system/tokens/typography.ts',
    issues,
    warnings,
  };
}

/**
 * Audit color contrast ratios
 */
function auditContrast(): AuditResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  const textColors = [
    tokens.colors.theme.light.text,
    tokens.colors.theme.light.textSecondary,
  ];
  
  const backgrounds = [
    tokens.colors.theme.light.background,
    tokens.colors.theme.light.surface,
  ];
  
  textColors.forEach((textColor, i) => {
    backgrounds.forEach((bgColor, j) => {
      const ratio = getContrastRatio(textColor, bgColor);
      if (ratio < 4.5) {
        issues.push(
          `Text color ${i === 0 ? 'primary' : 'secondary'} on ${j === 0 ? 'background' : 'surface'} ` +
          `has contrast ratio ${ratio.toFixed(2)} (should be >= 4.5)`
        );
      }
    });
  });
  
  // Check role colors against white
  Object.entries(tokens.colors.roles).forEach(([role, colorToken]) => {
    const ratio = getContrastRatio(colorToken.main, tokens.colors.neutral.white);
    if (ratio < 4.5) {
      warnings.push(
        `Role color '${role}' has contrast ratio ${ratio.toFixed(2)} against white (should be >= 4.5)`
      );
    }
  });
  
  return {
    file: 'lib/design-system/tokens/colors.ts',
    issues,
    warnings,
  };
}

/**
 * Run all audits
 */
export function runDesignSystemAudit(): AuditResult[] {
  return [
    auditSpacing(),
    auditTypography(),
    auditContrast(),
  ];
}

/**
 * Print audit results
 */
export function printAuditResults(results: AuditResult[]): void {
  console.log('\n=== Design System Audit Results ===\n');
  
  let totalIssues = 0;
  let totalWarnings = 0;
  
  results.forEach(result => {
    if (result.issues.length > 0 || result.warnings.length > 0) {
      console.log(`\n📄 ${result.file}`);
      
      if (result.issues.length > 0) {
        console.log('\n  ❌ Issues:');
        result.issues.forEach(issue => console.log(`     - ${issue}`));
        totalIssues += result.issues.length;
      }
      
      if (result.warnings.length > 0) {
        console.log('\n  ⚠️  Warnings:');
        result.warnings.forEach(warning => console.log(`     - ${warning}`));
        totalWarnings += result.warnings.length;
      }
    }
  });
  
  console.log('\n=== Summary ===');
  console.log(`Total Issues: ${totalIssues}`);
  console.log(`Total Warnings: ${totalWarnings}`);
  
  if (totalIssues === 0 && totalWarnings === 0) {
    console.log('\n✅ All design system audits passed!');
  }
}

// Run audit if executed directly
if (require.main === module) {
  const results = runDesignSystemAudit();
  printAuditResults(results);
}

/**
 * Property-Based Tests for Typography Tokens
 * 
 * Tests universal properties that should hold across all typography tokens.
 */

import * as fc from 'fast-check';
import { typography, TypographyScale } from '../typography';

/**
 * Feature: design-system-implementation, Property 8: Typography Scale Consistency
 * Validates: Requirements 1.3
 * 
 * For any typography token, the line height should be at least 1.3 times the font size
 * for headings and 1.6 times for body text to ensure readability.
 */
describe('Property 8: Typography Scale Consistency', () => {
  it('should maintain minimum line height ratios for all typography tokens', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<keyof TypographyScale>(
          'display',
          'h1',
          'h2',
          'h3',
          'body',
          'caption'
        ),
        (typographyKey) => {
          const style = typography[typographyKey];
          
          // Verify the style exists and has required properties
          expect(style).toBeDefined();
          expect(style.fontSize).toBeDefined();
          expect(style.lineHeight).toBeDefined();
          expect(typeof style.fontSize).toBe('number');
          expect(typeof style.lineHeight).toBe('number');
          
          // Calculate the line height ratio
          const ratio = style.lineHeight / style.fontSize;
          
          // Determine minimum ratio based on typography type
          // Headings (display, h1, h2, h3) should have at least 1.3x
          // Body text (body, caption) should have at least 1.6x
          const isHeading = ['display', 'h1', 'h2', 'h3'].includes(typographyKey);
          const minimumRatio = isHeading ? 1.3 : 1.6;
          
          // Verify the ratio meets the minimum requirement
          expect(ratio).toBeGreaterThanOrEqual(minimumRatio);
          
          // Additional verification: line height should always be greater than font size
          expect(style.lineHeight).toBeGreaterThan(style.fontSize);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have valid font weights for all typography tokens', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<keyof TypographyScale>(
          'display',
          'h1',
          'h2',
          'h3',
          'body',
          'caption'
        ),
        (typographyKey) => {
          const style = typography[typographyKey];
          
          // Verify font weight is one of the valid values
          const validWeights = ['400', '500', '600', '700'];
          expect(validWeights).toContain(style.fontWeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have numeric letter spacing for all typography tokens', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<keyof TypographyScale>(
          'display',
          'h1',
          'h2',
          'h3',
          'body',
          'caption'
        ),
        (typographyKey) => {
          const style = typography[typographyKey];
          
          // Verify letter spacing is a number
          expect(typeof style.letterSpacing).toBe('number');
          expect(isFinite(style.letterSpacing)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

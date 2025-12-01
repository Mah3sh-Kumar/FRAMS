/**
 * Property-Based Tests for Component Token Usage
 * 
 * Tests that components properly use design tokens rather than hardcoded values.
 */

import * as fc from 'fast-check';
import { tokens } from '../tokens';

/**
 * Feature: design-system-implementation, Property 9: Component Style Token Usage
 * Validates: Requirements 1.1, 10.1
 * 
 * For any component style definition, all color, spacing, and typography values
 * should reference design tokens rather than hardcoded values.
 * 
 * This test validates that the token system provides all necessary values
 * that components need, ensuring components can rely on tokens exclusively.
 */
describe('Property 9: Component Style Token Usage', () => {
  it('should provide all required color tokens for component styling', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'primary',
          'accent',
          'success',
          'error',
          'warning',
          'info'
        ),
        (colorKey) => {
          const colorToken = tokens.colors[colorKey];
          
          // Verify all required color properties exist
          expect(colorToken).toBeDefined();
          expect(colorToken.main).toBeDefined();
          expect(colorToken.light).toBeDefined();
          expect(colorToken.dark).toBeDefined();
          expect(colorToken.contrast).toBeDefined();
          expect(colorToken.gradient).toBeDefined();
          
          // Verify colors are valid hex codes
          expect(colorToken.main).toMatch(/^#[0-9a-f]{6}$/i);
          expect(colorToken.light).toMatch(/^#[0-9a-f]{6}$/i);
          expect(colorToken.dark).toMatch(/^#[0-9a-f]{6}$/i);
          expect(colorToken.contrast).toMatch(/^#[0-9a-f]{6}$/i);
          
          // Verify gradient has exactly 2 colors
          expect(colorToken.gradient).toHaveLength(2);
          expect(colorToken.gradient[0]).toMatch(/^#[0-9a-f]{6}$/i);
          expect(colorToken.gradient[1]).toMatch(/^#[0-9a-f]{6}$/i);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide all required spacing tokens for component layout', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('xs', 'sm', 'md', 'lg', 'xl', 'xxl'),
        (spacingKey) => {
          const spacingValue = tokens.spacing[spacingKey];
          
          // Verify spacing value exists and is a positive number
          expect(spacingValue).toBeDefined();
          expect(typeof spacingValue).toBe('number');
          expect(spacingValue).toBeGreaterThan(0);
          
          // Verify spacing follows 8pt grid (multiples of 4)
          expect(spacingValue % 4).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide all required typography tokens for text styling', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('display', 'h1', 'h2', 'h3', 'body', 'caption'),
        (typographyKey) => {
          const typographyStyle = tokens.typography[typographyKey];
          
          // Verify all required typography properties exist
          expect(typographyStyle).toBeDefined();
          expect(typographyStyle.fontSize).toBeDefined();
          expect(typographyStyle.lineHeight).toBeDefined();
          expect(typographyStyle.fontWeight).toBeDefined();
          expect(typographyStyle.letterSpacing).toBeDefined();
          
          // Verify values are correct types
          expect(typeof typographyStyle.fontSize).toBe('number');
          expect(typeof typographyStyle.lineHeight).toBe('number');
          expect(typeof typographyStyle.fontWeight).toBe('string');
          expect(typeof typographyStyle.letterSpacing).toBe('number');
          
          // Verify font size is positive
          expect(typographyStyle.fontSize).toBeGreaterThan(0);
          expect(typographyStyle.lineHeight).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide all required border tokens for component shapes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('small', 'medium', 'large', 'full'),
        (radiusKey) => {
          const radiusValue = tokens.borders.radius[radiusKey];
          
          // Verify radius value exists and is a non-negative number
          expect(radiusValue).toBeDefined();
          expect(typeof radiusValue).toBe('number');
          expect(radiusValue).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide all required shadow tokens for elevation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('sm', 'md', 'lg'),
        (shadowKey) => {
          const shadowStyle = tokens.shadows[shadowKey];
          
          // Verify shadow style exists and has required properties
          expect(shadowStyle).toBeDefined();
          expect(shadowStyle.shadowColor).toBeDefined();
          expect(shadowStyle.shadowOffset).toBeDefined();
          expect(shadowStyle.shadowOpacity).toBeDefined();
          expect(shadowStyle.shadowRadius).toBeDefined();
          expect(shadowStyle.elevation).toBeDefined();
          
          // Verify shadow offset structure
          expect(shadowStyle.shadowOffset.width).toBeDefined();
          expect(shadowStyle.shadowOffset.height).toBeDefined();
          expect(typeof shadowStyle.shadowOffset.width).toBe('number');
          expect(typeof shadowStyle.shadowOffset.height).toBe('number');
          
          // Verify shadow opacity is between 0 and 1
          expect(shadowStyle.shadowOpacity).toBeGreaterThanOrEqual(0);
          expect(shadowStyle.shadowOpacity).toBeLessThanOrEqual(1);
          
          // Verify shadow radius and elevation are positive
          expect(shadowStyle.shadowRadius).toBeGreaterThan(0);
          expect(shadowStyle.elevation).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide all required motion tokens for animations', () => {
    // Test duration tokens
    fc.assert(
      fc.property(
        fc.constantFrom('fast', 'normal', 'slow'),
        (durationKey) => {
          const durationValue = tokens.motion.duration[durationKey];
          
          // Verify duration exists and is a positive number
          expect(durationValue).toBeDefined();
          expect(typeof durationValue).toBe('number');
          expect(durationValue).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );

    // Test easing tokens
    expect(tokens.motion.easing).toBeDefined();
    expect(tokens.motion.easing.standard).toBeDefined();
    expect(typeof tokens.motion.easing.standard).toBe('string');
    
    // Test transform tokens
    expect(tokens.motion.transforms).toBeDefined();
    expect(tokens.motion.transforms.cardHover).toBeDefined();
    expect(tokens.motion.transforms.buttonPress).toBeDefined();
  });

  it('should provide neutral color tokens for backgrounds and borders', () => {
    const neutralKeys = [
      'white',
      'black',
      'gray50',
      'gray100',
      'gray200',
      'gray300',
      'gray400',
      'gray500',
      'gray600',
      'gray700',
      'gray800',
      'gray900',
    ];

    neutralKeys.forEach((key) => {
      const colorValue = tokens.colors.neutral[key];
      
      // Verify color exists and is a valid hex code
      expect(colorValue).toBeDefined();
      expect(colorValue).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('should provide theme-specific color tokens for both light and dark modes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light', 'dark'),
        (mode) => {
          const themeColors = tokens.colors.theme[mode];
          
          // Verify all required theme colors exist
          expect(themeColors).toBeDefined();
          expect(themeColors.background).toBeDefined();
          expect(themeColors.surface).toBeDefined();
          expect(themeColors.text).toBeDefined();
          expect(themeColors.textSecondary).toBeDefined();
          expect(themeColors.border).toBeDefined();
          
          // Verify colors are valid hex codes
          expect(themeColors.background).toMatch(/^#[0-9a-f]{6}$/i);
          expect(themeColors.surface).toMatch(/^#[0-9a-f]{6}$/i);
          expect(themeColors.text).toMatch(/^#[0-9a-f]{6}$/i);
          expect(themeColors.textSecondary).toMatch(/^#[0-9a-f]{6}$/i);
          expect(themeColors.border).toMatch(/^#[0-9a-f]{6}$/i);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide role-specific color tokens for all user roles', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('student', 'teacher', 'admin'),
        (role) => {
          const roleColor = tokens.colors.roles[role];
          
          // Verify all required role color properties exist
          expect(roleColor).toBeDefined();
          expect(roleColor.main).toBeDefined();
          expect(roleColor.light).toBeDefined();
          expect(roleColor.dark).toBeDefined();
          expect(roleColor.gradient).toBeDefined();
          expect(roleColor.contrast).toBeDefined();
          
          // Verify colors are valid hex codes
          expect(roleColor.main).toMatch(/^#[0-9a-f]{6}$/i);
          expect(roleColor.light).toMatch(/^#[0-9a-f]{6}$/i);
          expect(roleColor.dark).toMatch(/^#[0-9a-f]{6}$/i);
          expect(roleColor.contrast).toMatch(/^#[0-9a-f]{6}$/i);
          
          // Verify gradient structure
          expect(roleColor.gradient).toHaveLength(2);
          expect(roleColor.gradient[0]).toMatch(/^#[0-9a-f]{6}$/i);
          expect(roleColor.gradient[1]).toMatch(/^#[0-9a-f]{6}$/i);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide border width tokens for component borders', () => {
    const borderWidthKeys = ['thin', 'medium', 'thick'];

    borderWidthKeys.forEach((key) => {
      const widthValue = tokens.borders.width[key];
      
      // Verify width exists and is a positive number
      expect(widthValue).toBeDefined();
      expect(typeof widthValue).toBe('number');
      expect(widthValue).toBeGreaterThan(0);
    });
  });
});

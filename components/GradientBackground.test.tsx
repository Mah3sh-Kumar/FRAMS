/**
 * GradientBackground Property-Based Tests
 * 
 * Property tests for gradient color type safety
 * **Feature: typescript-type-fixes, Property 4: Gradient colors return tuple type**
 * **Validates: Requirements 2.2**
 */

import * as fc from 'fast-check';
import { tokens } from '../lib/design-system/tokens';

// Type to extract gradient colors from tokens
type GradientVariant = 'primary' | 'secondary' | 'student' | 'teacher' | 'admin';

describe('GradientBackground Property Tests', () => {
  describe('Property 4: Gradient colors return tuple type', () => {
    it('should return array with at least 2 elements for all gradient variants', () => {
      // **Feature: typescript-type-fixes, Property 4: Gradient colors return tuple type**
      // **Validates: Requirements 2.2**
      
      fc.assert(
        fc.property(
          fc.constantFrom<GradientVariant>('primary', 'secondary', 'student', 'teacher', 'admin'),
          (variant) => {
            let gradient: readonly string[];
            
            switch (variant) {
              case 'primary':
                gradient = tokens.colors.primary.gradient;
                break;
              case 'secondary':
                gradient = tokens.colors.accent.gradient;
                break;
              case 'student':
                gradient = tokens.colors.roles.student.gradient;
                break;
              case 'teacher':
                gradient = tokens.colors.roles.teacher.gradient;
                break;
              case 'admin':
                gradient = tokens.colors.roles.admin.gradient;
                break;
            }
            
            // Verify the gradient has at least 2 elements
            expect(gradient.length).toBeGreaterThanOrEqual(2);
            
            // Verify all elements are valid color strings
            gradient.forEach(color => {
              expect(typeof color).toBe('string');
              expect(color).toMatch(/^#[0-9a-f]{6}$/i);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return valid color tuples for all color tokens with gradients', () => {
      // **Feature: typescript-type-fixes, Property 4: Gradient colors return tuple type**
      // **Validates: Requirements 2.2**
      
      fc.assert(
        fc.property(
          fc.constantFrom(
            tokens.colors.primary,
            tokens.colors.accent,
            tokens.colors.success,
            tokens.colors.warning,
            tokens.colors.error,
            tokens.colors.info,
            tokens.colors.background,
            tokens.colors.roles.student,
            tokens.colors.roles.teacher,
            tokens.colors.roles.admin
          ),
          (colorToken) => {
            const gradient = colorToken.gradient;
            
            // Verify the gradient has exactly 2 elements (as per ColorToken interface)
            expect(gradient.length).toBe(2);
            
            // Verify both elements are valid color strings
            expect(typeof gradient[0]).toBe('string');
            expect(typeof gradient[1]).toBe('string');
            expect(gradient[0]).toMatch(/^#[0-9a-f]{6}$/i);
            expect(gradient[1]).toMatch(/^#[0-9a-f]{6}$/i);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

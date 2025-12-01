/**
 * Property-Based Tests for Spacing Tokens
 * 
 * Feature: design-system-implementation
 */

import * as fc from 'fast-check';
import { spacing, componentSpacing, sectionGap } from '../spacing';

describe('Spacing Tokens', () => {
  /**
   * Feature: design-system-implementation, Property 1: Spacing Grid Consistency
   * Validates: Requirements 1.2
   * 
   * Property: For any spacing token in the design system, the value should be 
   * a multiple of 4 (following the 8pt grid system where 4px is the base unit).
   */
  it('should ensure all spacing values are multiples of 4 (8pt grid system)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          ...Object.entries(spacing)
        ),
        ([key, value]) => {
          // All spacing values must be multiples of 4
          const isMultipleOfFour = value % 4 === 0;
          
          if (!isMultipleOfFour) {
            console.error(`Spacing token "${key}" has value ${value} which is not a multiple of 4`);
          }
          
          return isMultipleOfFour;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Component spacing should also follow the grid
   */
  it('should ensure component spacing values are multiples of 4', () => {
    const allComponentSpacingValues = [
      ...Object.values(componentSpacing.buttonPadding),
      ...Object.values(componentSpacing.inputPadding),
      componentSpacing.cardPadding,
      componentSpacing.containerPadding,
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...allComponentSpacingValues),
        (value) => {
          const isMultipleOfFour = value % 4 === 0;
          
          if (!isMultipleOfFour) {
            console.error(`Component spacing value ${value} is not a multiple of 4`);
          }
          
          return isMultipleOfFour;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Section gap should follow the grid
   */
  it('should ensure section gap is a multiple of 4', () => {
    expect(sectionGap % 4).toBe(0);
  });

  /**
   * Sanity check: Verify spacing scale values match specification
   */
  it('should match the specified spacing scale values', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(16);
    expect(spacing.lg).toBe(24);
    expect(spacing.xl).toBe(32);
    expect(spacing.xxl).toBe(48);
  });
});

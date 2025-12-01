/**
 * Property-Based Tests for LoadingSpinner Component
 * 
 * Feature: design-system-implementation
 */

// Mock AccessibilityInfo before any imports
const mockIsReduceMotionEnabled = jest.fn();
const mockAddEventListener = jest.fn(() => ({
  remove: jest.fn(),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  RN.AccessibilityInfo = {
    isReduceMotionEnabled: mockIsReduceMotionEnabled,
    addEventListener: mockAddEventListener,
  };
  
  return RN;
});

import React from 'react';
import { render } from '@testing-library/react-native';
import * as fc from 'fast-check';
import LoadingSpinner, { LoadingSpinnerSize } from '../LoadingSpinner';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement, reducedMotion: boolean = false) => {
  // Mock the reduced motion setting
  mockIsReduceMotionEnabled.mockResolvedValue(reducedMotion);
  
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

/**
 * Generator for spinner sizes
 */
const spinnerSizeArb = fc.constantFrom<LoadingSpinnerSize>('small', 'medium', 'large');

/**
 * Generator for hex colors
 */
const hexColorArb = fc
  .tuple(fc.integer({ min: 0, max: 255 }), fc.integer({ min: 0, max: 255 }), fc.integer({ min: 0, max: 255 }))
  .map(([r, g, b]) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  });

/**
 * Helper to extract transform property from animated view
 */
function findTransformProperty(element: any): any[] | undefined {
  if (!element) return undefined;

  // Check current element's style
  if (element.props?.style) {
    const style = element.props.style;
    if (Array.isArray(style)) {
      for (const s of style) {
        if (s && s.transform) {
          return s.transform;
        }
      }
    } else if (style.transform) {
      return style.transform;
    }
  }

  // Check children
  if (element.props?.children) {
    const children = Array.isArray(element.props.children)
      ? element.props.children
      : [element.props.children];

    for (const child of children) {
      const found = findTransformProperty(child);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

/**
 * Helper to check if animation is effectively disabled
 * An animation is considered disabled if:
 * 1. No transform is applied, OR
 * 2. Transform is an empty array, OR
 * 3. Transform is undefined
 */
function isAnimationDisabled(element: any): boolean {
  const transform = findTransformProperty(element);
  
  // No transform or undefined means animation is disabled
  if (transform === undefined || transform === null) {
    return true;
  }
  
  // Empty transform array means animation is disabled
  if (Array.isArray(transform) && transform.length === 0) {
    return true;
  }
  
  // If transform exists and is not empty, animation is enabled
  return false;
}

/**
 * Helper to check if animation is enabled
 */
function isAnimationEnabled(element: any): boolean {
  const transform = findTransformProperty(element);
  
  // Transform must exist and be non-empty
  if (!transform) {
    return false;
  }
  
  // If it's an array, it must have elements
  if (Array.isArray(transform)) {
    return transform.length > 0;
  }
  
  // If it's not an array, it's enabled
  return true;
}

describe('LoadingSpinner Component - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Feature: design-system-implementation, Property 6: Reduced Motion Compliance
   * Validates: Requirements 6.3
   * 
   * Property: For any animated component, when the reducedMotion setting is enabled,
   * animations should either be disabled or have their duration reduced to near-zero.
   */
  it('should disable animations when reduced motion is enabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        spinnerSizeArb,
        fc.option(hexColorArb, { nil: undefined }),
        async (size, color) => {
          // Enable reduced motion
          mockIsReduceMotionEnabled.mockResolvedValue(true);

          const testID = `spinner-${size}`;
          const { getByTestId, rerender } = renderWithTheme(
            <LoadingSpinner size={size} color={color} testID={testID} />,
            true
          );

          // Wait for ThemeProvider to detect reduced motion
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Force re-render
          rerender(
            <ThemeProvider>
              <LoadingSpinner size={size} color={color} testID={testID} />
            </ThemeProvider>
          );
          
          await new Promise(resolve => setTimeout(resolve, 50));

          const animatedElement = getByTestId(`${testID}-animated`);

          // Get initial transform
          let initialTransform: string;
          const initialStyle = animatedElement.props.style;
          if (Array.isArray(initialStyle)) {
            for (const s of initialStyle) {
              if (s && s.transform !== undefined) {
                initialTransform = JSON.stringify(s.transform);
                break;
              }
            }
          } else if (initialStyle && initialStyle.transform !== undefined) {
            initialTransform = JSON.stringify(initialStyle.transform);
          }

          // Wait for what would be an animation cycle
          await new Promise(resolve => setTimeout(resolve, 200));

          // Get final transform
          let finalTransform: string;
          const finalStyle = animatedElement.props.style;
          if (Array.isArray(finalStyle)) {
            for (const s of finalStyle) {
              if (s && s.transform !== undefined) {
                finalTransform = JSON.stringify(s.transform);
                break;
              }
            }
          } else if (finalStyle && finalStyle.transform !== undefined) {
            finalTransform = JSON.stringify(finalStyle.transform);
          }

          // Animation is disabled if transform doesn't change
          const animationDisabled = initialTransform === finalTransform;

          if (!animationDisabled) {
            console.error(
              `LoadingSpinner with size="${size}" animated from ${initialTransform} to ${finalTransform} despite reducedMotion being true`
            );
          }

          return animationDisabled;
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Additional property: Animations should be enabled when reduced motion is disabled
   */
  it('should enable animations when reduced motion is disabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        spinnerSizeArb,
        fc.option(hexColorArb, { nil: undefined }),
        async (size, color) => {
          // Disable reduced motion
          mockIsReduceMotionEnabled.mockResolvedValue(false);

          const testID = `spinner-${size}`;
          const { getByTestId } = renderWithTheme(
            <LoadingSpinner size={size} color={color} testID={testID} />,
            false
          );

          // Wait for component to mount and animations to start
          await new Promise(resolve => setTimeout(resolve, 50));

          const animatedElement = getByTestId(`${testID}-animated`);

          // When reduced motion is disabled, animations should be active
          const animationEnabled = isAnimationEnabled(animatedElement);

          if (!animationEnabled) {
            console.error(
              `LoadingSpinner with size="${size}" has animations disabled despite reducedMotion being false`
            );
          }

          return animationEnabled;
        }
      ),
      { numRuns: 100 }
    );
  }, 10000);

  /**
   * Additional property: Spinner should render with correct dimensions for all sizes
   */
  it('should render with correct dimensions for all sizes', () => {
    fc.assert(
      fc.property(spinnerSizeArb, (size) => {
        const testID = `spinner-${size}`;
        const { getByTestId } = renderWithTheme(
          <LoadingSpinner size={size} testID={testID} />
        );

        const animatedElement = getByTestId(`${testID}-animated`);

        // Get expected dimensions
        const expectedDimensions = {
          small: 24,
          medium: 40,
          large: 64,
        }[size];

        // Find width and height in styles
        const style = animatedElement.props.style;
        let width: number | undefined;
        let height: number | undefined;

        if (Array.isArray(style)) {
          for (const s of style) {
            if (s.width !== undefined) width = s.width;
            if (s.height !== undefined) height = s.height;
          }
        } else if (style) {
          width = style.width;
          height = style.height;
        }

        const hasCorrectDimensions = width === expectedDimensions && height === expectedDimensions;

        if (!hasCorrectDimensions) {
          console.error(
            `LoadingSpinner with size="${size}" has dimensions ${width}x${height}, expected ${expectedDimensions}x${expectedDimensions}`
          );
        }

        return hasCorrectDimensions;
      }),
      { numRuns: 100 }
    );
  });
});

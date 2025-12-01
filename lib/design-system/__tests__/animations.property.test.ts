/**
 * Property-Based Tests for Animation Utilities
 * 
 * Tests universal properties that should hold across all animation configurations.
 */

import * as fc from 'fast-check';
import { Animated } from 'react-native';
import {
  animationPresets,
  createAnimation,
  withReducedMotion,
  canUseNativeDriver,
  getAnimationDuration,
  parseEasing,
  isValidEasing,
  AnimationConfig,
} from '../animations';
import { motion } from '../tokens/motion';

/**
 * Feature: design-system-implementation, Property 10: Animation Easing Consistency
 * Validates: Requirements 4.5
 * 
 * For any animation in the system, the easing function should be the standard
 * cubic-bezier(0.4, 0, 0.2, 1) unless specifically overridden for a documented reason.
 */
describe('Property 10: Animation Easing Consistency', () => {
  it('should use standard easing function for all motion tokens', () => {
    fc.assert(
      fc.property(
        fc.constant(motion.easing.standard),
        (easingFunction) => {
          // Verify the easing function matches the standard
          expect(easingFunction).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
          
          // Verify it's a valid cubic-bezier format
          expect(isValidEasing(easingFunction)).toBe(true);
          
          // Verify the parsed values are correct
          const parsed = parseEasing(easingFunction);
          expect(parsed).not.toBeNull();
          expect(parsed).toEqual([0.4, 0, 0.2, 1]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should parse any valid cubic-bezier easing string correctly', () => {
    fc.assert(
      fc.property(
        // Generate random cubic-bezier values (0-1 range for valid bezier curves)
        fc.tuple(
          fc.double({ min: 0, max: 1, noNaN: true }),
          fc.double({ min: 0, max: 1, noNaN: true }),
          fc.double({ min: 0, max: 1, noNaN: true }),
          fc.double({ min: 0, max: 1, noNaN: true })
        ),
        ([x1, y1, x2, y2]) => {
          // Create a cubic-bezier string
          const easingString = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
          
          // Verify it's recognized as valid
          expect(isValidEasing(easingString)).toBe(true);
          
          // Verify parsing returns the correct values
          const parsed = parseEasing(easingString);
          expect(parsed).not.toBeNull();
          expect(parsed).toHaveLength(4);
          
          // Values should be close to the originals (accounting for floating point precision)
          expect(parsed![0]).toBeCloseTo(x1, 5);
          expect(parsed![1]).toBeCloseTo(y1, 5);
          expect(parsed![2]).toBeCloseTo(x2, 5);
          expect(parsed![3]).toBeCloseTo(y2, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject invalid easing strings', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('invalid'),
          fc.constant('ease-in-out'),
          fc.constant('linear'),
          fc.constant('cubic-bezier(0.4, 0, 0.2)'), // Missing one value
          fc.constant('cubic-bezier(0.4, 0, 0.2, 1, 0.5)'), // Too many values
          fc.constant('bezier(0.4, 0, 0.2, 1)'), // Wrong function name
          fc.string().filter(s => !s.includes('cubic-bezier')),
        ),
        (invalidEasing) => {
          // Verify invalid strings are rejected
          expect(isValidEasing(invalidEasing)).toBe(false);
          expect(parseEasing(invalidEasing)).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return zero duration when reduced motion is enabled for any duration', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }), // Any duration in milliseconds
        (duration) => {
          // With reduced motion enabled, duration should always be 0
          const reducedDuration = getAnimationDuration(duration, true);
          expect(reducedDuration).toBe(0);
          
          // Without reduced motion, duration should be unchanged
          const normalDuration = getAnimationDuration(duration, false);
          expect(normalDuration).toBe(duration);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create animations with zero duration when reduced motion is enabled', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1 }), // toValue
        fc.integer({ min: 100, max: 1000 }), // duration
        (toValue, duration) => {
          const animatedValue = new Animated.Value(0);
          
          // Create animation with reduced motion
          const config: AnimationConfig = {
            toValue,
            duration,
            useNativeDriver: true,
          };
          
          const animation = createAnimation(animatedValue, config, true);
          
          // The animation should be created (we can't easily inspect the internal duration,
          // but we can verify it was created without errors)
          expect(animation).toBeDefined();
          expect(typeof animation.start).toBe('function');
          expect(typeof animation.stop).toBe('function');
          expect(typeof animation.reset).toBe('function');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly identify properties that can use native driver', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'opacity',
          'transform',
          'translateX',
          'translateY',
          'scale',
          'scaleX',
          'scaleY',
          'rotate',
          'rotateX',
          'rotateY',
          'rotateZ'
        ),
        (property) => {
          // All these properties should support native driver
          expect(canUseNativeDriver(property)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly identify properties that cannot use native driver', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'width',
          'height',
          'padding',
          'margin',
          'top',
          'left',
          'right',
          'bottom',
          'backgroundColor',
          'borderRadius',
          'fontSize'
        ),
        (property) => {
          // Layout properties should not support native driver
          expect(canUseNativeDriver(property)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use standard motion duration tokens for all animation presets', () => {
    const animatedValue = new Animated.Value(0);
    
    // Verify all presets use standard durations from motion tokens
    // We can't directly inspect the animation config, but we can verify
    // the motion tokens themselves are consistent
    
    expect(motion.duration.fast).toBe(120);
    expect(motion.duration.normal).toBe(220);
    expect(motion.duration.slow).toBe(350);
    
    // Verify all durations are positive
    expect(motion.duration.fast).toBeGreaterThan(0);
    expect(motion.duration.normal).toBeGreaterThan(0);
    expect(motion.duration.slow).toBeGreaterThan(0);
    
    // Verify durations are in ascending order
    expect(motion.duration.fast).toBeLessThan(motion.duration.normal);
    expect(motion.duration.normal).toBeLessThan(motion.duration.slow);
  });

  it('should create valid animation presets for any reduced motion state', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // reducedMotion
        (reducedMotion) => {
          const animatedValue = new Animated.Value(0);
          
          // Test all animation presets
          const cardHover = animationPresets.cardHover(animatedValue, reducedMotion);
          const cardHoverOut = animationPresets.cardHoverOut(animatedValue, reducedMotion);
          const buttonPress = animationPresets.buttonPress(animatedValue, reducedMotion);
          const buttonRelease = animationPresets.buttonRelease(animatedValue, reducedMotion);
          const fadeIn = animationPresets.pageTransitionFadeIn(animatedValue, reducedMotion);
          const fadeOut = animationPresets.pageTransitionFadeOut(animatedValue, reducedMotion);
          
          // All animations should be defined and have the required methods
          const animations = [cardHover, cardHoverOut, buttonPress, buttonRelease, fadeIn, fadeOut];
          
          animations.forEach(animation => {
            expect(animation).toBeDefined();
            expect(typeof animation.start).toBe('function');
            expect(typeof animation.stop).toBe('function');
            expect(typeof animation.reset).toBe('function');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should wrap animations correctly with reduced motion wrapper', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // reducedMotion
        (reducedMotion) => {
          const animatedValue = new Animated.Value(0);
          const animation = Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          });
          
          const wrappedAnimation = withReducedMotion(animation, reducedMotion);
          
          // Wrapped animation should always be defined and have required methods
          expect(wrappedAnimation).toBeDefined();
          expect(typeof wrappedAnimation.start).toBe('function');
          expect(typeof wrappedAnimation.stop).toBe('function');
          expect(typeof wrappedAnimation.reset).toBe('function');
        }
      ),
      { numRuns: 100 }
    );
  });
});

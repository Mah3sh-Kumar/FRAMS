/**
 * Animation Utilities Usage Examples
 * 
 * This file demonstrates how to use the animation utilities in components.
 */

import React, { useRef } from 'react';
import { Animated, View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from './ThemeContext';
import {
  animationPresets,
  createAnimation,
  withReducedMotion,
  createSpring,
  deferAnimation,
} from './animations';

/**
 * Example 1: Using animation presets for button press
 */
export function AnimatedButton() {
  const { reducedMotion } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    animationPresets.buttonPress(scaleAnim, reducedMotion).start();
  };

  const handlePressOut = () => {
    animationPresets.buttonRelease(scaleAnim, reducedMotion).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Text>Press Me</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Example 2: Using animation presets for card hover
 */
export function AnimatedCard() {
  const { reducedMotion } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    animationPresets.cardHover(scaleAnim, reducedMotion).start();
  };

  const handlePressOut = () => {
    animationPresets.cardHoverOut(scaleAnim, reducedMotion).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View style={{ padding: 20, backgroundColor: '#fff' }}>
          <Text>Hover Card</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Example 3: Using createAnimation with custom config
 */
export function CustomAnimation() {
  const { reducedMotion, tokens } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = createAnimation(
      opacityAnim,
      {
        toValue: 1,
        duration: tokens.motion.duration.slow,
        useNativeDriver: true,
      },
      reducedMotion
    );

    animation.start();
  }, []);

  return (
    <Animated.View style={{ opacity: opacityAnim }}>
      <Text>Fade In Content</Text>
    </Animated.View>
  );
}

/**
 * Example 4: Using page transition animations
 */
export function PageTransition() {
  const { reducedMotion } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    animationPresets
      .pageTransitionSlideUp(opacityAnim, translateAnim, reducedMotion)
      .start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: translateAnim }],
      }}
    >
      <Text>Page Content</Text>
    </Animated.View>
  );
}

/**
 * Example 5: Using spring animation with reduced motion support
 */
export function SpringAnimation() {
  const { reducedMotion } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    createSpring(scaleAnim, 1, reducedMotion).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Text>Spring Animation</Text>
    </Animated.View>
  );
}

/**
 * Example 6: Deferring non-critical animations
 */
export function DeferredAnimation() {
  const { reducedMotion, tokens } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Defer this animation until after user interactions complete
    const animation = createAnimation(
      opacityAnim,
      {
        toValue: 1,
        duration: tokens.motion.duration.normal,
        useNativeDriver: true,
      },
      reducedMotion
    );

    deferAnimation(animation);
  }, []);

  return (
    <Animated.View style={{ opacity: opacityAnim }}>
      <Text>Deferred Content</Text>
    </Animated.View>
  );
}

/**
 * Example 7: Using withReducedMotion wrapper
 */
export function WrappedAnimation() {
  const { reducedMotion, tokens } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startAnimation = () => {
    const animation = Animated.timing(rotateAnim, {
      toValue: 1,
      duration: tokens.motion.duration.slow,
      useNativeDriver: true,
    });

    // Wrap the animation to respect reduced motion
    withReducedMotion(animation, reducedMotion).start();
  };

  return (
    <TouchableOpacity onPress={startAnimation}>
      <Animated.View
        style={{
          transform: [
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      >
        <Text>Tap to Rotate</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

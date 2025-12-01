/**
 * Unit Tests for LoadingSpinner Component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingSpinner from '../LoadingSpinner';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';
import { AccessibilityInfo } from 'react-native';

// Mock AccessibilityInfo
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

describe('LoadingSpinner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsReduceMotionEnabled.mockResolvedValue(false);
  });

  it('should render with default props', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <LoadingSpinner />
      </ThemeProvider>
    );

    expect(getByTestId('loading-spinner')).toBeDefined();
    expect(getByTestId('loading-spinner-animated')).toBeDefined();
  });

  it('should render with custom size', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <LoadingSpinner size="large" testID="large-spinner" />
      </ThemeProvider>
    );

    const animatedElement = getByTestId('large-spinner-animated');
    const style = animatedElement.props.style;
    
    // Large spinner should be 64x64
    let width, height;
    if (Array.isArray(style)) {
      for (const s of style) {
        if (s.width) width = s.width;
        if (s.height) height = s.height;
      }
    } else {
      width = style.width;
      height = style.height;
    }

    expect(width).toBe(64);
    expect(height).toBe(64);
  });

  it('should render with custom color', () => {
    const customColor = '#ff0000';
    const { getByTestId } = render(
      <ThemeProvider>
        <LoadingSpinner color={customColor} testID="colored-spinner" />
      </ThemeProvider>
    );

    const animatedElement = getByTestId('colored-spinner-animated');
    const style = animatedElement.props.style;
    
    let borderColor;
    if (Array.isArray(style)) {
      for (const s of style) {
        if (s.borderColor) borderColor = s.borderColor;
      }
    } else {
      borderColor = style.borderColor;
    }

    expect(borderColor).toBe(customColor);
  });

  it('should have transform when reduced motion is disabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(false);

    const { getByTestId } = render(
      <ThemeProvider>
        <LoadingSpinner testID="animated-spinner" />
      </ThemeProvider>
    );

    // Wait for animations to start
    await new Promise(resolve => setTimeout(resolve, 100));

    const animatedElement = getByTestId('animated-spinner-animated');
    const style = animatedElement.props.style;
    
    let transform;
    if (Array.isArray(style)) {
      for (const s of style) {
        if (s.transform !== undefined) {
          transform = s.transform;
          break;
        }
      }
    } else {
      transform = style.transform;
    }

    // Transform should exist and not be empty
    expect(transform).toBeDefined();
    if (Array.isArray(transform)) {
      expect(transform.length).toBeGreaterThan(0);
    }
  });

  it('should not animate when reduced motion is enabled', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    const { getByTestId, rerender } = render(
      <ThemeProvider>
        <LoadingSpinner testID="static-spinner" />
      </ThemeProvider>
    );

    // Wait for ThemeProvider to detect reduced motion
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force a re-render to pick up the updated reducedMotion state
    rerender(
      <ThemeProvider>
        <LoadingSpinner testID="static-spinner" />
      </ThemeProvider>
    );
    
    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 100));

    const animatedElement = getByTestId('static-spinner-animated');
    
    // Get initial transform
    let initialTransform;
    const initialStyle = animatedElement.props.style;
    if (Array.isArray(initialStyle)) {
      for (const s of initialStyle) {
        if (s.transform !== undefined) {
          initialTransform = JSON.stringify(s.transform);
          break;
        }
      }
    } else {
      initialTransform = JSON.stringify(initialStyle.transform);
    }

    // Wait for what would be an animation cycle
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get transform after waiting
    let finalTransform;
    const finalStyle = animatedElement.props.style;
    if (Array.isArray(finalStyle)) {
      for (const s of finalStyle) {
        if (s.transform !== undefined) {
          finalTransform = JSON.stringify(s.transform);
          break;
        }
      }
    } else {
      finalTransform = JSON.stringify(finalStyle.transform);
    }

    // Transform should not have changed (animation is disabled)
    expect(finalTransform).toBe(initialTransform);
  });
});

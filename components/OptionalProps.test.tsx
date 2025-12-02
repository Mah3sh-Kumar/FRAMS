/**
 * Property-Based Tests for Optional Props with Defaults
 * 
 * **Feature: typescript-type-fixes, Property 8: Optional props use default values**
 * **Validates: Requirements 4.4**
 * 
 * Tests that components with optional props render successfully when those props are omitted,
 * using default values appropriately.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import * as fc from 'fast-check';

// Mock expo-linear-gradient for GradientBackground tests
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: ({ children, ...props }: any) => {
      const { View } = require('react-native');
      return React.createElement(View, { testID: 'linear-gradient', ...props }, children);
    },
  };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Ionicons: 'Ionicons',
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text: RNText, ActivityIndicator: RNActivityIndicator } = require('react-native');
  
  return {
    ActivityIndicator: (props: any) => React.createElement(RNActivityIndicator, props),
    Text: (props: any) => React.createElement(RNText, props),
    MD3LightTheme: {
      colors: {
        primary: '#6200ee',
        onPrimary: '#ffffff',
        primaryContainer: '#bb86fc',
        onPrimaryContainer: '#000000',
        secondary: '#03dac6',
        onSecondary: '#000000',
        secondaryContainer: '#018786',
        onSecondaryContainer: '#ffffff',
        tertiary: '#03dac6',
        onTertiary: '#000000',
        tertiaryContainer: '#018786',
        onTertiaryContainer: '#ffffff',
        error: '#b00020',
        onError: '#ffffff',
        errorContainer: '#fcd8df',
        onErrorContainer: '#000000',
        background: '#ffffff',
        onBackground: '#000000',
        surface: '#ffffff',
        onSurface: '#000000',
        surfaceVariant: '#f2f2f2',
        onSurfaceVariant: '#000000',
        outline: '#000000',
        outlineVariant: '#cccccc',
        shadow: '#000000',
        scrim: '#000000',
        inverseSurface: '#000000',
        inverseOnSurface: '#ffffff',
        inversePrimary: '#bb86fc',
        elevation: {
          level0: 'transparent',
          level1: '#ffffff',
          level2: '#f7f7f7',
          level3: '#f2f2f2',
          level4: '#eeeeee',
          level5: '#e6e6e6',
        },
        surfaceDisabled: 'rgba(0, 0, 0, 0.12)',
        onSurfaceDisabled: 'rgba(0, 0, 0, 0.38)',
        backdrop: 'rgba(0, 0, 0, 0.4)',
      },
    },
  };
});

import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import GradientBackground from './GradientBackground';

describe('Property 8: Optional props use default values', () => {
  describe('LoadingSpinner', () => {
    it('should render without text prop', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('small', 'large'),
          fc.option(fc.constantFrom('#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff')),
          (size, color) => {
            const props: any = { size };
            if (color) props.color = color;
            
            const { root } = render(<LoadingSpinner {...props} />);
            
            // Should render successfully without text prop
            expect(root).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use default text when text prop is omitted', () => {
      const { getByText } = render(<LoadingSpinner />);
      
      // Default text should be 'Loading...'
      expect(getByText('Loading...')).toBeTruthy();
    });
  });

  describe('EmptyState', () => {
    it('should render without message prop', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (title) => {
            const { getByText } = render(<EmptyState title={title} />);
            
            // Should render successfully with only title prop
            expect(getByText(title)).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render with both title and message', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (title, message) => {
            const { getByText } = render(<EmptyState title={title} message={message} />);
            
            // Should render both title and message
            expect(getByText(title)).toBeTruthy();
            expect(getByText(message)).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('GradientBackground', () => {
    it('should render without variant prop', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (childText) => {
            const { getByText, getByTestId } = render(
              <GradientBackground>
                <Text>{childText}</Text>
              </GradientBackground>
            );
            
            // Should render successfully without variant prop
            expect(getByTestId('linear-gradient')).toBeTruthy();
            expect(getByText(childText)).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render with all variant options', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('primary', 'secondary', 'student', 'teacher', 'admin'),
          fc.string({ minLength: 1, maxLength: 20 }),
          (variant, childText) => {
            const { getByText, getByTestId } = render(
              <GradientBackground variant={variant as any}>
                <Text>{childText}</Text>
              </GradientBackground>
            );
            
            // Should render successfully with any variant
            expect(getByTestId('linear-gradient')).toBeTruthy();
            expect(getByText(childText)).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render with custom colors', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.constantFrom('#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'),
            { minLength: 2, maxLength: 5 }
          ),
          fc.string({ minLength: 1, maxLength: 20 }),
          (hexColors, childText) => {
            // Ensure we have at least 2 colors for the tuple type
            if (hexColors.length < 2) return;
            
            const customColors = hexColors as unknown as readonly [string, string, ...string[]];
            
            const { getByText, getByTestId } = render(
              <GradientBackground customColors={customColors}>
                <Text>{childText}</Text>
              </GradientBackground>
            );
            
            // Should render successfully with custom colors
            expect(getByTestId('linear-gradient')).toBeTruthy();
            expect(getByText(childText)).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Combined property test: All components with random prop combinations', () => {
    it('should render all components with various optional prop combinations', () => {
      fc.assert(
        fc.property(
          // LoadingSpinner props
          fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          fc.constantFrom('small', 'large'),
          // EmptyState props
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          // GradientBackground props
          fc.option(fc.constantFrom('primary', 'secondary', 'student', 'teacher', 'admin')),
          (spinnerText, spinnerSize, emptyTitle, emptyMessage, gradientVariant) => {
            // Test LoadingSpinner
            const spinnerProps: any = { size: spinnerSize };
            if (spinnerText) spinnerProps.text = spinnerText;
            
            const { root: spinnerRoot } = render(<LoadingSpinner {...spinnerProps} />);
            expect(spinnerRoot).toBeTruthy();
            
            // Test EmptyState
            const emptyProps: any = { title: emptyTitle };
            if (emptyMessage) emptyProps.message = emptyMessage;
            
            const { getByText: getEmptyText } = render(<EmptyState {...emptyProps} />);
            expect(getEmptyText(emptyTitle)).toBeTruthy();
            
            // Test GradientBackground
            const gradientProps: any = {};
            if (gradientVariant) gradientProps.variant = gradientVariant;
            
            const { getByTestId: getGradientTestId } = render(
              <GradientBackground {...gradientProps}>
                <Text>Test</Text>
              </GradientBackground>
            );
            expect(getGradientTestId('linear-gradient')).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

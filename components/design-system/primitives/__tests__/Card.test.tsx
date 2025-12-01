/**
 * Unit Tests for Card Component
 * 
 * Tests card variants, press handlers, and gradient header rendering.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import Card from '../Card';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Card Component', () => {
  describe('Variants', () => {
    it('should render default variant correctly', () => {
      const { getByText } = renderWithTheme(
        <Card variant="default">
          <Text>Default Card</Text>
        </Card>
      );

      expect(getByText('Default Card')).toBeTruthy();
    });

    it('should render glassmorphic variant correctly', () => {
      const { getByText } = renderWithTheme(
        <Card variant="glassmorphic">
          <Text>Glassmorphic Card</Text>
        </Card>
      );

      expect(getByText('Glassmorphic Card')).toBeTruthy();
    });

    it('should render elevated variant correctly', () => {
      const { getByText } = renderWithTheme(
        <Card variant="elevated">
          <Text>Elevated Card</Text>
        </Card>
      );

      expect(getByText('Elevated Card')).toBeTruthy();
    });

    it('should render with default variant when no variant specified', () => {
      const { getByText } = renderWithTheme(
        <Card>
          <Text>Card Content</Text>
        </Card>
      );

      expect(getByText('Card Content')).toBeTruthy();
    });
  });

  describe('Press Handlers', () => {
    it('should call onPress handler when pressed', () => {
      const onPressMock = jest.fn();
      const { getByText } = renderWithTheme(
        <Card onPress={onPressMock}>
          <Text>Press Me</Text>
        </Card>
      );

      const card = getByText('Press Me');
      fireEvent.press(card);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should call onPress multiple times when pressed multiple times', () => {
      const onPressMock = jest.fn();
      const { getByText } = renderWithTheme(
        <Card onPress={onPressMock}>
          <Text>Press Me</Text>
        </Card>
      );

      const card = getByText('Press Me');
      fireEvent.press(card);
      fireEvent.press(card);
      fireEvent.press(card);

      expect(onPressMock).toHaveBeenCalledTimes(3);
    });

    it('should not be interactive when onPress is not provided', () => {
      const { getByTestId } = renderWithTheme(
        <Card testID="non-interactive-card">
          <Text>Non-Interactive Card</Text>
        </Card>
      );

      const card = getByTestId('non-interactive-card');
      // Card should not have TouchableOpacity when onPress is not provided
      expect(card.props.accessibilityRole).not.toBe('button');
    });

    it('should be interactive when onPress is provided', () => {
      const { getByTestId } = renderWithTheme(
        <Card onPress={() => {}} testID="interactive-card">
          <Text>Interactive Card</Text>
        </Card>
      );

      const card = getByTestId('interactive-card');
      // Card should have button role when onPress is provided
      expect(card.props.accessibilityRole).toBe('button');
    });
  });

  describe('Gradient Header', () => {
    it('should render gradient header when enabled', () => {
      const { getByTestId } = renderWithTheme(
        <Card headerGradient testID="card-with-gradient">
          <Text>Card with Gradient</Text>
        </Card>
      );

      expect(getByTestId('card-with-gradient-gradient-header')).toBeTruthy();
    });

    it('should not render gradient header when disabled', () => {
      const { queryByTestId } = renderWithTheme(
        <Card headerGradient={false} testID="card-without-gradient">
          <Text>Card without Gradient</Text>
        </Card>
      );

      expect(queryByTestId('card-without-gradient-gradient-header')).toBeNull();
    });

    it('should not render gradient header by default', () => {
      const { queryByTestId } = renderWithTheme(
        <Card testID="default-card">
          <Text>Default Card</Text>
        </Card>
      );

      expect(queryByTestId('default-card-gradient-header')).toBeNull();
    });

    it('should render gradient header with all variants', () => {
      const variants: Array<'default' | 'glassmorphic' | 'elevated'> = [
        'default',
        'glassmorphic',
        'elevated',
      ];

      variants.forEach((variant) => {
        const { getByTestId } = renderWithTheme(
          <Card variant={variant} headerGradient testID={`${variant}-card`}>
            <Text>{variant} Card</Text>
          </Card>
        );

        expect(getByTestId(`${variant}-card-gradient-header`)).toBeTruthy();
      });
    });
  });

  describe('Content Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = renderWithTheme(
        <Card>
          <Text>Child Content</Text>
        </Card>
      );

      expect(getByText('Child Content')).toBeTruthy();
    });

    it('should render multiple children correctly', () => {
      const { getByText } = renderWithTheme(
        <Card>
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </Card>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
      expect(getByText('Third Child')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role when interactive', () => {
      const { getByRole } = renderWithTheme(
        <Card onPress={() => {}}>
          <Text>Interactive Card</Text>
        </Card>
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('should not have button role when non-interactive', () => {
      const { queryByRole } = renderWithTheme(
        <Card>
          <Text>Non-Interactive Card</Text>
        </Card>
      );

      expect(queryByRole('button')).toBeNull();
    });
  });

  describe('TestID Support', () => {
    it('should support testID prop', () => {
      const { getByTestId } = renderWithTheme(
        <Card testID="custom-card">
          <Text>Card with TestID</Text>
        </Card>
      );

      expect(getByTestId('custom-card')).toBeTruthy();
    });
  });
});

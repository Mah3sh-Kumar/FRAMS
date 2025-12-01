/**
 * Unit Tests for Button Component
 * 
 * Tests button variants, press handlers, disabled state, and loading state.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Button Component', () => {
  describe('Variants', () => {
    it('should render primary variant correctly', () => {
      const { getByText } = renderWithTheme(
        <Button variant="primary" onPress={() => {}}>
          Primary Button
        </Button>
      );

      expect(getByText('Primary Button')).toBeTruthy();
    });

    it('should render secondary variant correctly', () => {
      const { getByText } = renderWithTheme(
        <Button variant="secondary" onPress={() => {}}>
          Secondary Button
        </Button>
      );

      expect(getByText('Secondary Button')).toBeTruthy();
    });

    it('should render danger variant correctly', () => {
      const { getByText } = renderWithTheme(
        <Button variant="danger" onPress={() => {}}>
          Danger Button
        </Button>
      );

      expect(getByText('Danger Button')).toBeTruthy();
    });

    it('should render ghost variant correctly', () => {
      const { getByText } = renderWithTheme(
        <Button variant="ghost" onPress={() => {}}>
          Ghost Button
        </Button>
      );

      expect(getByText('Ghost Button')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should render small size correctly', () => {
      const { getByText } = renderWithTheme(
        <Button size="small" onPress={() => {}}>
          Small Button
        </Button>
      );

      expect(getByText('Small Button')).toBeTruthy();
    });

    it('should render medium size correctly', () => {
      const { getByText } = renderWithTheme(
        <Button size="medium" onPress={() => {}}>
          Medium Button
        </Button>
      );

      expect(getByText('Medium Button')).toBeTruthy();
    });

    it('should render large size correctly', () => {
      const { getByText } = renderWithTheme(
        <Button size="large" onPress={() => {}}>
          Large Button
        </Button>
      );

      expect(getByText('Large Button')).toBeTruthy();
    });
  });

  describe('Press Handlers', () => {
    it('should call onPress handler when pressed', () => {
      const onPressMock = jest.fn();
      const { getByText } = renderWithTheme(
        <Button onPress={onPressMock}>Press Me</Button>
      );

      const button = getByText('Press Me');
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should call onPress multiple times when pressed multiple times', () => {
      const onPressMock = jest.fn();
      const { getByText } = renderWithTheme(
        <Button onPress={onPressMock}>Press Me</Button>
      );

      const button = getByText('Press Me');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('Disabled State', () => {
    it('should not call onPress when disabled', () => {
      const onPressMock = jest.fn();
      const { getByText } = renderWithTheme(
        <Button disabled onPress={onPressMock}>
          Disabled Button
        </Button>
      );

      const button = getByText('Disabled Button');
      fireEvent.press(button);

      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('should render disabled button with correct text', () => {
      const { getByText } = renderWithTheme(
        <Button disabled onPress={() => {}}>
          Disabled Button
        </Button>
      );

      expect(getByText('Disabled Button')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should display spinner when loading', () => {
      const { getByTestId } = renderWithTheme(
        <Button loading onPress={() => {}} testID="loading-button">
          Loading Button
        </Button>
      );

      expect(getByTestId('loading-button-spinner')).toBeTruthy();
    });

    it('should not call onPress when loading', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button loading onPress={onPressMock} testID="loading-button">
          Loading Button
        </Button>
      );

      const button = getByTestId('loading-button');
      fireEvent.press(button);

      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('should not display button text when loading', () => {
      const { queryByText } = renderWithTheme(
        <Button loading onPress={() => {}}>
          Loading Button
        </Button>
      );

      // Text should not be visible when loading
      expect(queryByText('Loading Button')).toBeNull();
    });
  });

  describe('Icon Support', () => {
    it('should render button with icon', () => {
      const IconComponent = () => <></>;
      const { getByText } = renderWithTheme(
        <Button icon={<IconComponent />} onPress={() => {}}>
          Button with Icon
        </Button>
      );

      expect(getByText('Button with Icon')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role', () => {
      const { getByRole } = renderWithTheme(
        <Button onPress={() => {}}>Accessible Button</Button>
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('should have correct accessibility state when disabled', () => {
      const { getByTestId } = renderWithTheme(
        <Button disabled onPress={() => {}} testID="disabled-button">
          Disabled Button
        </Button>
      );

      const button = getByTestId('disabled-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should have correct accessibility state when loading', () => {
      const { getByTestId } = renderWithTheme(
        <Button loading onPress={() => {}} testID="loading-button">
          Loading Button
        </Button>
      );

      const button = getByTestId('loading-button');
      expect(button.props.accessibilityState?.busy).toBe(true);
    });
  });
});

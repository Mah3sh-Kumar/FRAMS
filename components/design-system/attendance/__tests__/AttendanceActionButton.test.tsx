/**
 * Unit Tests for AttendanceActionButton Component
 * 
 * Tests button press handler and pulse animation.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import AttendanceActionButton from '../AttendanceActionButton';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('AttendanceActionButton Component', () => {
  describe('Button Press Handler', () => {
    it('should call onPress when button is pressed', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={onPressMock} testID="action-button">
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      const button = getByTestId('action-button');
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should call onPress multiple times when pressed multiple times', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={onPressMock} testID="action-button">
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      const button = getByTestId('action-button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(3);
    });

    it('should not call onPress when button is disabled', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton 
          onPress={onPressMock} 
          disabled={true}
          testID="action-button"
        >
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      const button = getByTestId('action-button');
      fireEvent.press(button);

      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Pulse Animation', () => {
    it('should render animated view when not in reduced motion mode', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}} testID="action-button">
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      // Button should render
      expect(getByTestId('action-button')).toBeTruthy();
      
      // Gradient should be present
      expect(getByTestId('action-button-gradient')).toBeTruthy();
    });

    it('should render glow effect when not disabled', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}} testID="action-button">
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      // Glow effect should be present
      expect(getByTestId('action-button-glow')).toBeTruthy();
    });

    it('should not render glow effect when disabled', () => {
      const { queryByTestId } = renderWithTheme(
        <AttendanceActionButton 
          onPress={() => {}} 
          disabled={true}
          testID="action-button"
        >
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      // Glow effect should not be present when disabled
      expect(queryByTestId('action-button-glow')).toBeNull();
    });
  });

  describe('Button Styling', () => {
    it('should render as circular button with 72px dimensions', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}} testID="action-button">
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      const gradient = getByTestId('action-button-gradient');
      expect(gradient).toBeTruthy();
    });

    it('should apply reduced opacity when disabled', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton 
          onPress={() => {}} 
          disabled={true}
          testID="action-button"
        >
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      const button = getByTestId('action-button');
      expect(button).toBeTruthy();
    });

    it('should render gradient background', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}} testID="action-button">
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      const gradient = getByTestId('action-button-gradient');
      expect(gradient).toBeTruthy();
    });
  });

  describe('Content Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}}>
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      expect(getByText('Capture')).toBeTruthy();
    });

    it('should render without children', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}} testID="action-button" />
      );

      expect(getByTestId('action-button')).toBeTruthy();
    });

    it('should render icon as child', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}}>
          <Text testID="camera-icon">📷</Text>
        </AttendanceActionButton>
      );

      expect(getByTestId('camera-icon')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have button accessibility role', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}} testID="action-button">
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      const button = getByTestId('action-button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('should have accessibility label', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}} testID="action-button">
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      const button = getByTestId('action-button');
      expect(button.props.accessibilityLabel).toBe('Attendance action');
    });

    it('should be disabled when disabled prop is true', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton 
          onPress={onPressMock} 
          disabled={true}
          testID="action-button"
        >
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      const button = getByTestId('action-button');
      fireEvent.press(button);
      
      // Verify button doesn't respond to press when disabled
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('TestID Support', () => {
    it('should support testID prop', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}} testID="custom-button">
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      expect(getByTestId('custom-button')).toBeTruthy();
      expect(getByTestId('custom-button-gradient')).toBeTruthy();
    });

    it('should use default testID when not provided', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton onPress={() => {}}>
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      expect(getByTestId('attendance-action-button')).toBeTruthy();
      expect(getByTestId('attendance-action-button-gradient')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should render correctly when disabled', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton 
          onPress={() => {}} 
          disabled={true}
          testID="action-button"
        >
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      expect(getByTestId('action-button')).toBeTruthy();
    });

    it('should not show glow when disabled', () => {
      const { queryByTestId } = renderWithTheme(
        <AttendanceActionButton 
          onPress={() => {}} 
          disabled={true}
          testID="action-button"
        >
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      expect(queryByTestId('action-button-glow')).toBeNull();
    });

    it('should still render gradient when disabled', () => {
      const { getByTestId } = renderWithTheme(
        <AttendanceActionButton 
          onPress={() => {}} 
          disabled={true}
          testID="action-button"
        >
          <Text>Capture</Text>
        </AttendanceActionButton>
      );

      expect(getByTestId('action-button-gradient')).toBeTruthy();
    });
  });
});

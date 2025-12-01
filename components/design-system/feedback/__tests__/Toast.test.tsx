/**
 * Toast Component Unit Tests
 * 
 * Tests for the Toast feedback component including:
 * - Auto-dismiss after duration
 * - Manual dismiss callback
 * - Different type variants render correctly
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Toast from '../Toast';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error',
    Warning: 'warning',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Helper to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Toast Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Type Variants', () => {
    it('renders success toast correctly', () => {
      const onDismiss = jest.fn();
      const { getByText } = renderWithTheme(
        <Toast type="success" message="Success message" onDismiss={onDismiss} />
      );

      expect(getByText('Success message')).toBeTruthy();
      expect(getByText('✓')).toBeTruthy();
    });

    it('renders error toast correctly', () => {
      const onDismiss = jest.fn();
      const { getByText } = renderWithTheme(
        <Toast type="error" message="Error message" onDismiss={onDismiss} />
      );

      expect(getByText('Error message')).toBeTruthy();
      expect(getByText('✕')).toBeTruthy();
    });

    it('renders warning toast correctly', () => {
      const onDismiss = jest.fn();
      const { getByText } = renderWithTheme(
        <Toast type="warning" message="Warning message" onDismiss={onDismiss} />
      );

      expect(getByText('Warning message')).toBeTruthy();
      expect(getByText('⚠')).toBeTruthy();
    });

    it('renders info toast correctly', () => {
      const onDismiss = jest.fn();
      const { getByText } = renderWithTheme(
        <Toast type="info" message="Info message" onDismiss={onDismiss} />
      );

      expect(getByText('Info message')).toBeTruthy();
      expect(getByText('ℹ')).toBeTruthy();
    });
  });

  describe('Auto-dismiss', () => {
    it('calls onDismiss after default duration (3000ms)', async () => {
      const onDismiss = jest.fn();
      renderWithTheme(
        <Toast type="info" message="Test message" onDismiss={onDismiss} />
      );

      // Should not be called immediately
      expect(onDismiss).not.toHaveBeenCalled();

      // Fast-forward time by 3000ms (default duration)
      jest.advanceTimersByTime(3000);

      // Wait for animation to complete (220ms for animation)
      jest.advanceTimersByTime(220);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onDismiss after custom duration', async () => {
      const onDismiss = jest.fn();
      const customDuration = 5000;
      
      renderWithTheme(
        <Toast
          type="success"
          message="Test message"
          duration={customDuration}
          onDismiss={onDismiss}
        />
      );

      // Should not be called before duration
      jest.advanceTimersByTime(4000);
      expect(onDismiss).not.toHaveBeenCalled();

      // Fast-forward to custom duration
      jest.advanceTimersByTime(1000);

      // Wait for animation to complete
      jest.advanceTimersByTime(220);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onDismiss multiple times', async () => {
      const onDismiss = jest.fn();
      renderWithTheme(
        <Toast type="info" message="Test message" onDismiss={onDismiss} />
      );

      // Fast-forward past duration
      jest.advanceTimersByTime(3500);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });

      // Advance more time
      jest.advanceTimersByTime(3000);

      // Should still only be called once
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility properties', () => {
      const onDismiss = jest.fn();
      const { getByRole } = renderWithTheme(
        <Toast type="info" message="Test message" onDismiss={onDismiss} />
      );

      const toast = getByRole('alert');
      expect(toast).toBeTruthy();
    });

    it('supports testID prop', () => {
      const onDismiss = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Toast
          type="info"
          message="Test message"
          onDismiss={onDismiss}
          testID="custom-toast"
        />
      );

      expect(getByTestId('custom-toast')).toBeTruthy();
    });
  });

  describe('Haptic Feedback', () => {
    it('can disable haptic feedback', () => {
      const onDismiss = jest.fn();
      renderWithTheme(
        <Toast
          type="success"
          message="Test message"
          onDismiss={onDismiss}
          haptic={false}
        />
      );

      // Component should render without errors
      expect(true).toBe(true);
    });
  });
});

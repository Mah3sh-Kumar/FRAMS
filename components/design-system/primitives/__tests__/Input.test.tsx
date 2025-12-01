/**
 * Unit Tests for Input Component
 * 
 * Tests text input updates, error messages, secure text entry, and disabled state.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../Input';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Input Component', () => {
  describe('Text Input Updates', () => {
    it('should call onChangeText when text is entered', () => {
      const onChangeTextMock = jest.fn();
      const { getByDisplayValue } = renderWithTheme(
        <Input
          label="Username"
          value=""
          onChangeText={onChangeTextMock}
        />
      );

      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'test user');

      expect(onChangeTextMock).toHaveBeenCalledWith('test user');
    });

    it('should update value when onChangeText is called', () => {
      let value = '';
      const handleChange = (text: string) => {
        value = text;
      };

      const { rerender, getByDisplayValue } = renderWithTheme(
        <Input
          label="Email"
          value={value}
          onChangeText={handleChange}
        />
      );

      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'test@example.com');

      // Rerender with new value
      rerender(
        <ThemeProvider>
          <Input
            label="Email"
            value="test@example.com"
            onChangeText={handleChange}
          />
        </ThemeProvider>
      );

      expect(getByDisplayValue('test@example.com')).toBeTruthy();
    });

    it('should display the current value', () => {
      const { getByDisplayValue } = renderWithTheme(
        <Input
          label="Name"
          value="John Doe"
          onChangeText={() => {}}
        />
      );

      expect(getByDisplayValue('John Doe')).toBeTruthy();
    });
  });

  describe('Error Messages', () => {
    it('should display error message when error prop is provided', () => {
      const { getByText } = renderWithTheme(
        <Input
          label="Password"
          value=""
          onChangeText={() => {}}
          error="Password is required"
        />
      );

      expect(getByText('Password is required')).toBeTruthy();
    });

    it('should not display error message when error prop is not provided', () => {
      const { queryByText } = renderWithTheme(
        <Input
          label="Password"
          value=""
          onChangeText={() => {}}
        />
      );

      // Should not find any error text
      expect(queryByText(/required/i)).toBeNull();
    });

    it('should display error with testID when provided', () => {
      const { getByTestId } = renderWithTheme(
        <Input
          label="Email"
          value=""
          onChangeText={() => {}}
          error="Invalid email"
          testID="email-input"
        />
      );

      expect(getByTestId('email-input-error')).toBeTruthy();
    });
  });

  describe('Secure Text Entry', () => {
    it('should enable secure text entry when secureTextEntry is true', () => {
      const { getByDisplayValue } = renderWithTheme(
        <Input
          label="Password"
          value="secret123"
          onChangeText={() => {}}
          secureTextEntry={true}
        />
      );

      const input = getByDisplayValue('secret123');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should not enable secure text entry by default', () => {
      const { getByDisplayValue } = renderWithTheme(
        <Input
          label="Username"
          value="user123"
          onChangeText={() => {}}
        />
      );

      const input = getByDisplayValue('user123');
      expect(input.props.secureTextEntry).toBe(false);
    });

    it('should work with secure text entry and error state', () => {
      const { getByDisplayValue, getByText } = renderWithTheme(
        <Input
          label="Password"
          value="weak"
          onChangeText={() => {}}
          secureTextEntry={true}
          error="Password too weak"
        />
      );

      const input = getByDisplayValue('weak');
      expect(input.props.secureTextEntry).toBe(true);
      expect(getByText('Password too weak')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should prevent input when disabled', () => {
      const { getByDisplayValue } = renderWithTheme(
        <Input
          label="Disabled Input"
          value="cannot edit"
          onChangeText={() => {}}
          disabled={true}
        />
      );

      const input = getByDisplayValue('cannot edit');
      expect(input.props.editable).toBe(false);
    });

    it('should allow input when not disabled', () => {
      const { getByDisplayValue } = renderWithTheme(
        <Input
          label="Enabled Input"
          value="can edit"
          onChangeText={() => {}}
          disabled={false}
        />
      );

      const input = getByDisplayValue('can edit');
      expect(input.props.editable).toBe(true);
    });

    it('should have correct accessibility state when disabled', () => {
      const { getByTestId } = renderWithTheme(
        <Input
          label="Disabled Input"
          value=""
          onChangeText={() => {}}
          disabled={true}
          testID="disabled-input"
        />
      );

      const input = getByTestId('disabled-input');
      expect(input.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Label', () => {
    it('should display the label', () => {
      const { getByText } = renderWithTheme(
        <Input
          label="Email Address"
          value=""
          onChangeText={() => {}}
        />
      );

      expect(getByText('Email Address')).toBeTruthy();
    });

    it('should use label as accessibility label', () => {
      const { getByLabelText } = renderWithTheme(
        <Input
          label="Username"
          value=""
          onChangeText={() => {}}
        />
      );

      expect(getByLabelText('Username')).toBeTruthy();
    });
  });

  describe('Icon Support', () => {
    it('should render input with icon', () => {
      const IconComponent = () => <></>;
      const { getByDisplayValue } = renderWithTheme(
        <Input
          label="Search"
          value=""
          onChangeText={() => {}}
          icon={<IconComponent />}
        />
      );

      expect(getByDisplayValue('')).toBeTruthy();
    });
  });

  describe('Focus State', () => {
    it('should handle focus events', () => {
      const { getByDisplayValue } = renderWithTheme(
        <Input
          label="Focusable Input"
          value=""
          onChangeText={() => {}}
        />
      );

      const input = getByDisplayValue('');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');

      // Component should handle focus/blur without errors
      expect(input).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label', () => {
      const { getByLabelText } = renderWithTheme(
        <Input
          label="Full Name"
          value=""
          onChangeText={() => {}}
        />
      );

      expect(getByLabelText('Full Name')).toBeTruthy();
    });

    it('should provide error as accessibility hint', () => {
      const { getByDisplayValue } = renderWithTheme(
        <Input
          label="Email"
          value=""
          onChangeText={() => {}}
          error="Invalid email format"
        />
      );

      const input = getByDisplayValue('');
      expect(input.props.accessibilityHint).toBe('Invalid email format');
    });

    it('should have alert role for error message', () => {
      const { getByRole } = renderWithTheme(
        <Input
          label="Password"
          value=""
          onChangeText={() => {}}
          error="Password is required"
        />
      );

      expect(getByRole('alert')).toBeTruthy();
    });
  });
});

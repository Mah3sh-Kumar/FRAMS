/**
 * Integration Tests for Theme Provider
 * 
 * Tests the ThemeProvider component integration with AsyncStorage,
 * theme mode toggling, and role switching.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme, ThemeConfig } from '../ThemeContext';

const THEME_STORAGE_KEY = '@frams_theme_config';

describe('ThemeProvider Integration Tests', () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    
    // Mock AsyncStorage methods to use in-memory storage
    (AsyncStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
      storage.set(key, value);
      return Promise.resolve();
    });
    
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      return Promise.resolve(storage.get(key) || null);
    });
    
    (AsyncStorage.clear as jest.Mock).mockImplementation(() => {
      storage.clear();
      return Promise.resolve();
    });
  });

  afterEach(() => {
    storage.clear();
    jest.clearAllMocks();
  });

  /**
   * Test: Theme loads from storage
   * 
   * Verifies that when the app starts, the ThemeProvider loads the saved
   * theme configuration from AsyncStorage and applies it.
   */
  it('should load theme configuration from storage on mount', async () => {
    // Pre-populate storage with a theme configuration
    const savedConfig: ThemeConfig = {
      mode: 'dark',
      role: 'teacher',
      reducedMotion: false,
    };
    storage.set(THEME_STORAGE_KEY, JSON.stringify(savedConfig));

    // Component that displays theme info
    function TestComponent() {
      const { mode, role } = useTheme();
      return (
        <>
          <Text testID="mode">{mode}</Text>
          <Text testID="role">{role || 'null'}</Text>
        </>
      );
    }

    // Render the provider
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for the theme to load from storage
    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('dark');
      expect(getByTestId('role').props.children).toBe('teacher');
    });
  });

  /**
   * Test: Theme mode toggle works
   * 
   * Verifies that the toggleMode function correctly switches between
   * light and dark modes and persists the change to storage.
   */
  it('should toggle theme mode and persist to storage', async () => {
    // Component that can trigger mode toggle
    function ToggleComponent() {
      const { mode, toggleMode } = useTheme();
      
      return (
        <>
          <Text testID="current-mode">{mode}</Text>
          <TouchableOpacity testID="toggle-button" onPress={toggleMode}>
            <Text>Toggle</Text>
          </TouchableOpacity>
        </>
      );
    }

    const { getByTestId } = render(
      <ThemeProvider>
        <ToggleComponent />
      </ThemeProvider>
    );

    // Wait for initial load (should be 'light' by default)
    await waitFor(() => {
      expect(getByTestId('current-mode').props.children).toBe('light');
    });

    // Toggle to dark mode
    fireEvent.press(getByTestId('toggle-button'));

    // Verify mode changed to dark
    await waitFor(() => {
      expect(getByTestId('current-mode').props.children).toBe('dark');
    });

    // Verify it was saved to storage
    await waitFor(() => {
      const stored = storage.get(THEME_STORAGE_KEY);
      expect(stored).toBeDefined();
      const config = JSON.parse(stored!);
      expect(config.mode).toBe('dark');
    });
  });

  /**
   * Test: Role switching works
   * 
   * Verifies that the setRole function correctly updates the user role
   * and persists the change to storage.
   */
  it('should switch roles and persist to storage', async () => {
    // Component that can change roles
    function RoleComponent() {
      const { role, setRole } = useTheme();
      
      return (
        <>
          <Text testID="current-role">{role || 'null'}</Text>
          <TouchableOpacity testID="set-student" onPress={() => setRole('student')}>
            <Text>Student</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="set-teacher" onPress={() => setRole('teacher')}>
            <Text>Teacher</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="set-admin" onPress={() => setRole('admin')}>
            <Text>Admin</Text>
          </TouchableOpacity>
        </>
      );
    }

    const { getByTestId } = render(
      <ThemeProvider>
        <RoleComponent />
      </ThemeProvider>
    );

    // Wait for initial load (should be null by default)
    await waitFor(() => {
      expect(getByTestId('current-role').props.children).toBe('null');
    });

    // Set role to student
    fireEvent.press(getByTestId('set-student'));

    // Verify role changed to student
    await waitFor(() => {
      expect(getByTestId('current-role').props.children).toBe('student');
    });

    // Verify it was saved to storage
    await waitFor(() => {
      const stored = storage.get(THEME_STORAGE_KEY);
      expect(stored).toBeDefined();
      const config = JSON.parse(stored!);
      expect(config.role).toBe('student');
    });

    // Set role to teacher
    fireEvent.press(getByTestId('set-teacher'));

    // Verify role changed to teacher
    await waitFor(() => {
      expect(getByTestId('current-role').props.children).toBe('teacher');
    });

    // Set role to admin
    fireEvent.press(getByTestId('set-admin'));

    // Verify role changed to admin
    await waitFor(() => {
      expect(getByTestId('current-role').props.children).toBe('admin');
    });
  });
});

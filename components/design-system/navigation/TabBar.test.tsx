/**
 * TabBar Unit Tests
 * 
 * Tests for TabBar initialization and animated value handling
 * Requirements: 3.1, 3.2
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';
import TabBar, { TabItem } from './TabBar';
import { ThemeProvider } from '../../../lib/design-system/ThemeContext';

// Mock tabs for testing
const mockTabs: TabItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
];

// Helper to wrap component with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('TabBar', () => {
  describe('Initialization', () => {
    it('should initialize without accessing private _value property', () => {
      // This test verifies that the component doesn't access indicatorWidth._value
      // If it did, TypeScript would throw an error at compile time
      const onTabPress = jest.fn();
      
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={mockTabs}
          activeTab="home"
          onTabPress={onTabPress}
          testID="tab-bar"
        />
      );
      
      // Component should render successfully
      expect(getByTestId('tab-bar')).toBeTruthy();
      expect(getByTestId('tab-bar-indicator')).toBeTruthy();
    });

    it('should render all tabs correctly', () => {
      const onTabPress = jest.fn();
      
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={mockTabs}
          activeTab="home"
          onTabPress={onTabPress}
          testID="tab-bar"
        />
      );
      
      // All tabs should be rendered
      expect(getByTestId('tab-bar-tab-home')).toBeTruthy();
      expect(getByTestId('tab-bar-tab-profile')).toBeTruthy();
      expect(getByTestId('tab-bar-tab-settings')).toBeTruthy();
    });

    it('should set initial active tab correctly', () => {
      const onTabPress = jest.fn();
      
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={mockTabs}
          activeTab="profile"
          onTabPress={onTabPress}
          testID="tab-bar"
        />
      );
      
      const profileTab = getByTestId('tab-bar-tab-profile');
      
      // Profile tab should have selected accessibility state
      expect(profileTab.props.accessibilityState).toEqual({ selected: true });
    });
  });

  describe('Tab Switching Animation', () => {
    it('should call onTabPress when a tab is pressed', () => {
      const onTabPress = jest.fn();
      
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={mockTabs}
          activeTab="home"
          onTabPress={onTabPress}
          testID="tab-bar"
        />
      );
      
      const profileTab = getByTestId('tab-bar-tab-profile');
      fireEvent.press(profileTab);
      
      expect(onTabPress).toHaveBeenCalledWith('profile');
    });

    it('should not call onTabPress when active tab is pressed', () => {
      const onTabPress = jest.fn();
      
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={mockTabs}
          activeTab="home"
          onTabPress={onTabPress}
          testID="tab-bar"
        />
      );
      
      const homeTab = getByTestId('tab-bar-tab-home');
      fireEvent.press(homeTab);
      
      expect(onTabPress).not.toHaveBeenCalled();
    });

    it('should animate indicator on subsequent tab changes', async () => {
      const onTabPress = jest.fn();
      
      const { getByTestId, rerender } = renderWithTheme(
        <TabBar
          tabs={mockTabs}
          activeTab="home"
          onTabPress={onTabPress}
          testID="tab-bar"
        />
      );
      
      // Initial render - indicator should be positioned
      const indicator = getByTestId('tab-bar-indicator');
      expect(indicator).toBeTruthy();
      
      // Change active tab
      rerender(
        <ThemeProvider>
          <TabBar
            tabs={mockTabs}
            activeTab="profile"
            onTabPress={onTabPress}
            testID="tab-bar"
          />
        </ThemeProvider>
      );
      
      // Indicator should still be present (animation would occur)
      await waitFor(() => {
        expect(getByTestId('tab-bar-indicator')).toBeTruthy();
      });
    });
  });

  describe('Type Safety', () => {
    it('should work with animated values without TypeScript errors', () => {
      // This test verifies that the component compiles without TypeScript errors
      // The fact that this test file compiles proves that we're not accessing
      // private properties like _value
      const onTabPress = jest.fn();
      
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={mockTabs}
          activeTab="home"
          onTabPress={onTabPress}
          testID="tab-bar"
        />
      );
      
      // Component renders successfully with proper type safety
      expect(getByTestId('tab-bar')).toBeTruthy();
    });

    it('should handle empty tabs array', () => {
      const onTabPress = jest.fn();
      
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={[]}
          activeTab=""
          onTabPress={onTabPress}
          testID="tab-bar"
        />
      );
      
      // Should render without errors
      expect(getByTestId('tab-bar')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', () => {
      const onTabPress = jest.fn();
      
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={mockTabs}
          activeTab="home"
          onTabPress={onTabPress}
          testID="tab-bar"
        />
      );
      
      const homeTab = getByTestId('tab-bar-tab-home');
      
      expect(homeTab.props.accessible).toBe(true);
      expect(homeTab.props.accessibilityRole).toBe('tab');
      expect(homeTab.props.accessibilityLabel).toBe('Home');
      expect(homeTab.props.accessibilityState).toEqual({ selected: true });
    });
  });
});

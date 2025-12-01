/**
 * Unit Tests for TabBar Component
 * 
 * Tests tab switching, active state updates, and tab rendering.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TabBar, { TabItem } from '../TabBar';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Sample tab data for testing
const sampleTabs: TabItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
];

describe('TabBar Component', () => {
  describe('Tab Rendering', () => {
    it('should render all tabs correctly', () => {
      const { getByText } = renderWithTheme(
        <TabBar tabs={sampleTabs} activeTab="home" onTabPress={() => {}} />
      );

      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('should render tabs with icons', () => {
      const IconComponent = () => <></>;
      const tabsWithIcons: TabItem[] = [
        { id: 'home', label: 'Home', icon: <IconComponent /> },
        { id: 'profile', label: 'Profile', icon: <IconComponent /> },
      ];

      const { getByText } = renderWithTheme(
        <TabBar tabs={tabsWithIcons} activeTab="home" onTabPress={() => {}} />
      );

      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
    });

    it('should render empty tab bar when no tabs provided', () => {
      const { queryByText } = renderWithTheme(
        <TabBar tabs={[]} activeTab="" onTabPress={() => {}} />
      );

      expect(queryByText('Home')).toBeNull();
    });

    it('should render single tab correctly', () => {
      const singleTab: TabItem[] = [{ id: 'home', label: 'Home' }];

      const { getByText } = renderWithTheme(
        <TabBar tabs={singleTab} activeTab="home" onTabPress={() => {}} />
      );

      expect(getByText('Home')).toBeTruthy();
    });
  });

  describe('Tab Switching', () => {
    it('should call onTabPress when tab is pressed', () => {
      const onTabPressMock = jest.fn();
      const { getByText } = renderWithTheme(
        <TabBar tabs={sampleTabs} activeTab="home" onTabPress={onTabPressMock} />
      );

      const profileTab = getByText('Profile');
      fireEvent.press(profileTab);

      expect(onTabPressMock).toHaveBeenCalledWith('profile');
      expect(onTabPressMock).toHaveBeenCalledTimes(1);
    });

    it('should call onTabPress with correct tab ID for each tab', () => {
      const onTabPressMock = jest.fn();
      const { getByText } = renderWithTheme(
        <TabBar tabs={sampleTabs} activeTab="home" onTabPress={onTabPressMock} />
      );

      // Pressing active tab should not call onTabPress
      fireEvent.press(getByText('Home'));
      expect(onTabPressMock).not.toHaveBeenCalled();

      // Pressing inactive tabs should call onTabPress
      fireEvent.press(getByText('Profile'));
      expect(onTabPressMock).toHaveBeenLastCalledWith('profile');

      fireEvent.press(getByText('Settings'));
      expect(onTabPressMock).toHaveBeenLastCalledWith('settings');

      expect(onTabPressMock).toHaveBeenCalledTimes(2);
    });

    it('should not call onTabPress when pressing already active tab', () => {
      const onTabPressMock = jest.fn();
      const { getByText } = renderWithTheme(
        <TabBar tabs={sampleTabs} activeTab="home" onTabPress={onTabPressMock} />
      );

      const homeTab = getByText('Home');
      fireEvent.press(homeTab);

      // Should not call onTabPress for already active tab
      expect(onTabPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Active State', () => {
    it('should update active state when activeTab prop changes', () => {
      const { getByTestId, rerender } = renderWithTheme(
        <TabBar
          tabs={sampleTabs}
          activeTab="home"
          onTabPress={() => {}}
          testID="tab-bar"
        />
      );

      // Initial render with 'home' active
      expect(getByTestId('tab-bar-tab-home')).toBeTruthy();

      // Re-render with 'profile' active
      rerender(
        <ThemeProvider>
          <TabBar
            tabs={sampleTabs}
            activeTab="profile"
            onTabPress={() => {}}
            testID="tab-bar"
          />
        </ThemeProvider>
      );

      expect(getByTestId('tab-bar-tab-profile')).toBeTruthy();
    });

    it('should render active tab indicator', () => {
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={sampleTabs}
          activeTab="home"
          onTabPress={() => {}}
          testID="tab-bar"
        />
      );

      expect(getByTestId('tab-bar-indicator')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role for tabs', () => {
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={sampleTabs}
          activeTab="home"
          onTabPress={() => {}}
          testID="tab-bar"
        />
      );

      const homeTab = getByTestId('tab-bar-tab-home');
      expect(homeTab.props.accessibilityRole).toBe('tab');
    });

    it('should have correct accessibility state for active tab', () => {
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={sampleTabs}
          activeTab="home"
          onTabPress={() => {}}
          testID="tab-bar"
        />
      );

      const homeTab = getByTestId('tab-bar-tab-home');
      expect(homeTab.props.accessibilityState?.selected).toBe(true);
    });

    it('should have correct accessibility state for inactive tabs', () => {
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={sampleTabs}
          activeTab="home"
          onTabPress={() => {}}
          testID="tab-bar"
        />
      );

      const profileTab = getByTestId('tab-bar-tab-profile');
      expect(profileTab.props.accessibilityState?.selected).toBe(false);
    });

    it('should have accessibility labels for all tabs', () => {
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={sampleTabs}
          activeTab="home"
          onTabPress={() => {}}
          testID="tab-bar"
        />
      );

      expect(getByTestId('tab-bar-tab-home').props.accessibilityLabel).toBe('Home');
      expect(getByTestId('tab-bar-tab-profile').props.accessibilityLabel).toBe('Profile');
      expect(getByTestId('tab-bar-tab-settings').props.accessibilityLabel).toBe('Settings');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom style prop', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = renderWithTheme(
        <TabBar
          tabs={sampleTabs}
          activeTab="home"
          onTabPress={() => {}}
          style={customStyle}
          testID="tab-bar"
        />
      );

      const tabBar = getByTestId('tab-bar');
      expect(tabBar.props.style).toContainEqual(customStyle);
    });
  });

  describe('Edge Cases', () => {
    it('should handle activeTab that does not exist in tabs array', () => {
      const { getByText } = renderWithTheme(
        <TabBar tabs={sampleTabs} activeTab="nonexistent" onTabPress={() => {}} />
      );

      // Should still render all tabs
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
    });

    it('should handle rapid tab switching', () => {
      const onTabPressMock = jest.fn();
      const { getByText, rerender } = renderWithTheme(
        <TabBar tabs={sampleTabs} activeTab="home" onTabPress={onTabPressMock} />
      );

      // Press Profile (should call onTabPress)
      fireEvent.press(getByText('Profile'));
      expect(onTabPressMock).toHaveBeenCalledWith('profile');

      // Simulate activeTab change to 'profile'
      rerender(
        <ThemeProvider>
          <TabBar tabs={sampleTabs} activeTab="profile" onTabPress={onTabPressMock} />
        </ThemeProvider>
      );

      // Press Settings (should call onTabPress)
      fireEvent.press(getByText('Settings'));
      expect(onTabPressMock).toHaveBeenCalledWith('settings');

      // Simulate activeTab change to 'settings'
      rerender(
        <ThemeProvider>
          <TabBar tabs={sampleTabs} activeTab="settings" onTabPress={onTabPressMock} />
        </ThemeProvider>
      );

      // Press Home (should call onTabPress)
      fireEvent.press(getByText('Home'));
      expect(onTabPressMock).toHaveBeenCalledWith('home');

      expect(onTabPressMock).toHaveBeenCalledTimes(3);
    });
  });
});

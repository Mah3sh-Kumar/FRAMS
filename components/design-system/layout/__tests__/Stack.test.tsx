/**
 * Unit Tests for Stack Component
 * 
 * Tests vertical spacing and children rendering.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import Stack from '../Stack';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';
import { spacing } from '../../../../lib/design-system/tokens/spacing';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Helper to get flattened style from component
const getStyle = (element: any) => {
  const style = element?.props?.style;
  return Array.isArray(style) ? style[0] : style;
};

describe('Stack Component', () => {
  describe('Children Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = renderWithTheme(
        <Stack>
          <Text>First Item</Text>
        </Stack>
      );

      expect(getByText('First Item')).toBeTruthy();
    });

    it('should render multiple children correctly', () => {
      const { getByText } = renderWithTheme(
        <Stack>
          <Text>First Item</Text>
          <Text>Second Item</Text>
          <Text>Third Item</Text>
        </Stack>
      );

      expect(getByText('First Item')).toBeTruthy();
      expect(getByText('Second Item')).toBeTruthy();
      expect(getByText('Third Item')).toBeTruthy();
    });

    it('should render single child without spacing', () => {
      const { getByText } = renderWithTheme(
        <Stack>
          <Text>Only Child</Text>
        </Stack>
      );

      expect(getByText('Only Child')).toBeTruthy();
    });
  });

  describe('Spacing Application', () => {
    it('should apply default medium spacing between children', () => {
      const { getByTestId } = renderWithTheme(
        <Stack testID="stack">
          <Text>First</Text>
          <Text>Second</Text>
        </Stack>
      );

      const firstChild = getByTestId('stack-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginBottom: spacing.md,
      });
    });

    it('should apply xs spacing when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Stack spacing="xs" testID="stack">
          <Text>First</Text>
          <Text>Second</Text>
        </Stack>
      );

      const firstChild = getByTestId('stack-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginBottom: spacing.xs,
      });
    });

    it('should apply sm spacing when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Stack spacing="sm" testID="stack">
          <Text>First</Text>
          <Text>Second</Text>
        </Stack>
      );

      const firstChild = getByTestId('stack-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginBottom: spacing.sm,
      });
    });

    it('should apply lg spacing when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Stack spacing="lg" testID="stack">
          <Text>First</Text>
          <Text>Second</Text>
        </Stack>
      );

      const firstChild = getByTestId('stack-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginBottom: spacing.lg,
      });
    });

    it('should apply xl spacing when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Stack spacing="xl" testID="stack">
          <Text>First</Text>
          <Text>Second</Text>
        </Stack>
      );

      const firstChild = getByTestId('stack-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginBottom: spacing.xl,
      });
    });

    it('should apply xxl spacing when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Stack spacing="xxl" testID="stack">
          <Text>First</Text>
          <Text>Second</Text>
        </Stack>
      );

      const firstChild = getByTestId('stack-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginBottom: spacing.xxl,
      });
    });

    it('should not apply spacing to last child', () => {
      const { getByTestId } = renderWithTheme(
        <Stack spacing="lg" testID="stack">
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Last</Text>
        </Stack>
      );

      const lastChild = getByTestId('stack-child-2');
      expect(getStyle(lastChild)).toBeUndefined();
    });

    it('should apply spacing to all children except last', () => {
      const { getByTestId } = renderWithTheme(
        <Stack spacing="md" testID="stack">
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Third</Text>
          <Text>Fourth</Text>
        </Stack>
      );

      const firstChild = getByTestId('stack-child-0');
      const secondChild = getByTestId('stack-child-1');
      const thirdChild = getByTestId('stack-child-2');
      const fourthChild = getByTestId('stack-child-3');

      expect(getStyle(firstChild)).toMatchObject({ marginBottom: spacing.md });
      expect(getStyle(secondChild)).toMatchObject({ marginBottom: spacing.md });
      expect(getStyle(thirdChild)).toMatchObject({ marginBottom: spacing.md });
      expect(getStyle(fourthChild)).toBeUndefined();
    });
  });

  describe('Layout Direction', () => {
    it('should arrange children vertically', () => {
      const { getByTestId } = renderWithTheme(
        <Stack testID="stack">
          <Text>First</Text>
          <Text>Second</Text>
        </Stack>
      );

      const stack = getByTestId('stack');
      expect(getStyle(stack)).toMatchObject({
        flexDirection: 'column',
      });
    });
  });

  describe('TestID Support', () => {
    it('should support testID prop', () => {
      const { getByTestId } = renderWithTheme(
        <Stack testID="custom-stack">
          <Text>Content</Text>
        </Stack>
      );

      expect(getByTestId('custom-stack')).toBeTruthy();
    });
  });
});

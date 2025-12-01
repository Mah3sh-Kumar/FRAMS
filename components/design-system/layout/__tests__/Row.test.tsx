/**
 * Unit Tests for Row Component
 * 
 * Tests horizontal spacing, alignment, and children rendering.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import Row from '../Row';
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

describe('Row Component', () => {
  describe('Children Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = renderWithTheme(
        <Row>
          <Text>First Item</Text>
        </Row>
      );

      expect(getByText('First Item')).toBeTruthy();
    });

    it('should render multiple children correctly', () => {
      const { getByText } = renderWithTheme(
        <Row>
          <Text>First Item</Text>
          <Text>Second Item</Text>
          <Text>Third Item</Text>
        </Row>
      );

      expect(getByText('First Item')).toBeTruthy();
      expect(getByText('Second Item')).toBeTruthy();
      expect(getByText('Third Item')).toBeTruthy();
    });

    it('should render single child without spacing', () => {
      const { getByText } = renderWithTheme(
        <Row>
          <Text>Only Child</Text>
        </Row>
      );

      expect(getByText('Only Child')).toBeTruthy();
    });
  });

  describe('Spacing Application', () => {
    it('should apply default medium spacing between children', () => {
      const { getByTestId } = renderWithTheme(
        <Row testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const firstChild = getByTestId('row-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginRight: spacing.md,
      });
    });

    it('should apply xs spacing when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row spacing="xs" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const firstChild = getByTestId('row-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginRight: spacing.xs,
      });
    });

    it('should apply sm spacing when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row spacing="sm" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const firstChild = getByTestId('row-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginRight: spacing.sm,
      });
    });

    it('should apply lg spacing when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row spacing="lg" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const firstChild = getByTestId('row-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginRight: spacing.lg,
      });
    });

    it('should apply xl spacing when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row spacing="xl" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const firstChild = getByTestId('row-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginRight: spacing.xl,
      });
    });

    it('should apply xxl spacing when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row spacing="xxl" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const firstChild = getByTestId('row-child-0');
      expect(getStyle(firstChild)).toMatchObject({
        marginRight: spacing.xxl,
      });
    });

    it('should not apply spacing to last child', () => {
      const { getByTestId } = renderWithTheme(
        <Row spacing="lg" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Last</Text>
        </Row>
      );

      const lastChild = getByTestId('row-child-2');
      expect(getStyle(lastChild)).toBeUndefined();
    });

    it('should apply spacing to all children except last', () => {
      const { getByTestId } = renderWithTheme(
        <Row spacing="md" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Third</Text>
          <Text>Fourth</Text>
        </Row>
      );

      const firstChild = getByTestId('row-child-0');
      const secondChild = getByTestId('row-child-1');
      const thirdChild = getByTestId('row-child-2');
      const fourthChild = getByTestId('row-child-3');

      expect(getStyle(firstChild)).toMatchObject({ marginRight: spacing.md });
      expect(getStyle(secondChild)).toMatchObject({ marginRight: spacing.md });
      expect(getStyle(thirdChild)).toMatchObject({ marginRight: spacing.md });
      expect(getStyle(fourthChild)).toBeUndefined();
    });
  });

  describe('Horizontal Alignment', () => {
    it('should apply default flex-start alignment', () => {
      const { getByTestId } = renderWithTheme(
        <Row testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        justifyContent: 'flex-start',
      });
    });

    it('should apply center alignment when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row align="center" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        justifyContent: 'center',
      });
    });

    it('should apply flex-end alignment when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row align="flex-end" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        justifyContent: 'flex-end',
      });
    });

    it('should apply space-between alignment when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row align="space-between" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        justifyContent: 'space-between',
      });
    });

    it('should apply space-around alignment when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row align="space-around" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        justifyContent: 'space-around',
      });
    });

    it('should apply space-evenly alignment when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row align="space-evenly" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        justifyContent: 'space-evenly',
      });
    });
  });

  describe('Vertical Alignment', () => {
    it('should apply default center vertical alignment', () => {
      const { getByTestId } = renderWithTheme(
        <Row testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        alignItems: 'center',
      });
    });

    it('should apply flex-start vertical alignment when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row verticalAlign="flex-start" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        alignItems: 'flex-start',
      });
    });

    it('should apply flex-end vertical alignment when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row verticalAlign="flex-end" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        alignItems: 'flex-end',
      });
    });

    it('should apply stretch vertical alignment when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Row verticalAlign="stretch" testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        alignItems: 'stretch',
      });
    });
  });

  describe('Layout Direction', () => {
    it('should arrange children horizontally', () => {
      const { getByTestId } = renderWithTheme(
        <Row testID="row">
          <Text>First</Text>
          <Text>Second</Text>
        </Row>
      );

      const row = getByTestId('row');
      expect(getStyle(row)).toMatchObject({
        flexDirection: 'row',
      });
    });
  });

  describe('TestID Support', () => {
    it('should support testID prop', () => {
      const { getByTestId } = renderWithTheme(
        <Row testID="custom-row">
          <Text>Content</Text>
        </Row>
      );

      expect(getByTestId('custom-row')).toBeTruthy();
    });
  });
});

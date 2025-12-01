/**
 * Unit Tests for Container Component
 * 
 * Tests container padding, max width, and children rendering.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import Container from '../Container';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';
import { spacing } from '../../../../lib/design-system/tokens/spacing';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Helper to get flattened style from component
const getStyle = (element: any) => {
  const style = element.props.style;
  return Array.isArray(style) ? style[0] : style;
};

describe('Container Component', () => {
  describe('Children Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = renderWithTheme(
        <Container>
          <Text>Container Content</Text>
        </Container>
      );

      expect(getByText('Container Content')).toBeTruthy();
    });

    it('should render multiple children correctly', () => {
      const { getByText } = renderWithTheme(
        <Container>
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </Container>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
      expect(getByText('Third Child')).toBeTruthy();
    });
  });

  describe('Spacing Application', () => {
    it('should apply default medium padding', () => {
      const { getByTestId } = renderWithTheme(
        <Container testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        paddingHorizontal: spacing.md,
      });
    });

    it('should apply xs padding when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Container padding="xs" testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        paddingHorizontal: spacing.xs,
      });
    });

    it('should apply sm padding when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Container padding="sm" testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        paddingHorizontal: spacing.sm,
      });
    });

    it('should apply lg padding when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Container padding="lg" testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        paddingHorizontal: spacing.lg,
      });
    });

    it('should apply xl padding when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Container padding="xl" testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        paddingHorizontal: spacing.xl,
      });
    });

    it('should apply xxl padding when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Container padding="xxl" testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        paddingHorizontal: spacing.xxl,
      });
    });
  });

  describe('Max Width', () => {
    it('should apply default max width of 1200', () => {
      const { getByTestId } = renderWithTheme(
        <Container testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        maxWidth: 1200,
      });
    });

    it('should apply custom max width when specified', () => {
      const { getByTestId } = renderWithTheme(
        <Container maxWidth={800} testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        maxWidth: 800,
      });
    });

    it('should apply small max width', () => {
      const { getByTestId } = renderWithTheme(
        <Container maxWidth={400} testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        maxWidth: 400,
      });
    });
  });

  describe('Layout Properties', () => {
    it('should have full width', () => {
      const { getByTestId } = renderWithTheme(
        <Container testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        width: '100%',
      });
    });

    it('should center itself', () => {
      const { getByTestId } = renderWithTheme(
        <Container testID="container">
          <Text>Content</Text>
        </Container>
      );

      const container = getByTestId('container');
      expect(getStyle(container)).toMatchObject({
        alignSelf: 'center',
      });
    });
  });

  describe('TestID Support', () => {
    it('should support testID prop', () => {
      const { getByTestId } = renderWithTheme(
        <Container testID="custom-container">
          <Text>Content</Text>
        </Container>
      );

      expect(getByTestId('custom-container')).toBeTruthy();
    });
  });
});

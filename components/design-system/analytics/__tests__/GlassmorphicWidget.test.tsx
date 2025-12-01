/**
 * Unit Tests for GlassmorphicWidget Component
 * 
 * Tests glassmorphic styles, elevation system, and content rendering.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import GlassmorphicWidget from '../GlassmorphicWidget';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('GlassmorphicWidget Component', () => {
  describe('Glassmorphic Styles', () => {
    it('should apply glassmorphic styles with translucent background', () => {
      const { getByTestId } = renderWithTheme(
        <GlassmorphicWidget testID="glassmorphic-widget">
          <Text>Widget Content</Text>
        </GlassmorphicWidget>
      );

      const widget = getByTestId('glassmorphic-widget');
      expect(widget).toBeTruthy();
      
      // Widget should have border radius and border
      const style = Array.isArray(widget.props.style) ? widget.props.style[0] : widget.props.style;
      expect(style).toMatchObject(
        expect.objectContaining({
          borderRadius: expect.any(Number),
          borderWidth: 1,
          borderColor: expect.any(String),
        })
      );
    });

    it('should render with translucent background', () => {
      const { getByTestId } = renderWithTheme(
        <GlassmorphicWidget testID="widget-with-translucent">
          <Text>Translucent Content</Text>
        </GlassmorphicWidget>
      );

      const widget = getByTestId('widget-with-translucent');
      const style = Array.isArray(widget.props.style) ? widget.props.style[0] : widget.props.style;
      expect(style).toMatchObject(
        expect.objectContaining({
          backgroundColor: expect.any(String),
        })
      );
    });

    it('should have overflow hidden for glassmorphic effect', () => {
      const { getByTestId } = renderWithTheme(
        <GlassmorphicWidget testID="overflow-widget">
          <Text>Content</Text>
        </GlassmorphicWidget>
      );

      const widget = getByTestId('overflow-widget');
      const style = Array.isArray(widget.props.style) ? widget.props.style[0] : widget.props.style;
      expect(style).toMatchObject(
        expect.objectContaining({
          overflow: 'hidden',
        })
      );
    });
  });

  describe('Elevation System', () => {
    it('should apply small elevation when specified', () => {
      const { getByTestId } = renderWithTheme(
        <GlassmorphicWidget elevation="sm" testID="sm-elevation">
          <Text>Small Elevation</Text>
        </GlassmorphicWidget>
      );

      const widget = getByTestId('sm-elevation');
      const style = Array.isArray(widget.props.style) ? widget.props.style[0] : widget.props.style;
      expect(style).toMatchObject(
        expect.objectContaining({
          elevation: 2,
        })
      );
    });

    it('should apply medium elevation by default', () => {
      const { getByTestId } = renderWithTheme(
        <GlassmorphicWidget testID="default-elevation">
          <Text>Default Elevation</Text>
        </GlassmorphicWidget>
      );

      const widget = getByTestId('default-elevation');
      const style = Array.isArray(widget.props.style) ? widget.props.style[0] : widget.props.style;
      expect(style).toMatchObject(
        expect.objectContaining({
          elevation: 4,
        })
      );
    });

    it('should apply large elevation when specified', () => {
      const { getByTestId } = renderWithTheme(
        <GlassmorphicWidget elevation="lg" testID="lg-elevation">
          <Text>Large Elevation</Text>
        </GlassmorphicWidget>
      );

      const widget = getByTestId('lg-elevation');
      const style = Array.isArray(widget.props.style) ? widget.props.style[0] : widget.props.style;
      expect(style).toMatchObject(
        expect.objectContaining({
          elevation: 8,
        })
      );
    });

    it('should apply shadow properties for elevation', () => {
      const { getByTestId } = renderWithTheme(
        <GlassmorphicWidget testID="shadow-widget">
          <Text>Shadow Content</Text>
        </GlassmorphicWidget>
      );

      const widget = getByTestId('shadow-widget');
      const style = Array.isArray(widget.props.style) ? widget.props.style[0] : widget.props.style;
      expect(style).toMatchObject(
        expect.objectContaining({
          shadowColor: expect.any(String),
          shadowOpacity: expect.any(Number),
          shadowRadius: expect.any(Number),
        })
      );
    });
  });

  describe('Content Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = renderWithTheme(
        <GlassmorphicWidget>
          <Text>Widget Content</Text>
        </GlassmorphicWidget>
      );

      expect(getByText('Widget Content')).toBeTruthy();
    });

    it('should render multiple children correctly', () => {
      const { getByText } = renderWithTheme(
        <GlassmorphicWidget>
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </GlassmorphicWidget>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
      expect(getByText('Third Child')).toBeTruthy();
    });

    it('should render complex content structures', () => {
      const { getByText, getByTestId } = renderWithTheme(
        <GlassmorphicWidget>
          <View testID="complex-content">
            <Text>Title</Text>
            <View>
              <Text>Nested Content</Text>
            </View>
          </View>
        </GlassmorphicWidget>
      );

      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Nested Content')).toBeTruthy();
      expect(getByTestId('complex-content')).toBeTruthy();
    });

    it('should render with custom styles', () => {
      const customStyle = { marginTop: 20, marginBottom: 10 };
      const { getByTestId } = renderWithTheme(
        <GlassmorphicWidget style={customStyle} testID="styled-widget">
          <Text>Styled Content</Text>
        </GlassmorphicWidget>
      );

      const widget = getByTestId('styled-widget');
      expect(widget.props.style).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining(customStyle),
        ])
      );
    });
  });

  describe('TestID Support', () => {
    it('should support testID prop', () => {
      const { getByTestId } = renderWithTheme(
        <GlassmorphicWidget testID="custom-widget">
          <Text>Widget with TestID</Text>
        </GlassmorphicWidget>
      );

      expect(getByTestId('custom-widget')).toBeTruthy();
    });
  });

  describe('Design Token Usage', () => {
    it('should use design tokens for border radius', () => {
      const { getByTestId } = renderWithTheme(
        <GlassmorphicWidget testID="token-widget">
          <Text>Token Content</Text>
        </GlassmorphicWidget>
      );

      const widget = getByTestId('token-widget');
      const style = Array.isArray(widget.props.style) ? widget.props.style[0] : widget.props.style;
      // Should use large border radius token (20px)
      expect(style).toMatchObject(
        expect.objectContaining({
          borderRadius: 20,
        })
      );
    });
  });
});

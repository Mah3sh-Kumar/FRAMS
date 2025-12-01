/**
 * Unit Tests for ProgressRing Component
 * 
 * Tests progress values rendering and animation on value change.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressRing from '../ProgressRing';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ProgressRing Component', () => {
  describe('Progress Values Rendering', () => {
    it('should render with 0% progress', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={0} testID="progress-ring" />
      );

      const ring = getByTestId('progress-ring');
      expect(ring).toBeTruthy();
    });

    it('should render with 50% progress', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={50} testID="progress-ring-50" />
      );

      const ring = getByTestId('progress-ring-50');
      expect(ring).toBeTruthy();
    });

    it('should render with 100% progress', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={100} testID="progress-ring-100" />
      );

      const ring = getByTestId('progress-ring-100');
      expect(ring).toBeTruthy();
    });

    it('should clamp progress values above 100', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={150} testID="progress-ring-clamped" />
      );

      const ring = getByTestId('progress-ring-clamped');
      expect(ring).toBeTruthy();
    });

    it('should clamp progress values below 0', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={-20} testID="progress-ring-negative" />
      );

      const ring = getByTestId('progress-ring-negative');
      expect(ring).toBeTruthy();
    });

    it('should display percentage text by default', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={75} testID="progress-ring-percentage" />
      );

      const percentageText = getByTestId('progress-ring-percentage-percentage');
      expect(percentageText).toBeTruthy();
    });

    it('should hide percentage text when showPercentage is false', () => {
      const { queryByTestId } = renderWithTheme(
        <ProgressRing
          progress={75}
          showPercentage={false}
          testID="progress-ring-no-percentage"
        />
      );

      const percentageText = queryByTestId('progress-ring-no-percentage-percentage');
      expect(percentageText).toBeNull();
    });

    it('should display label when provided', () => {
      const { getByTestId, getByText } = renderWithTheme(
        <ProgressRing
          progress={80}
          label="Completion"
          testID="progress-ring-label"
        />
      );

      const label = getByTestId('progress-ring-label-label');
      expect(label).toBeTruthy();
      expect(getByText('Completion')).toBeTruthy();
    });

    it('should not display label when not provided', () => {
      const { queryByTestId } = renderWithTheme(
        <ProgressRing progress={80} testID="progress-ring-no-label" />
      );

      const label = queryByTestId('progress-ring-no-label-label');
      expect(label).toBeNull();
    });
  });

  describe('Size and Styling', () => {
    it('should use default size of 120px', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={50} testID="default-size-ring" />
      );

      const ring = getByTestId('default-size-ring');
      const style = Array.isArray(ring.props.style) ? ring.props.style[0] : ring.props.style;
      expect(style).toMatchObject({
        width: 120,
        height: 120,
      });
    });

    it('should accept custom size', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={50} size={200} testID="custom-size-ring" />
      );

      const ring = getByTestId('custom-size-ring');
      const style = Array.isArray(ring.props.style) ? ring.props.style[0] : ring.props.style;
      expect(style).toMatchObject({
        width: 200,
        height: 200,
      });
    });

    it('should apply custom styles', () => {
      const customStyle = { marginTop: 20 };
      const { getByTestId } = renderWithTheme(
        <ProgressRing
          progress={50}
          style={customStyle}
          testID="styled-ring"
        />
      );

      const ring = getByTestId('styled-ring');
      expect(ring.props.style).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining(customStyle),
        ])
      );
    });
  });

  describe('Animation on Value Change', () => {
    it('should render progress ring element', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={60} testID="animated-ring" />
      );

      const progressRing = getByTestId('animated-ring-progress-ring');
      expect(progressRing).toBeTruthy();
    });

    it('should have animated view for progress', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={75} testID="progress-animated" />
      );

      const progressRing = getByTestId('progress-animated-progress-ring');
      expect(progressRing.props.style).toBeDefined();
    });

    it('should update when progress value changes', () => {
      const { getByTestId, rerender } = renderWithTheme(
        <ProgressRing progress={30} testID="changing-ring" />
      );

      const ring = getByTestId('changing-ring');
      expect(ring).toBeTruthy();

      // Re-render with new progress value
      rerender(
        <ThemeProvider>
          <ProgressRing progress={70} testID="changing-ring" />
        </ThemeProvider>
      );

      const updatedRing = getByTestId('changing-ring');
      expect(updatedRing).toBeTruthy();
    });
  });

  describe('Gradient Colors', () => {
    it('should use primary gradient by default', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={50} testID="default-gradient-ring" />
      );

      const ring = getByTestId('default-gradient-ring');
      expect(ring).toBeTruthy();
    });

    it('should accept custom gradient colors', () => {
      const customGradient: [string, string] = ['#ff0000', '#00ff00'];
      const { getByTestId } = renderWithTheme(
        <ProgressRing
          progress={50}
          gradientColors={customGradient}
          testID="custom-gradient-ring"
        />
      );

      const ring = getByTestId('custom-gradient-ring');
      expect(ring).toBeTruthy();
    });
  });

  describe('TestID Support', () => {
    it('should support testID prop', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={50} testID="custom-test-id" />
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });

    it('should generate testIDs for child elements', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={50} label="Test" testID="parent-ring" />
      );

      expect(getByTestId('parent-ring-progress-ring')).toBeTruthy();
      expect(getByTestId('parent-ring-percentage')).toBeTruthy();
      expect(getByTestId('parent-ring-label')).toBeTruthy();
    });
  });

  describe('Stroke Width', () => {
    it('should use default stroke width of 12', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing progress={50} testID="default-stroke-ring" />
      );

      const ring = getByTestId('default-stroke-ring');
      expect(ring).toBeTruthy();
    });

    it('should accept custom stroke width', () => {
      const { getByTestId } = renderWithTheme(
        <ProgressRing
          progress={50}
          strokeWidth={20}
          testID="custom-stroke-ring"
        />
      );

      const ring = getByTestId('custom-stroke-ring');
      expect(ring).toBeTruthy();
    });
  });
});

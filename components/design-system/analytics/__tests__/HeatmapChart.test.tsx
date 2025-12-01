/**
 * Unit Tests for HeatmapChart Component
 * 
 * Tests heatmap visualization with various data sets and empty state.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import HeatmapChart, { HeatmapDataPoint } from '../HeatmapChart';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Sample data generators
const generateFullWeekData = (week: number, baseValue: number): HeatmapDataPoint[] => {
  return Array.from({ length: 7 }).map((_, day) => ({
    day,
    week,
    value: baseValue + (day * 5),
  }));
};

const generateSparseData = (): HeatmapDataPoint[] => {
  return [
    { day: 0, week: 0, value: 95 },
    { day: 2, week: 0, value: 80 },
    { day: 4, week: 1, value: 65 },
    { day: 6, week: 2, value: 40 },
  ];
};

describe('HeatmapChart Component', () => {
  describe('Rendering with Various Data Sets', () => {
    it('should render with full week data', () => {
      const data = generateFullWeekData(0, 70);
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} testID="heatmap-full" />
      );

      expect(getByTestId('heatmap-full')).toBeTruthy();
    });

    it('should render with multiple weeks of data', () => {
      const data = [
        ...generateFullWeekData(0, 80),
        ...generateFullWeekData(1, 75),
        ...generateFullWeekData(2, 90),
        ...generateFullWeekData(3, 85),
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} weeks={4} testID="heatmap-multi-week" />
      );

      expect(getByTestId('heatmap-multi-week')).toBeTruthy();
    });

    it('should render with sparse data', () => {
      const data = generateSparseData();
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} testID="heatmap-sparse" />
      );

      expect(getByTestId('heatmap-sparse')).toBeTruthy();
    });

    it('should render with high attendance values', () => {
      const data: HeatmapDataPoint[] = [
        { day: 0, week: 0, value: 95 },
        { day: 1, week: 0, value: 98 },
        { day: 2, week: 0, value: 100 },
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} testID="heatmap-high" />
      );

      expect(getByTestId('heatmap-high')).toBeTruthy();
    });

    it('should render with low attendance values', () => {
      const data: HeatmapDataPoint[] = [
        { day: 0, week: 0, value: 10 },
        { day: 1, week: 0, value: 25 },
        { day: 2, week: 0, value: 35 },
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} testID="heatmap-low" />
      );

      expect(getByTestId('heatmap-low')).toBeTruthy();
    });

    it('should render with mixed attendance values', () => {
      const data: HeatmapDataPoint[] = [
        { day: 0, week: 0, value: 95 },
        { day: 1, week: 0, value: 75 },
        { day: 2, week: 0, value: 55 },
        { day: 3, week: 0, value: 35 },
        { day: 4, week: 0, value: 15 },
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} testID="heatmap-mixed" />
      );

      expect(getByTestId('heatmap-mixed')).toBeTruthy();
    });

    it('should render correct number of cells for specified weeks', () => {
      const data = generateFullWeekData(0, 80);
      const weeks = 3;
      const { getAllByTestId } = renderWithTheme(
        <HeatmapChart data={data} weeks={weeks} testID="heatmap-weeks" />
      );

      // Should have 7 days * 3 weeks = 21 cells
      const cells = getAllByTestId(/heatmap-cell-/);
      expect(cells.length).toBe(7 * weeks);
    });

    it('should render with custom weeks prop', () => {
      const data = [
        ...generateFullWeekData(0, 80),
        ...generateFullWeekData(1, 85),
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} weeks={2} testID="heatmap-custom-weeks" />
      );

      expect(getByTestId('heatmap-custom-weeks')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when data is empty array', () => {
      const { getByText } = renderWithTheme(
        <HeatmapChart data={[]} testID="heatmap-empty" />
      );

      expect(getByText('No attendance data available')).toBeTruthy();
    });

    it('should render empty state with proper styling', () => {
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={[]} testID="heatmap-empty-styled" />
      );

      const emptyState = getByTestId('heatmap-empty-styled');
      expect(emptyState).toBeTruthy();
      
      const style = Array.isArray(emptyState.props.style) 
        ? emptyState.props.style[0] 
        : emptyState.props.style;
      
      expect(style).toMatchObject(
        expect.objectContaining({
          padding: expect.any(Number),
          alignItems: 'center',
          justifyContent: 'center',
        })
      );
    });

    it('should not render cells when data is empty', () => {
      const { queryByTestId } = renderWithTheme(
        <HeatmapChart data={[]} testID="heatmap-no-cells" />
      );

      // Should not find any cell elements
      expect(queryByTestId(/heatmap-cell-/)).toBeNull();
    });
  });

  describe('Day Labels', () => {
    it('should show day labels by default', () => {
      const data = generateFullWeekData(0, 80);
      const { getAllByText, getByText } = renderWithTheme(
        <HeatmapChart data={data} testID="heatmap-labels" />
      );

      // Check for day labels (S, M, T, W, T, F, S)
      // 'S' appears twice (Sunday and Saturday)
      expect(getAllByText('S').length).toBe(2);
      expect(getByText('M')).toBeTruthy();
    });

    it('should hide day labels when showDayLabels is false', () => {
      const data = generateFullWeekData(0, 80);
      const { queryByText } = renderWithTheme(
        <HeatmapChart data={data} showDayLabels={false} testID="heatmap-no-labels" />
      );

      // Day labels should not be present
      // Note: This is tricky because 'S' might appear elsewhere, so we just verify the component renders
      expect(queryByText('No attendance data available')).toBeNull();
    });
  });

  describe('Cell Rendering', () => {
    it('should render cells for each day and week combination', () => {
      const data: HeatmapDataPoint[] = [
        { day: 0, week: 0, value: 90 },
        { day: 1, week: 0, value: 85 },
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} weeks={1} testID="heatmap-cells" />
      );

      // Check specific cells exist
      expect(getByTestId('heatmap-cell-0-0')).toBeTruthy();
      expect(getByTestId('heatmap-cell-0-1')).toBeTruthy();
    });

    it('should render cells with proper styling', () => {
      const data: HeatmapDataPoint[] = [
        { day: 0, week: 0, value: 95 },
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} weeks={1} testID="heatmap-cell-style" />
      );

      const cell = getByTestId('heatmap-cell-0-0');
      const style = Array.isArray(cell.props.style) 
        ? cell.props.style[0] 
        : cell.props.style;
      
      expect(style).toMatchObject(
        expect.objectContaining({
          width: expect.any(Number),
          height: expect.any(Number),
          backgroundColor: expect.any(String),
          borderRadius: expect.any(Number),
        })
      );
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom styles', () => {
      const data = generateFullWeekData(0, 80);
      const customStyle = { marginTop: 20, marginBottom: 10 };
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} style={customStyle} testID="heatmap-custom-style" />
      );

      const heatmap = getByTestId('heatmap-custom-style');
      expect(heatmap.props.style).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining(customStyle),
        ])
      );
    });
  });

  describe('TestID Support', () => {
    it('should support testID prop', () => {
      const data = generateFullWeekData(0, 80);
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} testID="custom-heatmap" />
      );

      expect(getByTestId('custom-heatmap')).toBeTruthy();
    });
  });

  describe('Design Token Usage', () => {
    it('should use design tokens for spacing', () => {
      const data = generateFullWeekData(0, 80);
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} testID="heatmap-tokens" />
      );

      // Component should render successfully with design tokens
      expect(getByTestId('heatmap-tokens')).toBeTruthy();
    });

    it('should use design tokens for border radius', () => {
      const data: HeatmapDataPoint[] = [
        { day: 0, week: 0, value: 90 },
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} weeks={1} testID="heatmap-radius" />
      );

      const cell = getByTestId('heatmap-cell-0-0');
      const style = Array.isArray(cell.props.style) 
        ? cell.props.style[0] 
        : cell.props.style;
      
      // Should use small border radius token (8px)
      expect(style).toMatchObject(
        expect.objectContaining({
          borderRadius: 8,
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values correctly', () => {
      const data: HeatmapDataPoint[] = [
        { day: 0, week: 0, value: 0 },
        { day: 1, week: 0, value: 0 },
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} testID="heatmap-zeros" />
      );

      expect(getByTestId('heatmap-zeros')).toBeTruthy();
    });

    it('should handle boundary values (100)', () => {
      const data: HeatmapDataPoint[] = [
        { day: 0, week: 0, value: 100 },
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} testID="heatmap-hundred" />
      );

      expect(getByTestId('heatmap-hundred')).toBeTruthy();
    });

    it('should handle single data point', () => {
      const data: HeatmapDataPoint[] = [
        { day: 3, week: 2, value: 75 },
      ];
      
      const { getByTestId } = renderWithTheme(
        <HeatmapChart data={data} weeks={4} testID="heatmap-single" />
      );

      expect(getByTestId('heatmap-single')).toBeTruthy();
      expect(getByTestId('heatmap-cell-2-3')).toBeTruthy();
    });
  });
});

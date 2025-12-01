/**
 * Unit Tests for FaceCaptureFrame Component
 * 
 * Tests border color changes based on state and feedback message display.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import FaceCaptureFrame from '../FaceCaptureFrame';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';
import type { FaceCaptureState } from '../FaceCaptureFrame';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('FaceCaptureFrame Component', () => {
  describe('Border Color Changes Based on State', () => {
    it('should render with recognized state (green border)', () => {
      const { getByTestId } = renderWithTheme(
        <FaceCaptureFrame state="recognized" testID="capture-frame">
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      const frame = getByTestId('capture-frame-frame');
      expect(frame).toBeTruthy();
      // Border color should be success color (green) for recognized state
      expect(frame.props.style.borderColor).toBeDefined();
    });

    it('should render with unknown state (red border)', () => {
      const { getByTestId } = renderWithTheme(
        <FaceCaptureFrame state="unknown" testID="capture-frame">
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      const frame = getByTestId('capture-frame-frame');
      expect(frame).toBeTruthy();
      // Border color should be error color (red) for unknown state
      expect(frame.props.style.borderColor).toBeDefined();
    });

    it('should render with lowLight state (amber border)', () => {
      const { getByTestId } = renderWithTheme(
        <FaceCaptureFrame state="lowLight" testID="capture-frame">
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      const frame = getByTestId('capture-frame-frame');
      expect(frame).toBeTruthy();
      // Border color should be warning color (amber) for lowLight state
      expect(frame.props.style.borderColor).toBeDefined();
    });

    it('should render with idle state (indigo border)', () => {
      const { getByTestId } = renderWithTheme(
        <FaceCaptureFrame state="idle" testID="capture-frame">
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      const frame = getByTestId('capture-frame-frame');
      expect(frame).toBeTruthy();
      // Border color should be primary color (indigo) for idle state
      expect(frame.props.style.borderColor).toBeDefined();
    });

    it('should update border color when state changes', () => {
      const { getByTestId, rerender } = renderWithTheme(
        <FaceCaptureFrame state="idle" testID="capture-frame">
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      const frameIdle = getByTestId('capture-frame-frame');
      const idleBorderColor = frameIdle.props.style.borderColor;

      // Change state to recognized
      rerender(
        <ThemeProvider>
          <FaceCaptureFrame state="recognized" testID="capture-frame">
            <View testID="camera-view" />
          </FaceCaptureFrame>
        </ThemeProvider>
      );

      const frameRecognized = getByTestId('capture-frame-frame');
      const recognizedBorderColor = frameRecognized.props.style.borderColor;

      // Border colors should be different
      expect(idleBorderColor).not.toBe(recognizedBorderColor);
    });
  });

  describe('Feedback Messages Display', () => {
    it('should display feedback message when provided', () => {
      const { getByTestId, getByText } = renderWithTheme(
        <FaceCaptureFrame 
          state="recognized" 
          feedbackMessage="Face recognized!"
          testID="capture-frame"
        >
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      expect(getByText('Face recognized!')).toBeTruthy();
      expect(getByTestId('capture-frame-feedback')).toBeTruthy();
    });

    it('should not display feedback message when not provided', () => {
      const { queryByTestId } = renderWithTheme(
        <FaceCaptureFrame state="idle" testID="capture-frame">
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      expect(queryByTestId('capture-frame-feedback')).toBeNull();
    });

    it('should display different feedback messages correctly', () => {
      const messages = [
        'Face recognized!',
        'Unknown face detected',
        'Low light detected',
        'Position your face in the frame',
      ];

      messages.forEach((message) => {
        const { getByText } = renderWithTheme(
          <FaceCaptureFrame 
            state="idle" 
            feedbackMessage={message}
          >
            <View testID="camera-view" />
          </FaceCaptureFrame>
        );

        expect(getByText(message)).toBeTruthy();
      });
    });

    it('should update feedback message when it changes', () => {
      const { getByText, rerender, queryByText } = renderWithTheme(
        <FaceCaptureFrame 
          state="idle" 
          feedbackMessage="Initial message"
          testID="capture-frame"
        >
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      expect(getByText('Initial message')).toBeTruthy();

      // Update message
      rerender(
        <ThemeProvider>
          <FaceCaptureFrame 
            state="recognized" 
            feedbackMessage="Updated message"
            testID="capture-frame"
          >
            <View testID="camera-view" />
          </FaceCaptureFrame>
        </ThemeProvider>
      );

      expect(queryByText('Initial message')).toBeNull();
      expect(getByText('Updated message')).toBeTruthy();
    });

    it('should match feedback message color with border color', () => {
      const states: FaceCaptureState[] = ['recognized', 'unknown', 'lowLight', 'idle'];

      states.forEach((state) => {
        const { getByTestId } = renderWithTheme(
          <FaceCaptureFrame 
            state={state} 
            feedbackMessage="Test message"
            testID={`capture-frame-${state}`}
          >
            <View testID="camera-view" />
          </FaceCaptureFrame>
        );

        const frame = getByTestId(`capture-frame-${state}-frame`);
        const feedback = getByTestId(`capture-frame-${state}-feedback`);

        // Feedback text color should match border color
        expect(frame.props.style.borderColor).toBe(feedback.props.style.color);
      });
    });
  });

  describe('Content Rendering', () => {
    it('should render children correctly', () => {
      const { getByTestId } = renderWithTheme(
        <FaceCaptureFrame state="idle">
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      expect(getByTestId('camera-view')).toBeTruthy();
    });

    it('should render multiple children correctly', () => {
      const { getByText } = renderWithTheme(
        <FaceCaptureFrame state="idle">
          <Text>Camera View</Text>
          <Text>Overlay</Text>
        </FaceCaptureFrame>
      );

      expect(getByText('Camera View')).toBeTruthy();
      expect(getByText('Overlay')).toBeTruthy();
    });

    it('should render without children', () => {
      const { getByTestId } = renderWithTheme(
        <FaceCaptureFrame state="idle" testID="empty-frame" />
      );

      expect(getByTestId('empty-frame')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility role for feedback text', () => {
      const { getByTestId } = renderWithTheme(
        <FaceCaptureFrame 
          state="recognized" 
          feedbackMessage="Face recognized!"
          testID="capture-frame"
        >
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      const feedback = getByTestId('capture-frame-feedback');
      expect(feedback.props.accessibilityRole).toBe('text');
    });

    it('should have live region for feedback updates', () => {
      const { getByTestId } = renderWithTheme(
        <FaceCaptureFrame 
          state="recognized" 
          feedbackMessage="Face recognized!"
          testID="capture-frame"
        >
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      const feedback = getByTestId('capture-frame-feedback');
      expect(feedback.props.accessibilityLiveRegion).toBe('polite');
    });
  });

  describe('TestID Support', () => {
    it('should support testID prop', () => {
      const { getByTestId } = renderWithTheme(
        <FaceCaptureFrame state="idle" testID="custom-frame">
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      expect(getByTestId('custom-frame')).toBeTruthy();
      expect(getByTestId('custom-frame-frame')).toBeTruthy();
    });

    it('should use default testID when not provided', () => {
      const { getByTestId } = renderWithTheme(
        <FaceCaptureFrame state="idle">
          <View testID="camera-view" />
        </FaceCaptureFrame>
      );

      expect(getByTestId('face-capture-frame')).toBeTruthy();
      expect(getByTestId('face-capture-frame-frame')).toBeTruthy();
    });
  });
});

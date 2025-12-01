/**
 * Unit Tests for StudentProfileCard Component
 * 
 * Tests all elements render correctly and with different attendance data.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import StudentProfileCard from '../StudentProfileCard';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';
import { AttendanceStats, StudentStatus } from '../StudentProfileCard';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('StudentProfileCard Component', () => {
  const mockAttendanceStats: AttendanceStats = {
    present: 18,
    absent: 2,
    total: 20,
  };

  describe('Element Rendering', () => {
    it('should render all elements correctly', () => {
      const { getByTestId, getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="present"
          attendanceStats={mockAttendanceStats}
          testID="profile-card"
        />
      );

      // Card should render
      expect(getByTestId('profile-card')).toBeTruthy();
      
      // Avatar should render
      expect(getByTestId('profile-card-avatar')).toBeTruthy();
      
      // Name should render
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByTestId('profile-card-name')).toBeTruthy();
      
      // Student ID should render
      expect(getByText('ID: 12345')).toBeTruthy();
      expect(getByTestId('profile-card-student-id')).toBeTruthy();
      
      // Status badge should render
      expect(getByTestId('profile-card-status-badge')).toBeTruthy();
      
      // Stats should render
      expect(getByTestId('profile-card-stats')).toBeTruthy();
      expect(getByTestId('profile-card-chart-fill')).toBeTruthy();
      expect(getByTestId('profile-card-percentage')).toBeTruthy();
      expect(getByTestId('profile-card-stats-text')).toBeTruthy();
    });

    it('should render avatar with initials', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="present"
          attendanceStats={mockAttendanceStats}
        />
      );

      // Should show initials "JD"
      expect(getByText('JD')).toBeTruthy();
    });

    it('should render avatar with single initial for single name', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John"
          studentId="12345"
          status="present"
          attendanceStats={mockAttendanceStats}
        />
      );

      // Should show initial "J"
      expect(getByText('J')).toBeTruthy();
    });

    it('should render avatar with first two initials for multiple names', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Michael Doe"
          studentId="12345"
          status="present"
          attendanceStats={mockAttendanceStats}
        />
      );

      // Should show initials "JM" (first two)
      expect(getByText('JM')).toBeTruthy();
    });
  });

  describe('Status Badge', () => {
    it('should display "Present" status correctly', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="present"
          attendanceStats={mockAttendanceStats}
        />
      );

      expect(getByText('Present')).toBeTruthy();
    });

    it('should display "Absent" status correctly', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="absent"
          attendanceStats={mockAttendanceStats}
        />
      );

      expect(getByText('Absent')).toBeTruthy();
    });

    it('should display "Late" status correctly', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="late"
          attendanceStats={mockAttendanceStats}
        />
      );

      expect(getByText('Late')).toBeTruthy();
    });

    it('should display "Pending" status correctly', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="pending"
          attendanceStats={mockAttendanceStats}
        />
      );

      expect(getByText('Pending')).toBeTruthy();
    });
  });

  describe('Attendance Statistics', () => {
    it('should display correct attendance percentage', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="present"
          attendanceStats={{ present: 18, absent: 2, total: 20 }}
        />
      );

      // 18/20 = 90%
      expect(getByText('90%')).toBeTruthy();
    });

    it('should display correct attendance text', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="present"
          attendanceStats={{ present: 18, absent: 2, total: 20 }}
        />
      );

      expect(getByText('18/20 classes attended')).toBeTruthy();
    });

    it('should handle 100% attendance', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="present"
          attendanceStats={{ present: 20, absent: 0, total: 20 }}
        />
      );

      expect(getByText('100%')).toBeTruthy();
      expect(getByText('20/20 classes attended')).toBeTruthy();
    });

    it('should handle 0% attendance', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="absent"
          attendanceStats={{ present: 0, absent: 20, total: 20 }}
        />
      );

      expect(getByText('0%')).toBeTruthy();
      expect(getByText('0/20 classes attended')).toBeTruthy();
    });

    it('should handle partial attendance', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="present"
          attendanceStats={{ present: 7, absent: 3, total: 10 }}
        />
      );

      expect(getByText('70%')).toBeTruthy();
      expect(getByText('7/10 classes attended')).toBeTruthy();
    });

    it('should handle zero total classes', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="pending"
          attendanceStats={{ present: 0, absent: 0, total: 0 }}
        />
      );

      expect(getByText('0%')).toBeTruthy();
      expect(getByText('0/0 classes attended')).toBeTruthy();
    });

    it('should round percentage correctly', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="present"
          attendanceStats={{ present: 2, absent: 1, total: 3 }}
        />
      );

      // 2/3 = 66.666... should round to 67%
      expect(getByText('67%')).toBeTruthy();
    });
  });

  describe('Different Attendance Data', () => {
    it('should render with low attendance', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="Jane Smith"
          studentId="54321"
          status="absent"
          attendanceStats={{ present: 5, absent: 15, total: 20 }}
        />
      );

      expect(getByText('Jane Smith')).toBeTruthy();
      expect(getByText('25%')).toBeTruthy();
      expect(getByText('5/20 classes attended')).toBeTruthy();
    });

    it('should render with high attendance', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="Alice Johnson"
          studentId="99999"
          status="present"
          attendanceStats={{ present: 19, absent: 1, total: 20 }}
        />
      );

      expect(getByText('Alice Johnson')).toBeTruthy();
      expect(getByText('95%')).toBeTruthy();
      expect(getByText('19/20 classes attended')).toBeTruthy();
    });

    it('should render with medium attendance', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="Bob Williams"
          studentId="11111"
          status="late"
          attendanceStats={{ present: 10, absent: 10, total: 20 }}
        />
      );

      expect(getByText('Bob Williams')).toBeTruthy();
      expect(getByText('50%')).toBeTruthy();
      expect(getByText('10/20 classes attended')).toBeTruthy();
    });

    it('should render with small total classes', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="Charlie Brown"
          studentId="22222"
          status="present"
          attendanceStats={{ present: 2, absent: 0, total: 2 }}
        />
      );

      expect(getByText('Charlie Brown')).toBeTruthy();
      expect(getByText('100%')).toBeTruthy();
      expect(getByText('2/2 classes attended')).toBeTruthy();
    });

    it('should render with large total classes', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="David Lee"
          studentId="33333"
          status="present"
          attendanceStats={{ present: 90, absent: 10, total: 100 }}
        />
      );

      expect(getByText('David Lee')).toBeTruthy();
      expect(getByText('90%')).toBeTruthy();
      expect(getByText('90/100 classes attended')).toBeTruthy();
    });
  });

  describe('TestID Support', () => {
    it('should support custom testID', () => {
      const { getByTestId } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="present"
          attendanceStats={mockAttendanceStats}
          testID="custom-card"
        />
      );

      expect(getByTestId('custom-card')).toBeTruthy();
      expect(getByTestId('custom-card-avatar')).toBeTruthy();
      expect(getByTestId('custom-card-name')).toBeTruthy();
      expect(getByTestId('custom-card-student-id')).toBeTruthy();
      expect(getByTestId('custom-card-status-badge')).toBeTruthy();
      expect(getByTestId('custom-card-stats')).toBeTruthy();
    });

    it('should use default testID when not provided', () => {
      const { getByTestId } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="12345"
          status="present"
          attendanceStats={mockAttendanceStats}
        />
      );

      expect(getByTestId('student-profile-card')).toBeTruthy();
      expect(getByTestId('student-profile-card-avatar')).toBeTruthy();
    });
  });

  describe('Student Information', () => {
    it('should display student name correctly', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="Emily Davis"
          studentId="12345"
          status="present"
          attendanceStats={mockAttendanceStats}
        />
      );

      expect(getByText('Emily Davis')).toBeTruthy();
    });

    it('should display student ID correctly', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="ABC123"
          status="present"
          attendanceStats={mockAttendanceStats}
        />
      );

      expect(getByText('ID: ABC123')).toBeTruthy();
    });

    it('should handle long student names', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="Alexander Christopher Montgomery"
          studentId="12345"
          status="present"
          attendanceStats={mockAttendanceStats}
        />
      );

      expect(getByText('Alexander Christopher Montgomery')).toBeTruthy();
    });

    it('should handle numeric student IDs', () => {
      const { getByText } = renderWithTheme(
        <StudentProfileCard
          name="John Doe"
          studentId="9876543210"
          status="present"
          attendanceStats={mockAttendanceStats}
        />
      );

      expect(getByText('ID: 9876543210')).toBeTruthy();
    });
  });
});

# Implementation Plan

- [x] 1. Set up design token foundation





  - Create directory structure for design system tokens
  - Implement color token system with primary, accent, status, and role colors
  - Implement spacing scale following 8pt grid system
  - Implement typography scale with font sizes, weights, and line heights
  - Implement shadow/elevation system
  - Implement motion tokens (duration, easing, transforms)
  - Implement border radius tokens
  - Export unified token interface
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 Write property test for spacing grid consistency


  - **Property 1: Spacing Grid Consistency**
  - **Validates: Requirements 1.2**

- [x] 2. Implement theme provider and context system





  - Create ThemeContext with mode, role, and token access
  - Implement theme provider component with state management
  - Implement theme persistence using AsyncStorage
  - Implement theme mode toggle (light/dark)
  - Implement role theme switching (student/teacher/admin)
  - Implement reduced motion detection and state
  - Create useTheme hook for consuming theme context
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 5.1, 5.2, 5.3, 5.4, 6.3_

- [x] 2.1 Write property test for role-based theme application


  - **Property 2: Role-Based Theme Application**
  - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 2.2 Write property test for theme persistence round-trip


  - **Property 4: Theme Persistence Round-Trip**
  - **Validates: Requirements 5.4**

- [x] 2.3 Write property test for contrast ratio compliance


  - **Property 3: Contrast Ratio Compliance**
  - **Validates: Requirements 2.4, 5.5, 6.1**

- [x] 3. Create primitive Button component





  - Implement Button component with variant support (primary, secondary, danger, ghost)
  - Implement size variants (small, medium, large)
  - Implement loading state with spinner
  - Implement disabled state
  - Implement press animation (scale transform)
  - Implement icon support
  - Apply design tokens for colors, spacing, typography, and borders
  - Ensure 48x48px minimum touch target
  - _Requirements: 3.1, 4.2, 6.2_

- [x] 3.1 Write unit tests for Button component


  - Test all variants render correctly
  - Test press handlers are called
  - Test disabled state prevents interaction
  - Test loading state displays spinner


- [x] 3.2 Write property test for interactive element touch targets

  - **Property 5: Interactive Element Touch Targets**
  - **Validates: Requirements 6.2**

- [x] 4. Create primitive Input component





  - Implement Input component with label and error support
  - Implement focus state with indigo glow effect
  - Implement disabled state
  - Implement secure text entry for passwords
  - Implement icon support
  - Apply design tokens for height, borders, colors, and typography
  - Ensure visible focus indicators
  - _Requirements: 3.3, 6.4_

- [x] 4.1 Write unit tests for Input component


  - Test text input updates state
  - Test error messages display correctly
  - Test secure text entry works
  - Test disabled state prevents input

- [x] 5. Create primitive Card component





  - Implement Card component with variant support (default, glassmorphic, elevated)
  - Implement optional gradient header strip
  - Implement press interaction for interactive cards
  - Implement hover animation (scale transform)
  - Apply design tokens for radius, shadows, and spacing
  - _Requirements: 3.2, 4.1_

- [x] 5.1 Write unit tests for Card component


  - Test all variants render correctly
  - Test press handlers work when provided
  - Test gradient header renders when enabled
-

- [x] 6. Create Toast feedback component




  - Implement Toast component with type variants (success, error, warning, info)
  - Implement auto-dismiss with configurable duration
  - Implement shake animation for errors
  - Implement haptic feedback integration
  - Implement top positioning
  - Apply design tokens for colors and animations
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 6.1 Write unit tests for Toast component


  - Test auto-dismiss after duration
  - Test manual dismiss callback
  - Test different type variants render correctly
-

- [x] 7. Create LoadingSpinner component




  - Implement spinner with skeleton shimmer animation
  - Implement size variants
  - Apply design tokens for colors and motion
  - Use native driver for smooth animation
  - _Requirements: 4.4_

- [x] 7.1 Write property test for reduced motion compliance


  - **Property 6: Reduced Motion Compliance**
  - **Validates: Requirements 6.3**
-

- [x] 8. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create attendance-specific FaceCaptureFrame component





  - Implement animated frame around capture zone
  - Implement color-coded border states (green, red, amber)
  - Implement real-time feedback message display
  - Apply design tokens for colors and animations
  - _Requirements: 7.1, 7.2, 7.5_

- [x] 9.1 Write unit tests for FaceCaptureFrame component


  - Test border color changes based on state
  - Test feedback messages display correctly
-

- [x] 10. Create attendance-specific AttendanceActionButton component




  - Implement circular 72px button
  - Implement gradient glow effect
  - Implement pulse animation
  - Apply design tokens for colors, size, and motion
  - _Requirements: 7.4_





- [x] 10.1 Write unit tests for AttendanceActionButton component




  - Test button press handler
  - Test pulse animation runs
-

- [x] 11. Create attendance-specific StudentProfileCard component





  - Implement avatar circle display
  - Implement status badge
  - Implement attendance stats micro chart
  - Apply design tokens for layout and colors
  - _Requirements: 7.3_
- [-] 11.1 Write unit tests for StudentProfileCard component


- [x] 11.1 Write unit tests for StudentProfileCard component



  - Test all elements render correctly
  - Test with different attendance data


- [x] 12. Create analytics GlassmorphicWidget component






  - Implement glassmorphic styling with translucent background and blur
  - Implement elevation system
  - Apply design tokens for colors, shadows, and spacing


  - _Requirements: 8.1, 8.4_

- [x] 12.1 Write unit tests for GlassmorphicWidget component


  - Test glassmorphic styles are applied



  - Test content renders correctly

- [x] 13. Create analytics HeatmapChart component







  - Implement weekly attendance heatmap visualization

  - Apply design tokens for colors and spacing
  - Ensure responsive layout
  - _Requirements: 8.2_


- [x] 13.1 Write unit tests for HeatmapChart component


  - Test with various data sets
  - Test empty state
-

- [x] 14. Create analytics ProgressRing component







  - Implement circular progress ring with gradient fill
  - Implement animated progress updates
  - Apply design tokens for colors and motion
  - _Requirements: 8.3_

- [x] 14.1 Write unit tests for ProgressRing component








  - Test progress values render correctly
  - Test animation on value change

-

- [x] 15. Create bottom TabBar navigation component






  - Implement 72px height tab bar
  - Implement floating effect with shadow


  - Implement active tab highlight pill
  - Implement smooth tab switching animation


  - Apply design tokens for colors, spacing, and motion
  - _Requirements: 3.4, 4.3_

- [x] 15.1 Write unit tests for TabBar component



  - Test tab switching updates active state
  - Test all tabs render correctly


- [x] 16. Checkpoint - Ensure all tests pass









  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Create accessibility utilities


  - Implement contrast ratio calculator function
  - Implement touch target size validator
  - Implement focus indicator helper
  - Implement screen reader label generator
  - _Requirements: 6.1, 6.2, 6.4, 6.5_
- [x] 17.1 Write unit tests for accessibility utilities



- [ ] 17.1 Write unit tests for accessibility utilities




  - Test contrast ratio calculations
  - Test touch target validation

- [ ] 17.2 Write property test for focus indicator visibility



  - **Property 7: Focus Indicator Visibility**
  - **Validates: Requirements 3.5, 6.4**





- [x] 18. Create animation utilities





  - Implement standard animation presets (cardHover, buttonPress, pageTransition)
  - Implement reduced motion wrapper
  - Implement native driver helper
  - Apply design tokens for timing and easing
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.3_







- [x] 18.1 Write property test for animation easing consistency




  - **Property 10: Animation Easing Consistency**



  - **Validates: Requirements 4.5**

- [x] 19. Create layout components





  - Implement Container component with max width and padding
  - Implement Stack component for vertical spacing


  - Implement Row component for horizontal layout
  - Apply design tokens for spacing
  - _Requirements: 1.2, 8.5_

- [x] 19.1 Write unit tests for layout components









  - Test spacing is applied correctly

  - Test children render correctly

- [x] 20. Integrate design system into App.tsx








  - Wrap app with ThemeProvider
  - Load theme configuration on app start
  - Set up theme persistence


  - _Requirements: 2.5, 5.4_

- [x] 20.1 Write integration tests for theme provider



  - Test theme loads from storage
  - Test theme mode toggle works
  - Test role switching works


- [x] 21. Create design system documentation







  - Create README with overview and usage guide
  - Document all design tokens with examples
  - Document all components with prop types and examples
  - Create migration guide from old theme system
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 21.1 Write property test for typography scale consistency



  - **Property 8: Typography Scale Consistency**
  - **Validates: Requirements 1.3**

- [x] 21.2 Write property test for component style token usage



  - **Property 9: Component Style Token Usage**
  - **Validates: Requirements 1.1, 10.1**
-

- [x] 22. Final checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Screen Migration and UI Consistency

- [x] 23. Refactor authentication screens for visual consistency



  - Migrate SignInScreen to use design system tokens and components
  - Migrate SignUpScreen to use design system tokens and components
  - Migrate ForgotPasswordScreen to use design system tokens and components
  - Migrate ResetPasswordScreen to use design system tokens and components
  - Migrate EmailVerificationScreen to use design system tokens and components
  - Migrate UnverifiedScreen to use design system tokens and components
  - Apply consistent spacing using 8pt grid (tokens.spacing)
  - Replace inline styles with StyleSheet using design tokens
  - Use Button, Input, and Card components from design system
  - Ensure proper touch targets (48x48px minimum)
  - Apply consistent typography scale
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.3, 6.2_




- [x] 24. Refactor student dashboard and screens





  - Migrate StudentDashboard to use design system
  - Migrate AttendanceScreen (student) to use design system
  - Migrate AssignmentScreen (student) to use design system
  - Apply role-based theming (student blue gradient)
  - Use Card components with glassmorphic variants
  - Implement consistent stat cards with icons
  - Apply proper spacing and alignment
  - Use Stack and Row layout components


  - Replace hardcoded colors with design tokens
  - Add loading states with LoadingSpinner
  - _Requirements: 1.1, 1.2, 2.1, 3.2, 8.1, 8.4, 8.5_

- [x] 25. Refactor teacher dashboard and management screens





  - Migrate TeacherDashboard to use design system
  - Migrate AttendanceManager to use design system
  - Migrate AssignmentManager to use design system
  - Migrate MarksReviewManager to use design system
  - Apply role-based theming (teacher green gradient)
  - Use specialized attendance components (FaceCaptureFrame, AttendanceActionButton)

  - Implement FilterBar for list filtering
  - Use consistent card layouts for list items
  - Apply status badges with accessible colors
  - Add proper elevation and shadows
  - _Requirements: 1.1, 1.2, 2.2, 3.2, 7.1, 7.2, 7.3, 7.4_

- [x] 26. Refactor admin dashboard and management screens






  - Migrate AdminDashboard to use design system
  - Migrate UserManagement to use design system
  - Migrate ReportsScreen to use design system
  - Apply role-based theming (admin purple gradient)
  - Use GlassmorphicWidget for analytics cards 

  - Implement HeatmapChart for attendance visualization
  - Use ProgressRing for metrics display
  - Apply consistent grid layout for user management
  - Style search bars and filters consistently
  - Add proper section headers and dividers
  - _Requirements: 1.1, 1.2, 2.3, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 27. Refactor profile and settings screens





  - Migrate ProfileScreen to use design system
  - Migrate SettingsScreen to use design system
  - Migrate ChangePasswordScreen to use design system
  - Create gradient profile header

  - Style profile picture with shadow
  - Use grouped sections with proper spacing
  - Apply consistent iconography
  - Style form inputs using Input component
  - Add theme toggle UI in settings
  - Implement proper list item styling
  - _Requirements: 1.1, 1.2, 1.3, 3.3, 5.4_

- [ ] 28. Refactor utility and legal screens
  - Migrate NotificationsScreen to use design system

  - Migrate PrivacyPolicyScreen to use design system
  - Migrate TermsScreen to use design system
  - Apply consistent typography for content
  - Use proper spacing for readability
  - Style notification items as cards
  - Add proper section headers
  - Ensure scrollable content with proper padding
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 29. Refactor existing UI components for consistency





  - Review and update AnimatedCard component
  - Review and update FilterBar component

  - Review and update SkeletonLoader component
  - Review and update DateRangePicker component
  - Review and update ImagePickerComponent component
  - Review and update ConfirmDialog component
  - Ensure all use design tokens (no hardcoded values)
  - Apply consistent radius, padding, and shadows
  - Improve animations using motion tokens
  - Update typography to use design system scale
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.5_

- [x] 30. Final UI polish and consistency pass





  - Review all screens for spacing consistency

  - Verify all text uses design system typography
  - Ensure all colors reference design tokens
  - Check all interactive elements meet 48x48px minimum
  - Verify contrast ratios meet WCAG AA standards
  - Remove all unused styles
  - Ensure layout symmetry and visual balance
  - Add subtle animations where appropriate
  - Test theme switching across all screens
  - Test role-based theming across all screens
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 6.1, 6.2_

- [x] 31. Final checkpoint - Complete UI consistency verification

  - Ensure all tests pass, ask the user if questions arise.

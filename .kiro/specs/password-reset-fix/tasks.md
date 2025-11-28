# Implementation Plan

- [x] 1. Configure deep linking in the app


  - Add custom URL scheme to `app.json` under expo configuration
  - Use scheme format: `myapp://` (or appropriate app name)
  - _Requirements: 5.1_



- [ ] 2. Update type definitions for new screen
  - Add `ResetPassword: { token?: string }` to RootStackParamList in `lib/types.ts`
  - _Requirements: 2.2, 3.1_



- [ ] 3. Create utility functions for validation and parsing
- [ ] 3.1 Create validation utility file
  - Write `isValidEmail()` function that can be shared across screens
  - Write `validatePassword()` function that checks minimum length (8 chars)
  - Write `calculatePasswordStrength()` function for strength indicator
  - _Requirements: 1.4, 3.1, 4.1, 4.4_

- [ ]* 3.2 Write property test for email validation
  - **Property 1: Email validation rejects invalid formats**
  - **Validates: Requirements 1.4**

- [ ]* 3.3 Write property test for password validation
  - **Property 3: Password validation enforces requirements**
  - **Validates: Requirements 3.1**



- [ ]* 3.4 Write property test for password strength calculation
  - **Property 5: Password strength calculation consistency**
  - **Validates: Requirements 4.1**

- [ ] 3.5 Create deep link parsing utility
  - Write `parseDeepLink()` function to extract route and parameters from URL
  - Handle malformed URLs gracefully
  - _Requirements: 5.3, 5.4_



- [ ]* 3.6 Write property test for deep link parsing
  - **Property 2: Deep link parsing extracts reset tokens**
  - **Property 6: Deep link parameter extraction**
  - **Validates: Requirements 2.2, 5.3**

- [ ] 4. Create ResetPasswordScreen component
- [x] 4.1 Implement ResetPasswordScreen with UI

  - Create new file `screens/ResetPasswordScreen.tsx`
  - Add password and confirm password input fields with visibility toggles
  - Integrate PasswordStrengthIndicator component
  - Add form validation and error/success messages
  - Follow existing screen patterns (KeyboardAvoidingView, ScrollView, Card layout)
  - Use react-native-paper components for consistency
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.5_

- [ ] 4.2 Implement password reset submission logic
  - Extract token from route params
  - Call Supabase `updateUser()` with new password
  - Handle success: show message and navigate to SignIn
  - Handle errors: display appropriate error messages
  - Handle invalid/expired token: redirect to ForgotPassword
  - _Requirements: 3.4, 3.5, 2.3_

- [x]* 4.3 Write property test for password matching


  - **Property 4: Password confirmation matching**
  - **Validates: Requirements 3.2**

- [ ]* 4.4 Write unit tests for ResetPasswordScreen
  - Test password validation with edge cases (empty, too short, exactly 8 chars)
  - Test error handling for invalid token
  - Test success flow navigation
  - _Requirements: 3.1, 3.5, 2.3_

- [x] 5. Update ForgotPasswordScreen


  - Change `redirectTo` URL from `'your-app://reset-password'` to use the configured scheme (e.g., `'myapp://reset-password'`)
  - Ensure it matches the scheme in app.json
  - _Requirements: 1.3, 2.1_

- [ ]* 5.1 Write unit tests for ForgotPasswordScreen
  - Test email validation with specific examples
  - Test success message display
  - Test that non-existent emails show same success message (security requirement)
  - _Requirements: 1.2, 1.5_

- [ ] 6. Add deep link handling to App.tsx
- [ ] 6.1 Implement deep link listener
  - Import Linking from 'react-native'
  - Add useEffect hook to listen for deep links using `Linking.addEventListener`
  - Handle deep links when app is closed, backgrounded, or active
  - Parse incoming URLs using the utility function
  - _Requirements: 5.2, 5.5_

- [x] 6.2 Implement navigation logic for deep links

  - When URL contains `reset-password` route, navigate to ResetPassword screen
  - Pass token parameter from URL to screen
  - Handle malformed URLs by navigating to SignIn
  - _Requirements: 2.2, 5.4_

- [x] 6.3 Add ResetPasswordScreen to navigation stack


  - Import ResetPasswordScreen component
  - Add Stack.Screen for ResetPassword in the auth stack (unauthenticated section)
  - Configure screen options (title, header)
  - _Requirements: 2.2_

- [x] 7. Refactor shared validation logic


  - Move `isValidEmail()` from SignInScreen and ForgotPasswordScreen to the shared utility file
  - Update both screens to import and use the shared function
  - _Requirements: 1.4_

- [x] 8. Install and configure property-based testing library


  - Install fast-check: `npm install --save-dev fast-check @types/fast-check`
  - Configure Jest to work with fast-check (if needed)
  - _Requirements: All property tests_

- [x] 9. Final checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

# Design Document

## Overview

This design addresses the non-functional password reset feature in the mobile application. The current implementation sends reset emails but lacks proper deep link configuration and a screen to handle password updates. The solution involves three main components: configuring deep links in the Expo app, creating a new ResetPasswordScreen to handle the actual password change, and updating the ForgotPasswordScreen to use the correct redirect URL.

The password reset flow will work as follows:
1. User requests password reset via ForgotPasswordScreen
2. Supabase sends email with deep link containing reset token
3. User clicks link, which opens the app via deep linking
4. App navigates to ResetPasswordScreen with the token
5. User enters new password and submits
6. Password is updated and user is redirected to sign-in

## Architecture

### Deep Link Configuration
- Configure custom URL scheme in `app.json` (e.g., `myapp://`)
- Use Expo's Linking API to handle incoming deep links
- Parse URLs to extract routes and parameters (specifically the reset token)

### Navigation Flow
```
ForgotPasswordScreen → Email with Deep Link → App Opens → ResetPasswordScreen → SignInScreen
```

### Component Structure
- **ForgotPasswordScreen** (existing, needs update): Handles password reset request
- **ResetPasswordScreen** (new): Handles password update with token
- **App.tsx** (needs update): Add deep link listener and ResetPasswordScreen to navigation
- **types.ts** (needs update): Add ResetPassword route type

## Components and Interfaces

### ResetPasswordScreen Component

**Props:**
```typescript
type Props = StackScreenProps<RootStackParamList, 'ResetPassword'>;
```

**State:**
```typescript
{
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  errorMsg: string;
  successMsg: string;
  isSubmitting: boolean;
  token: string | null;
}
```

**Methods:**
- `handleResetPassword()`: Validates and submits new password
- `validatePassword()`: Checks password strength requirements
- `checkPasswordMatch()`: Verifies password and confirmation match

### Deep Link Handler

**Location:** App.tsx

**Interface:**
```typescript
interface DeepLinkHandler {
  url: string;
  parseUrl: (url: string) => { route: string; params: Record<string, string> };
  handleDeepLink: (url: string) => void;
}
```

**URL Format:**
```
myapp://reset-password?token=<reset_token>
```

### Updated RootStackParamList

```typescript
export type RootStackParamList = {
  // ... existing routes
  ResetPassword: { token?: string };
  // ... rest of routes
};
```

## Data Models

### Password Reset Request
```typescript
{
  email: string;
  redirectTo: string; // Deep link URL
}
```

### Password Update Request
```typescript
{
  password: string;
  token: string; // From URL parameter
}
```

### Password Validation Rules
```typescript
{
  minLength: 8;
  requiresUppercase: false; // Optional
  requiresLowercase: false; // Optional
  requiresNumber: false; // Optional
  requiresSpecialChar: false; // Optional
}
```

## Correctnes
s Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all testable criteria from the prework, I've identified the following properties that provide unique validation value:

- **Property 1** (from 1.4): Email validation should reject all invalid formats
- **Property 2** (from 2.2): Deep link URL parsing should correctly extract tokens
- **Property 3** (from 3.1): Password validation should enforce minimum requirements
- **Property 4** (from 3.2): Password confirmation matching should work for all inputs
- **Property 5** (from 4.1): Password strength calculation should be consistent
- **Property 6** (from 4.4): Minimum password length validation (8 characters)
- **Property 7** (from 5.3): Deep link parsing should extract all parameters

Note: Properties 2 and 7 are related but Property 7 is more general (all parameters) while Property 2 is specific to reset tokens. Property 6 is subsumed by Property 3 (general password validation). After reflection, we'll keep Properties 1, 2, 3, 4, 5, and 7.

### Properties

**Property 1: Email validation rejects invalid formats**
*For any* string that does not match the email format pattern (contains @, has domain, etc.), the email validation function should return false and prevent submission
**Validates: Requirements 1.4**

**Property 2: Deep link parsing extracts reset tokens**
*For any* valid deep link URL containing a reset-password route and token parameter, the URL parser should correctly extract the token value
**Validates: Requirements 2.2**

**Property 3: Password validation enforces requirements**
*For any* password string, the validation function should correctly identify whether it meets all security requirements (minimum length, etc.)
**Validates: Requirements 3.1**

**Property 4: Password confirmation matching**
*For any* pair of password strings, the matching function should return true if and only if the strings are identical
**Validates: Requirements 3.2**

**Property 5: Password strength calculation consistency**
*For any* password string, calculating the strength multiple times should always return the same strength value
**Validates: Requirements 4.1**

**Property 6: Deep link parameter extraction**
*For any* valid deep link URL with query parameters, the parser should extract all parameter key-value pairs correctly
**Validates: Requirements 5.3**

## Error Handling

### Network Errors
- Display user-friendly error messages when Supabase API calls fail
- Retry logic is not needed as password reset is not time-critical
- Show generic error message for network failures

### Invalid Token Errors
- When Supabase returns an error for invalid/expired token, display specific message
- Redirect user back to ForgotPasswordScreen to request a new reset link
- Clear any stored token data

### Validation Errors
- Display inline error messages for invalid email format
- Show real-time feedback for password validation failures
- Prevent form submission when validation fails

### Deep Link Errors
- If deep link URL is malformed, log error and navigate to SignIn
- If token parameter is missing, redirect to ForgotPasswordScreen
- Handle case where app opens without proper navigation context

## Testing Strategy

### Unit Testing

We'll use Jest (already configured in React Native/Expo projects) for unit tests. Unit tests will cover:

- Email validation function with specific examples (valid and invalid emails)
- Password validation function with edge cases (empty, too short, exactly 8 chars)
- Password matching function with specific examples
- Deep link URL parsing with example URLs
- Password strength calculation with specific passwords

### Property-Based Testing

We'll use **fast-check** (a property-based testing library for JavaScript/TypeScript) for property tests. Each property-based test will:

- Run a minimum of 100 iterations with randomly generated inputs
- Be tagged with a comment referencing the correctness property from this design document
- Use the format: `**Feature: password-reset-fix, Property {number}: {property_text}**`

Property tests will cover:

1. **Property 1**: Generate random invalid email strings and verify rejection
2. **Property 2**: Generate random valid deep link URLs with tokens and verify extraction
3. **Property 3**: Generate random password strings and verify validation correctness
4. **Property 4**: Generate random password pairs and verify matching logic
5. **Property 5**: Generate random passwords and verify strength calculation consistency
6. **Property 6**: Generate random deep link URLs with various parameters and verify extraction

Each correctness property will be implemented by a single property-based test. Tests will be placed in files adjacent to the components they test (e.g., `ResetPasswordScreen.test.tsx`).

### Integration Testing

While not part of the core unit/property testing, we should manually test:
- End-to-end password reset flow
- Deep link handling on actual devices
- Email delivery and link clicking

## Implementation Notes

### Expo Deep Linking Setup
- Add `scheme` to `app.json` under `expo` configuration
- Use `Linking.addEventListener` in App.tsx to listen for URLs
- Parse URL using `Linking.parse()` utility

### Supabase Configuration
- The `redirectTo` URL must match the scheme configured in app.json
- Format: `{scheme}://reset-password?token={token}`
- Supabase automatically appends the token as a URL parameter

### Password Strength Indicator
- Use the existing `PasswordStrengthIndicator` component from the codebase
- Calculate strength based on length, character variety, common patterns
- Display visual feedback (weak/medium/strong) with color coding

### Security Considerations
- Never log or store the reset token
- Token is single-use and expires (handled by Supabase)
- Don't reveal whether an email exists in the system (requirement 1.2)
- Use secure text entry for password fields by default

### UI/UX Consistency
- Follow existing screen patterns from SignInScreen and ForgotPasswordScreen
- Use react-native-paper components for consistency
- Maintain the same styling approach (colors, spacing, typography from theme)
- Show loading states during API calls
- Provide clear success/error feedback

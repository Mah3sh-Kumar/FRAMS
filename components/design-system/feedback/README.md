# Feedback Components

Feedback components provide user feedback through visual and haptic cues.

## Toast Component

The Toast component displays temporary messages with different type variants, auto-dismiss functionality, animations, and haptic feedback.

### Features

- **Type Variants**: success, error, warning, info
- **Auto-dismiss**: Configurable duration (default: 3000ms)
- **Animations**: Fade in/out, slide from top, shake animation for errors
- **Haptic Feedback**: Device vibration based on toast type
- **Top Positioning**: Displays at the top of the screen
- **Accessibility**: Proper ARIA roles and live regions

### Usage

#### Using ToastProvider (Recommended)

Wrap your app with `ToastProvider` and use the `useToast` hook:

```tsx
import { ToastProvider, useToast } from './components/design-system/feedback';

// In your App.tsx
function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}

// In any component
function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleError = () => {
    showError('Something went wrong', 5000); // Custom duration
  };

  return (
    <Button onPress={handleSuccess}>
      Complete Action
    </Button>
  );
}
```

#### Direct Usage

```tsx
import Toast from './components/design-system/feedback/Toast';

function MyComponent() {
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <Button onPress={() => setShowToast(true)}>
        Show Toast
      </Button>
      
      {showToast && (
        <Toast
          type="success"
          message="Action completed!"
          duration={3000}
          onDismiss={() => setShowToast(false)}
          haptic={true}
        />
      )}
    </>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | Required | Type of toast, determines color and icon |
| `message` | `string` | Required | Message to display |
| `duration` | `number` | `3000` | Duration in milliseconds before auto-dismiss |
| `onDismiss` | `() => void` | Required | Callback when toast is dismissed |
| `haptic` | `boolean` | `true` | Enable haptic feedback |
| `testID` | `string` | - | Test identifier for testing |

### Type Variants

#### Success
- **Color**: Green (#15803d)
- **Icon**: ✓
- **Haptic**: Success notification
- **Use**: Successful operations, confirmations

#### Error
- **Color**: Red (#b91c1c)
- **Icon**: ✕
- **Haptic**: Error notification
- **Animation**: Shake animation
- **Use**: Errors, failures, validation issues

#### Warning
- **Color**: Yellow (#a16207)
- **Icon**: ⚠
- **Haptic**: Warning notification
- **Use**: Warnings, cautions, important notices

#### Info
- **Color**: Blue (#1d4ed8)
- **Icon**: ℹ
- **Haptic**: Light impact
- **Use**: Information, tips, neutral messages

### Accessibility

The Toast component follows accessibility best practices:

- Uses `accessibilityRole="alert"` for screen readers
- Uses `accessibilityLiveRegion="polite"` for announcements
- Respects reduced motion preferences
- Provides sufficient contrast ratios
- Auto-dismisses to avoid blocking content

### Design Tokens

The Toast component uses the following design tokens:

- **Colors**: `tokens.colors.success`, `tokens.colors.error`, `tokens.colors.warning`, `tokens.colors.info`
- **Spacing**: `tokens.spacing.lg`, `tokens.spacing.md`
- **Borders**: `tokens.borders.radius.medium`
- **Shadows**: `tokens.shadows.md`
- **Motion**: `tokens.motion.duration.fast`, `tokens.motion.duration.normal`
- **Typography**: `tokens.typography.body`, `tokens.typography.h3`

### Requirements

Validates the following requirements:
- 9.1: Success feedback with success color
- 9.2: Error feedback with error color and shake animation
- 9.3: Warning feedback with warning color
- 9.4: Haptic feedback on supported devices
- 9.5: Auto-dismiss after 3-5 seconds

### Testing

Unit tests cover:
- All type variants render correctly
- Auto-dismiss after default and custom durations
- Manual dismiss callback
- Accessibility properties
- Haptic feedback configuration

Run tests:
```bash
npm test -- components/design-system/feedback/__tests__/Toast.test.tsx
```

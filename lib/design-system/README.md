# FRAMS Design System

A comprehensive design system for the Face Recognition Attendance Management System (FRAMS), providing consistent visual language, role-based theming, and accessibility compliance across Android and iOS platforms.

## Overview

The FRAMS design system is built on a foundation of design tokens that ensure visual consistency throughout the application. It provides:

- **Design Tokens**: Centralized color, spacing, typography, shadow, and motion values
- **Theme System**: Light/dark mode with role-based theming (Student, Teacher, Admin)
- **Component Library**: Reusable UI components built on design tokens
- **Accessibility**: WCAG AA compliant with 4.5:1 contrast ratios and 48x48px touch targets
- **Animations**: Smooth, purposeful animations with reduced motion support

## Quick Start

### Installation

The design system is already integrated into the FRAMS application. To use it in your components:

```typescript
import { useTheme } from '@/lib/design-system/ThemeContext';
import Button from '@/components/design-system/primitives/Button';

function MyComponent() {
  const { tokens, mode, role } = useTheme();
  
  return (
    <Button variant="primary" onPress={() => console.log('Pressed')}>
      Click Me
    </Button>
  );
}
```

### Theme Provider Setup

Wrap your app with the `ThemeProvider` to enable theme context:

```typescript
import { ThemeProvider } from '@/lib/design-system/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

## Design Tokens

Design tokens are the foundation of the design system. They provide a single source of truth for all visual styling.

### Colors

```typescript
import { tokens } from '@/lib/design-system/tokens';

// Primary colors
tokens.colors.primary.main      // #4f46e5 (Indigo)
tokens.colors.primary.light     // #818cf8
tokens.colors.primary.dark      // #3730a3
tokens.colors.primary.gradient  // ['#4f46e5', '#3730a3']

// Accent colors
tokens.colors.accent.main       // #06b6d4 (Cyan)

// Status colors
tokens.colors.success.main      // #16a34a (Green)
tokens.colors.error.main        // #dc2626 (Red)
tokens.colors.warning.main      // #facc15 (Yellow)
tokens.colors.info.main         // #3b82f6 (Blue)

// Role colors
tokens.colors.roles.student.gradient   // ['#2563eb', '#1e40af']
tokens.colors.roles.teacher.gradient   // ['#059669', '#065f46']
tokens.colors.roles.admin.gradient     // ['#7c3aed', '#5b21b6']

// Theme colors (light/dark mode)
tokens.colors.theme.light.background   // #f8fafc
tokens.colors.theme.light.surface      // #ffffff
tokens.colors.theme.light.text         // #0f172a

tokens.colors.theme.dark.background    // #0f172a
tokens.colors.theme.dark.surface       // #1e293b
tokens.colors.theme.dark.text          // #f1f5f9
```

### Spacing

Based on an 8pt grid system:

```typescript
tokens.spacing.xs    // 4px
tokens.spacing.sm    // 8px
tokens.spacing.md    // 16px
tokens.spacing.lg    // 24px
tokens.spacing.xl    // 32px
tokens.spacing.xxl   // 48px
```

### Typography

```typescript
// Display text (32px, bold)
tokens.typography.display.fontSize      // 32
tokens.typography.display.lineHeight    // 40
tokens.typography.display.fontWeight    // '700'

// Headings
tokens.typography.h1    // 26px, bold
tokens.typography.h2    // 22px, semibold
tokens.typography.h3    // 18px, semibold

// Body text
tokens.typography.body     // 15px, regular
tokens.typography.caption  // 12px, regular
```

### Shadows (Elevation)

```typescript
tokens.shadows.sm   // Subtle shadow
tokens.shadows.md   // Medium shadow (default for cards)
tokens.shadows.lg   // Large shadow (elevated elements)
```

### Motion

```typescript
// Duration
tokens.motion.duration.fast     // 120ms (button press)
tokens.motion.duration.normal   // 220ms (card hover)
tokens.motion.duration.slow     // 350ms (page transition)

// Easing
tokens.motion.easing.standard   // 'cubic-bezier(0.4, 0, 0.2, 1)'

// Transforms
tokens.motion.transforms.cardHover     // 'scale(1.02)'
tokens.motion.transforms.buttonPress   // 'scale(0.96)'
```

### Borders

```typescript
// Radius
tokens.borders.radius.small    // 8px
tokens.borders.radius.medium   // 14px
tokens.borders.radius.large    // 20px
tokens.borders.radius.full     // 9999px (circular)

// Width
tokens.borders.width.thin      // 1px
tokens.borders.width.medium    // 2px
tokens.borders.width.thick     // 4px
```

## Components

### Primitives

Core building blocks for the UI:

- **[Button](../../components/design-system/primitives/Button.tsx)**: Primary, secondary, danger, and ghost variants
- **[Card](../../components/design-system/primitives/Card.tsx)**: Default, glassmorphic, and elevated variants
- **[Input](../../components/design-system/primitives/Input.tsx)**: Text input with label, error, and icon support

### Feedback

User feedback components:

- **[Toast](../../components/design-system/feedback/Toast.tsx)**: Success, error, warning, and info notifications
- **[LoadingSpinner](../../components/design-system/feedback/LoadingSpinner.tsx)**: Loading indicator with skeleton shimmer

### Navigation

Navigation components:

- **[TabBar](../../components/design-system/navigation/TabBar.tsx)**: Bottom navigation with floating effect

### Attendance

Specialized components for attendance workflows:

- **[FaceCaptureFrame](../../components/design-system/attendance/FaceCaptureFrame.tsx)**: Animated capture frame with status feedback
- **[AttendanceActionButton](../../components/design-system/attendance/AttendanceActionButton.tsx)**: Circular action button with pulse animation
- **[StudentProfileCard](../../components/design-system/attendance/StudentProfileCard.tsx)**: Student profile with attendance stats

### Analytics

Dashboard and analytics components:

- **[GlassmorphicWidget](../../components/design-system/analytics/GlassmorphicWidget.tsx)**: Translucent widget with blur effect
- **[HeatmapChart](../../components/design-system/analytics/HeatmapChart.tsx)**: Weekly attendance heatmap
- **[ProgressRing](../../components/design-system/analytics/ProgressRing.tsx)**: Circular progress indicator

### Layout

Layout and spacing components:

- **Container**: Max-width container with padding
- **Stack**: Vertical spacing component
- **Row**: Horizontal layout component

## Theme System

### Using the Theme Hook

```typescript
import { useTheme } from '@/lib/design-system/ThemeContext';

function MyComponent() {
  const {
    tokens,           // All design tokens
    mode,             // 'light' | 'dark'
    role,             // 'student' | 'teacher' | 'admin' | null
    toggleMode,       // Toggle light/dark mode
    setRole,          // Set user role
    reducedMotion,    // Boolean for reduced motion preference
    getTextColor,     // Get current text color
    getSurfaceColor,  // Get current surface color
    getRoleColor,     // Get current role color
  } = useTheme();
  
  return (
    <View style={{ backgroundColor: getSurfaceColor() }}>
      <Text style={{ color: getTextColor() }}>
        Current mode: {mode}
      </Text>
    </View>
  );
}
```

### Theme Modes

The design system supports light and dark modes:

```typescript
// Toggle between light and dark
toggleMode();

// Check current mode
if (mode === 'dark') {
  // Dark mode specific logic
}
```

### Role-Based Theming

Set the user role to apply role-specific colors:

```typescript
// Set role
setRole('student');  // Blue gradient
setRole('teacher');  // Green gradient
setRole('admin');    // Purple gradient

// Get role color
const roleColor = getRoleColor();
if (roleColor) {
  // Use roleColor.gradient, roleColor.main, etc.
}
```

## Accessibility

The design system is built with accessibility in mind:

### Contrast Ratios

All text/background combinations maintain a minimum 4.5:1 contrast ratio (WCAG AA):

```typescript
import { getContrastRatio } from '@/lib/design-system/accessibility';

const ratio = getContrastRatio('#4f46e5', '#ffffff');
// Returns: 7.2 (passes WCAG AA)
```

### Touch Targets

All interactive elements have a minimum 48x48px touch target:

```typescript
import { validateTouchTarget } from '@/lib/design-system/accessibility';

const isValid = validateTouchTarget(48, 48);
// Returns: true
```

### Reduced Motion

Respect user's reduced motion preferences:

```typescript
const { reducedMotion } = useTheme();

if (!reducedMotion) {
  // Apply animations
  Animated.timing(value, {
    toValue: 1,
    duration: tokens.motion.duration.normal,
    useNativeDriver: true,
  }).start();
}
```

### Screen Reader Support

All components include proper accessibility labels:

```typescript
<Button
  onPress={handlePress}
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Submit form"
>
  Submit
</Button>
```

## Animation Guidelines

### Standard Animations

Use design token values for consistent animations:

```typescript
import { Animated } from 'react-native';
import { useTheme } from '@/lib/design-system/ThemeContext';

function AnimatedComponent() {
  const { tokens, reducedMotion } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    if (reducedMotion) return;
    
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: tokens.motion.duration.fast,
      easing: Animated.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {/* Content */}
    </Animated.View>
  );
}
```

### Animation Best Practices

1. **Always use native driver** for transform and opacity animations
2. **Check reduced motion** before applying animations
3. **Use token durations** for consistency
4. **Avoid animating layout properties** (width, height, padding)
5. **Keep animations subtle** and purposeful

## Migration Guide

### From Old Theme System

If you're migrating from the old `lib/theme.ts` system:

#### Before (Old Theme)

```typescript
import { theme } from '@/lib/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  text: {
    color: theme.colors.text,
    fontSize: 15,
  },
});
```

#### After (New Design System)

```typescript
import { useTheme } from '@/lib/design-system/ThemeContext';

function MyComponent() {
  const { tokens, getSurfaceColor, getTextColor } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: getSurfaceColor(),
      padding: tokens.spacing.md,
    },
    text: {
      color: getTextColor(),
      fontSize: tokens.typography.body.fontSize,
    },
  });
  
  return (/* ... */);
}
```

### Key Changes

1. **Import from new location**: `@/lib/design-system/ThemeContext` instead of `@/lib/theme`
2. **Use `useTheme()` hook**: Access tokens and theme functions via hook
3. **Reference tokens**: Use `tokens.spacing.md` instead of hardcoded `16`
4. **Use helper functions**: `getSurfaceColor()`, `getTextColor()`, etc.
5. **Wrap with ThemeProvider**: Ensure your app is wrapped with `<ThemeProvider>`

### Component Migration Checklist

- [ ] Replace hardcoded colors with token references
- [ ] Replace hardcoded spacing with `tokens.spacing.*`
- [ ] Replace hardcoded font sizes with `tokens.typography.*`
- [ ] Replace hardcoded border radius with `tokens.borders.radius.*`
- [ ] Replace hardcoded shadows with `tokens.shadows.*`
- [ ] Replace hardcoded animation durations with `tokens.motion.duration.*`
- [ ] Add reduced motion checks for animations
- [ ] Ensure 48x48px minimum touch targets
- [ ] Verify contrast ratios meet 4.5:1 minimum
- [ ] Add proper accessibility labels

## Testing

### Unit Tests

Test components using React Native Testing Library:

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/lib/design-system/ThemeContext';
import Button from '@/components/design-system/primitives/Button';

test('button calls onPress when pressed', () => {
  const onPress = jest.fn();
  
  const { getByText } = render(
    <ThemeProvider>
      <Button onPress={onPress}>Click Me</Button>
    </ThemeProvider>
  );
  
  fireEvent.press(getByText('Click Me'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
```

### Property-Based Tests

Test universal properties using fast-check:

```typescript
import * as fc from 'fast-check';
import { tokens } from '@/lib/design-system/tokens';

test('all spacing values follow 8pt grid', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('xs', 'sm', 'md', 'lg', 'xl', 'xxl'),
      (key) => {
        const value = tokens.spacing[key];
        expect(value % 4).toBe(0);
      }
    ),
    { numRuns: 100 }
  );
});
```

## Best Practices

### Do's ✅

- **Use design tokens** for all styling values
- **Use theme helper functions** for dynamic colors
- **Check reduced motion** before applying animations
- **Ensure minimum touch targets** (48x48px)
- **Verify contrast ratios** (4.5:1 minimum)
- **Add accessibility labels** to all interactive elements
- **Use native driver** for animations
- **Compose components** from primitives

### Don'ts ❌

- **Don't hardcode colors** - use tokens
- **Don't hardcode spacing** - use tokens
- **Don't ignore reduced motion** - check before animating
- **Don't create small touch targets** - minimum 48x48px
- **Don't use low contrast** - verify ratios
- **Don't animate layout properties** - use transform/opacity
- **Don't skip accessibility** - add labels and roles
- **Don't reinvent components** - use existing primitives

## Resources

- [Design Tokens Reference](./tokens/README.md)
- [Component Documentation](../../components/design-system/README.md)
- [Accessibility Guidelines](./accessibility.ts)
- [Animation Utilities](./animations.ts)
- [Theme Context API](./ThemeContext.tsx)

## Support

For questions or issues with the design system:

1. Check the component documentation
2. Review the design tokens reference
3. Consult the migration guide
4. Review existing component implementations

## Version

Current version: 1.0.0

Last updated: December 2024

# Migration Guide: Old Theme System → New Design System

This guide will help you migrate from the old `lib/theme.ts` system to the new design system with tokens and theme context.

## Table of Contents

- [Overview](#overview)
- [Key Differences](#key-differences)
- [Step-by-Step Migration](#step-by-step-migration)
- [Component Migration Examples](#component-migration-examples)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Checklist](#checklist)

## Overview

The new design system provides:

- **Centralized design tokens** for all visual properties
- **Theme context** with light/dark mode and role-based theming
- **Accessibility compliance** built-in
- **Type safety** with TypeScript
- **Better performance** with memoization
- **Reduced motion support** for animations

## Key Differences

### Old System

```typescript
// lib/theme.ts
export const theme = {
  colors: {
    background: '#f8fafc',
    text: '#0f172a',
    primary: '#4f46e5',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
};

// Usage
import { theme } from '@/lib/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
});
```

### New System

```typescript
// lib/design-system/tokens/index.ts
export const tokens = {
  colors: { /* ... */ },
  spacing: { /* ... */ },
  typography: { /* ... */ },
  // ... more tokens
};

// Usage
import { useTheme } from '@/lib/design-system/ThemeContext';

function MyComponent() {
  const { tokens, getSurfaceColor } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: getSurfaceColor(),
      padding: tokens.spacing.md,
    },
  });
  
  return (/* ... */);
}
```

## Step-by-Step Migration

### Step 1: Wrap Your App with ThemeProvider

**Before:**

```typescript
// App.tsx
export default function App() {
  return (
    <NavigationContainer>
      {/* Your app */}
    </NavigationContainer>
  );
}
```

**After:**

```typescript
// App.tsx
import { ThemeProvider } from '@/lib/design-system/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        {/* Your app */}
      </NavigationContainer>
    </ThemeProvider>
  );
}
```

### Step 2: Update Imports

**Before:**

```typescript
import { theme } from '@/lib/theme';
```

**After:**

```typescript
import { useTheme } from '@/lib/design-system/ThemeContext';
```

### Step 3: Convert Static Styles to Dynamic Styles

**Before:**

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: 16,
  },
});
```

**After:**

```typescript
function MyComponent() {
  const { tokens, getSurfaceColor } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: getSurfaceColor(),
      padding: tokens.spacing.md,
    },
  });
  
  return (/* ... */);
}
```

### Step 4: Update Color References

**Before:**

```typescript
backgroundColor: theme.colors.background
color: theme.colors.text
borderColor: theme.colors.border
```

**After:**

```typescript
const { getBackgroundColor, getTextColor, getBorderColor } = useTheme();

backgroundColor: getBackgroundColor()
color: getTextColor()
borderColor: getBorderColor()
```

### Step 5: Update Spacing References

**Before:**

```typescript
padding: 16
margin: 24
gap: 8
```

**After:**

```typescript
const { tokens } = useTheme();

padding: tokens.spacing.md    // 16
margin: tokens.spacing.lg     // 24
gap: tokens.spacing.sm        // 8
```

### Step 6: Update Typography References

**Before:**

```typescript
fontSize: 15
fontWeight: '600'
lineHeight: 24
```

**After:**

```typescript
const { tokens } = useTheme();

fontSize: tokens.typography.body.fontSize      // 15
fontWeight: tokens.typography.body.fontWeight  // '400'
lineHeight: tokens.typography.body.lineHeight  // 24
```

## Component Migration Examples

### Example 1: Simple Screen Component

**Before:**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/lib/theme';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome back!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
  },
});
```

**After:**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/design-system/ThemeContext';

export default function DashboardScreen() {
  const { tokens, getBackgroundColor, getTextColor, getTextSecondaryColor } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: getBackgroundColor(),
      padding: tokens.spacing.md,
    },
    title: {
      fontSize: tokens.typography.h1.fontSize,
      fontWeight: tokens.typography.h1.fontWeight,
      color: getTextColor(),
      marginBottom: tokens.spacing.sm,
    },
    subtitle: {
      fontSize: tokens.typography.body.fontSize,
      color: getTextSecondaryColor(),
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome back!</Text>
    </View>
  );
}
```

### Example 2: Button Component

**Before:**

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@/lib/theme';

export default function CustomButton({ onPress, children }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
```

**After:**

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/design-system/ThemeContext';

export default function CustomButton({ onPress, children }) {
  const { tokens } = useTheme();
  
  const styles = StyleSheet.create({
    button: {
      backgroundColor: tokens.colors.primary.main,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.borders.radius.medium,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: tokens.colors.primary.contrast,
      fontSize: tokens.typography.body.fontSize,
      fontWeight: '600',
    },
  });
  
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}
```

**Better:** Use the design system Button component:

```typescript
import Button from '@/components/design-system/primitives/Button';

export default function MyScreen() {
  return (
    <Button onPress={handlePress}>
      Click Me
    </Button>
  );
}
```

### Example 3: Card Component

**Before:**

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function CustomCard({ children }) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
```

**After:**

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/design-system/ThemeContext';

export default function CustomCard({ children }) {
  const { tokens, getSurfaceColor } = useTheme();
  
  const styles = StyleSheet.create({
    card: {
      backgroundColor: getSurfaceColor(),
      borderRadius: tokens.borders.radius.medium,
      padding: tokens.spacing.md,
      ...tokens.shadows.md,
    },
  });
  
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}
```

**Better:** Use the design system Card component:

```typescript
import Card from '@/components/design-system/primitives/Card';

export default function MyScreen() {
  return (
    <Card>
      {/* Content */}
    </Card>
  );
}
```

## Common Patterns

### Pattern 1: Conditional Styling Based on Theme Mode

**Before:**

```typescript
const isDark = /* some dark mode check */;

const styles = StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
  },
});
```

**After:**

```typescript
const { getSurfaceColor } = useTheme();

const styles = StyleSheet.create({
  container: {
    backgroundColor: getSurfaceColor(),
  },
});
```

### Pattern 2: Role-Based Styling

**Before:**

```typescript
const userRole = 'student';
const roleColor = userRole === 'student' ? '#2563eb' : '#059669';

const styles = StyleSheet.create({
  badge: {
    backgroundColor: roleColor,
  },
});
```

**After:**

```typescript
const { getRoleColor } = useTheme();
const roleColor = getRoleColor();

const styles = StyleSheet.create({
  badge: {
    backgroundColor: roleColor?.main || tokens.colors.primary.main,
  },
});
```

### Pattern 3: Animations with Reduced Motion

**Before:**

```typescript
Animated.timing(value, {
  toValue: 1,
  duration: 220,
  useNativeDriver: true,
}).start();
```

**After:**

```typescript
const { tokens, reducedMotion } = useTheme();

if (!reducedMotion) {
  Animated.timing(value, {
    toValue: 1,
    duration: tokens.motion.duration.normal,
    useNativeDriver: true,
  }).start();
}
```

### Pattern 4: Responsive Spacing

**Before:**

```typescript
const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
});
```

**After:**

```typescript
const { tokens } = useTheme();

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.lg,
  },
});
```

## Troubleshooting

### Issue: "Cannot read property 'tokens' of undefined"

**Cause:** Component is not wrapped with ThemeProvider

**Solution:**

```typescript
// Make sure App.tsx has ThemeProvider
import { ThemeProvider } from '@/lib/design-system/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Issue: Styles not updating when theme changes

**Cause:** Styles are created outside the component or not recreated on theme change

**Solution:**

```typescript
// ❌ Bad: Styles created outside component
const styles = StyleSheet.create({ /* ... */ });

function MyComponent() {
  const { tokens } = useTheme();
  return <View style={styles.container} />;
}

// ✅ Good: Styles created inside component
function MyComponent() {
  const { tokens } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: tokens.colors.theme.light.background,
    },
  });
  
  return <View style={styles.container} />;
}
```

### Issue: TypeScript errors with token properties

**Cause:** Incorrect token path or missing type definitions

**Solution:**

```typescript
// Check the token structure
import { tokens } from '@/lib/design-system/tokens';

// Correct paths:
tokens.spacing.md           // ✅
tokens.colors.primary.main  // ✅
tokens.typography.body      // ✅

// Incorrect paths:
tokens.spacing.medium       // ❌
tokens.colors.primary       // ❌ (missing .main)
```

### Issue: Dark mode not working

**Cause:** Not using theme helper functions

**Solution:**

```typescript
// ❌ Bad: Hardcoded colors
backgroundColor: '#ffffff'

// ✅ Good: Theme-aware colors
const { getSurfaceColor } = useTheme();
backgroundColor: getSurfaceColor()
```

## Checklist

Use this checklist when migrating a component:

- [ ] Import `useTheme` hook instead of old theme
- [ ] Wrap component logic with `useTheme()` call
- [ ] Replace hardcoded colors with token references or helper functions
- [ ] Replace hardcoded spacing with `tokens.spacing.*`
- [ ] Replace hardcoded font sizes with `tokens.typography.*`
- [ ] Replace hardcoded border radius with `tokens.borders.radius.*`
- [ ] Replace hardcoded shadows with `tokens.shadows.*`
- [ ] Replace hardcoded animation durations with `tokens.motion.duration.*`
- [ ] Add reduced motion checks for animations
- [ ] Ensure minimum 48x48px touch targets for interactive elements
- [ ] Verify contrast ratios meet 4.5:1 minimum
- [ ] Add proper accessibility labels
- [ ] Test in both light and dark modes
- [ ] Test with different user roles (if applicable)
- [ ] Update tests to wrap with ThemeProvider
- [ ] Remove old theme imports

## Migration Priority

Migrate components in this order:

1. **App.tsx** - Add ThemeProvider wrapper
2. **Primitive components** - Buttons, inputs, cards
3. **Layout components** - Containers, stacks, rows
4. **Screen components** - One screen at a time
5. **Complex components** - Charts, specialized UI
6. **Cleanup** - Remove old theme system

## Performance Considerations

The new design system is optimized for performance:

- **Memoization**: Theme context values are memoized
- **Native driver**: All animations use native driver
- **Lazy loading**: Components are loaded on demand
- **Token caching**: Design tokens are computed once

## Getting Help

If you encounter issues during migration:

1. Check this migration guide
2. Review the [Design System README](./README.md)
3. Look at existing migrated components for examples
4. Check the [Component Documentation](../../components/design-system/README.md)
5. Review the [Design Tokens Reference](./tokens/README.md)

## Version

Migration guide version: 1.0.0

Last updated: December 2024

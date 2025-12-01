# Screen Refactoring Guide

## Quick Reference for Refactoring Screens

### 1. Update Imports

**Remove:**
```typescript
import { TextInput, Button, Card, Title, Paragraph, IconButton } from 'react-native-paper';
import { colors, spacing, typography, shadows } from '../lib/theme';
```

**Add:**
```typescript
import { Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../lib/design-system/ThemeContext';
import Button from '../components/design-system/primitives/Button';
import Input from '../components/design-system/primitives/Input';
import Card from '../components/design-system/primitives/Card';
import { Stack, Row } from '../components/design-system/layout';
import { Ionicons } from '@expo/vector-icons';
```

### 2. Add Theme Hook

```typescript
export default function MyScreen() {
  const { tokens, getTextColor, getSurfaceColor, getRoleColor } = useTheme();
  
  // ... rest of component
}
```

### 3. Move StyleSheet Inside Component

**Before:**
```typescript
export default function MyScreen() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
});
```

**After:**
```typescript
export default function MyScreen() {
  const { tokens, getTextColor } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      padding: tokens.spacing.md,
      backgroundColor: getSurfaceColor(),
    },
  });
  
  return <View style={styles.container} />;
}
```

### 4. Replace Components

#### TextInput → Input
```typescript
// Before
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  mode="outlined"
  error={!!errors.email}
/>

// After
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
/>
```

#### Button
```typescript
// Before
<Button mode="contained" onPress={handleSubmit}>
  Submit
</Button>

// After
<Button variant="primary" onPress={handleSubmit}>
  Submit
</Button>
```

#### Card
```typescript
// Before
<Card>
  <Card.Content>
    <Title>Heading</Title>
    <Paragraph>Text</Paragraph>
  </Card.Content>
</Card>

// After
<Card variant="glassmorphic">
  <View style={{ padding: tokens.spacing.md }}>
    <Text style={styles.heading}>Heading</Text>
    <Text style={styles.body}>Text</Text>
  </View>
</Card>
```

#### Title/Paragraph → Text
```typescript
// Before
<Title style={styles.title}>Heading</Title>
<Paragraph style={styles.text}>Body text</Paragraph>

// After
<Text style={styles.title}>Heading</Text>
<Text style={styles.body}>Body text</Text>
```

#### IconButton → Ionicons
```typescript
// Before
<IconButton icon="check" size={24} iconColor="#4f46e5" />

// After
<Ionicons name="checkmark" size={24} color={tokens.colors.primary.main} />
```

### 5. Replace Style Values

#### Spacing
```typescript
// Before
padding: 16,
margin: 24,
gap: 8,

// After
padding: tokens.spacing.md,
margin: tokens.spacing.lg,
gap: tokens.spacing.sm,
```

#### Typography
```typescript
// Before
fontSize: 18,
fontWeight: '600',
lineHeight: 24,

// After
fontSize: tokens.typography.h3.fontSize,
fontWeight: tokens.typography.h3.fontWeight,
lineHeight: tokens.typography.h3.lineHeight,
```

#### Colors
```typescript
// Before
color: '#333',
backgroundColor: '#fff',
borderColor: '#ccc',

// After
color: getTextColor(),
backgroundColor: getSurfaceColor(),
borderColor: tokens.colors.neutral.gray300,
```

#### Border Radius
```typescript
// Before
borderRadius: 8,
borderRadius: 12,
borderRadius: 9999,

// After
borderRadius: tokens.borders.radius.small,
borderRadius: tokens.borders.radius.medium,
borderRadius: tokens.borders.radius.full,
```

#### Shadows
```typescript
// Before
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3,

// After
...tokens.shadows.md,
```

### 6. Common Patterns

#### Feature Card with Icon
```typescript
<TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
  <Card variant="glassmorphic">
    <View style={styles.cardContent}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={tokens.colors.neutral.gray400} />
    </View>
  </Card>
</TouchableOpacity>
```

#### Stat Widget
```typescript
<Card variant="glassmorphic">
  <View style={styles.statContent}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
</Card>
```

#### Form with Stack
```typescript
<Stack spacing="md">
  <Input label="Name" value={name} onChangeText={setName} />
  <Input label="Email" value={email} onChangeText={setEmail} />
  <Button variant="primary" onPress={handleSubmit}>
    Submit
  </Button>
</Stack>
```

#### Row Layout
```typescript
<Row spacing="sm" align="center" justify="space-between">
  <Text style={styles.label}>Label</Text>
  <Text style={styles.value}>Value</Text>
</Row>
```

### 7. Complete Example

**Before:**
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { colors, spacing, typography } from '../lib/theme';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Welcome</Title>
          <Paragraph>This is a sample screen</Paragraph>
          <Button mode="contained" onPress={() => {}}>
            Get Started
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
});
```

**After:**
```typescript
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../lib/design-system/ThemeContext';
import Card from '../components/design-system/primitives/Card';
import Button from '../components/design-system/primitives/Button';
import { Stack } from '../components/design-system/layout';

export default function MyScreen() {
  const { tokens, getSurfaceColor, getTextColor } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: tokens.spacing.md,
      backgroundColor: tokens.colors.theme.light.background,
    },
    title: {
      fontSize: tokens.typography.h2.fontSize,
      fontWeight: tokens.typography.h2.fontWeight,
      color: getTextColor(),
      marginBottom: tokens.spacing.sm,
    },
    body: {
      fontSize: tokens.typography.body.fontSize,
      color: tokens.colors.neutral.gray600,
      marginBottom: tokens.spacing.md,
    },
  });
  
  return (
    <View style={styles.container}>
      <Card variant="glassmorphic">
        <View style={{ padding: tokens.spacing.md }}>
          <Stack spacing="md">
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.body}>This is a sample screen</Text>
            <Button variant="primary" onPress={() => {}}>
              Get Started
            </Button>
          </Stack>
        </View>
      </Card>
    </View>
  );
}
```

### 8. Icon Name Mapping

Common react-native-paper icons to Ionicons:

| Paper Icon | Ionicons Name |
|------------|---------------|
| `check` | `checkmark` |
| `close` | `close` |
| `chevron-right` | `chevron-forward` |
| `chevron-left` | `chevron-back` |
| `account` | `person` |
| `account-group` | `people` |
| `calendar` | `calendar` |
| `clock` | `time` |
| `email` | `mail` |
| `phone` | `call` |
| `home` | `home` |
| `settings` | `settings` |
| `logout` | `log-out` |
| `delete` | `trash` |
| `edit` | `create` |
| `plus` | `add` |
| `minus` | `remove` |
| `eye` | `eye` |
| `eye-off` | `eye-off` |

### 9. Checklist for Each Screen

- [ ] Import useTheme hook
- [ ] Import design system components
- [ ] Move StyleSheet inside component
- [ ] Replace all hardcoded spacing with tokens
- [ ] Replace all hardcoded colors with theme functions
- [ ] Replace all hardcoded typography with tokens
- [ ] Replace react-native-paper components
- [ ] Replace icon components
- [ ] Test on both light and dark mode
- [ ] Verify accessibility (48x48px touch targets)
- [ ] Check for TypeScript errors
- [ ] Test functionality

### 10. Common Gotchas

1. **StyleSheet must be inside component** to access theme hook
2. **Don't forget TouchableOpacity** when replacing Button with custom cards
3. **Icon names are different** between react-native-paper and Ionicons
4. **Card.Content is removed** - use View with padding instead
5. **Title/Paragraph are removed** - use Text with appropriate styles
6. **Mode prop changes** - `mode="contained"` becomes `variant="primary"`
7. **Error handling** - Input component expects error string, not boolean

### 11. Testing After Refactoring

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Run diagnostics
# Use getDiagnostics tool in Kiro

# Test on device/simulator
npm start
```

### 12. Performance Tips

- Use `StyleSheet.create` for style caching
- Memoize expensive computations with `useMemo`
- Use `useCallback` for event handlers passed to children
- Avoid inline styles when possible
- Use `useNativeDriver: true` for animations

### 13. Accessibility Checklist

- [ ] All interactive elements have 48x48px minimum touch target
- [ ] Text has 4.5:1 contrast ratio minimum
- [ ] All buttons have accessibility labels
- [ ] Form inputs have proper labels
- [ ] Error messages are announced to screen readers
- [ ] Focus indicators are visible
- [ ] Reduced motion is respected

This guide should help you refactor any screen in the project consistently!

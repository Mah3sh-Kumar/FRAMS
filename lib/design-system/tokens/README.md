# Design Tokens Reference

Complete reference for all design tokens in the FRAMS design system.

## Table of Contents

- [Colors](#colors)
- [Spacing](#spacing)
- [Typography](#typography)
- [Shadows](#shadows)
- [Motion](#motion)
- [Borders](#borders)

## Colors

### Primary Colors

Indigo-based primary color palette:

```typescript
tokens.colors.primary = {
  main: '#4f46e5',      // Primary indigo
  light: '#818cf8',     // Lighter variant
  dark: '#3730a3',      // Darker variant
  gradient: ['#4f46e5', '#3730a3'],  // Primary gradient
  contrast: '#ffffff',  // Text color on primary background
}
```

**Usage:**
- Primary actions (buttons, links)
- Focus states
- Active navigation items
- Brand elements

### Accent Colors

Cyan-based accent color palette:

```typescript
tokens.colors.accent = {
  main: '#06b6d4',      // Accent cyan
  light: '#22d3ee',     // Lighter variant
  dark: '#0891b2',      // Darker variant
  gradient: ['#06b6d4', '#0891b2'],  // Accent gradient
  contrast: '#ffffff',  // Text color on accent background
}
```

**Usage:**
- Secondary actions
- Highlights
- Interactive elements
- Decorative accents

### Status Colors

#### Success (Green)

```typescript
tokens.colors.success = {
  main: '#16a34a',
  light: '#22c55e',
  dark: '#15803d',
  gradient: ['#16a34a', '#15803d'],
  contrast: '#ffffff',
}
```

**Usage:** Success messages, positive feedback, completed states

#### Error (Red)

```typescript
tokens.colors.error = {
  main: '#dc2626',
  light: '#ef4444',
  dark: '#b91c1c',
  gradient: ['#dc2626', '#b91c1c'],
  contrast: '#ffffff',
}
```

**Usage:** Error messages, destructive actions, validation errors

#### Warning (Yellow)

```typescript
tokens.colors.warning = {
  main: '#facc15',
  light: '#fde047',
  dark: '#eab308',
  gradient: ['#facc15', '#eab308'],
  contrast: '#000000',
}
```

**Usage:** Warning messages, caution states, pending actions

#### Info (Blue)

```typescript
tokens.colors.info = {
  main: '#3b82f6',
  light: '#60a5fa',
  dark: '#2563eb',
  gradient: ['#3b82f6', '#2563eb'],
  contrast: '#ffffff',
}
```

**Usage:** Informational messages, tips, neutral notifications

### Role Colors

#### Student (Blue)

```typescript
tokens.colors.roles.student = {
  main: '#2563eb',
  light: '#3b82f6',
  dark: '#1e40af',
  gradient: ['#2563eb', '#1e40af'],
  contrast: '#ffffff',
}
```

**Usage:** Student-specific UI elements, student dashboard, student badges

#### Teacher (Green)

```typescript
tokens.colors.roles.teacher = {
  main: '#059669',
  light: '#10b981',
  dark: '#065f46',
  gradient: ['#059669', '#065f46'],
  contrast: '#ffffff',
}
```

**Usage:** Teacher-specific UI elements, teacher dashboard, teacher badges

#### Admin (Purple)

```typescript
tokens.colors.roles.admin = {
  main: '#7c3aed',
  light: '#8b5cf6',
  dark: '#5b21b6',
  gradient: ['#7c3aed', '#5b21b6'],
  contrast: '#ffffff',
}
```

**Usage:** Admin-specific UI elements, admin dashboard, admin badges

### Neutral Colors

Grayscale palette for backgrounds, borders, and text:

```typescript
tokens.colors.neutral = {
  white: '#ffffff',
  black: '#000000',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
}
```

**Usage:**
- Backgrounds and surfaces
- Borders and dividers
- Disabled states
- Secondary text

### Theme Colors

#### Light Mode

```typescript
tokens.colors.theme.light = {
  background: '#f8fafc',    // Main background
  surface: '#ffffff',       // Card/panel background
  text: '#0f172a',          // Primary text
  textSecondary: '#64748b', // Secondary text
  border: '#e2e8f0',        // Borders and dividers
}
```

#### Dark Mode

```typescript
tokens.colors.theme.dark = {
  background: '#0f172a',    // Main background
  surface: '#1e293b',       // Card/panel background
  text: '#f1f5f9',          // Primary text
  textSecondary: '#94a3b8', // Secondary text
  border: '#334155',        // Borders and dividers
}
```

## Spacing

Based on an 8pt grid system (base unit: 4px):

```typescript
tokens.spacing = {
  xs: 4,      // Extra small - tight spacing, icon margins
  sm: 8,      // Small - compact layouts, small gaps
  md: 16,     // Medium - default padding, standard gaps
  lg: 24,     // Large - section spacing, generous padding
  xl: 32,     // Extra large - major sections, large gaps
  xxl: 48,    // Extra extra large - page sections, hero spacing
}
```

### Usage Examples

```typescript
// Component padding
paddingHorizontal: tokens.spacing.md,  // 16px
paddingVertical: tokens.spacing.sm,    // 8px

// Margins between elements
marginBottom: tokens.spacing.lg,       // 24px

// Icon spacing
marginRight: tokens.spacing.xs,        // 4px

// Section gaps
gap: tokens.spacing.xl,                // 32px
```

### Spacing Scale Rationale

- **xs (4px)**: Minimal spacing for tight layouts
- **sm (8px)**: Base grid unit, compact spacing
- **md (16px)**: Default spacing, comfortable reading
- **lg (24px)**: Section separation, visual breathing room
- **xl (32px)**: Major sections, clear hierarchy
- **xxl (48px)**: Page-level spacing, hero sections

## Typography

### Font Scale

```typescript
tokens.typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: 0,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
}
```

### Usage Examples

```typescript
// Display text (hero, large headings)
<Text style={{
  fontSize: tokens.typography.display.fontSize,
  lineHeight: tokens.typography.display.lineHeight,
  fontWeight: tokens.typography.display.fontWeight,
}}>
  Welcome to FRAMS
</Text>

// Primary heading
<Text style={{
  fontSize: tokens.typography.h1.fontSize,
  fontWeight: tokens.typography.h1.fontWeight,
}}>
  Dashboard
</Text>

// Body text
<Text style={{
  fontSize: tokens.typography.body.fontSize,
  lineHeight: tokens.typography.body.lineHeight,
}}>
  Regular paragraph text
</Text>

// Caption/small text
<Text style={{
  fontSize: tokens.typography.caption.fontSize,
  color: tokens.colors.neutral.gray500,
}}>
  Last updated 2 hours ago
</Text>
```

### Font Weights

```typescript
tokens.fontWeights = {
  regular: '400',   // Body text, captions
  medium: '500',    // Emphasized text
  semibold: '600',  // Subheadings, buttons
  bold: '700',      // Headings, strong emphasis
}
```

### Typography Guidelines

- **Display**: Hero text, splash screens, large announcements
- **H1**: Page titles, primary headings
- **H2**: Section headings, card titles
- **H3**: Subsection headings, list headers
- **Body**: Paragraphs, descriptions, general content
- **Caption**: Labels, timestamps, metadata, helper text

## Shadows

Elevation system with three levels:

### Small Shadow

```typescript
tokens.shadows.sm = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
}
```

**Usage:** Subtle elevation, glassmorphic elements, minimal depth

### Medium Shadow

```typescript
tokens.shadows.md = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
}
```

**Usage:** Cards, panels, default elevation, floating elements

### Large Shadow

```typescript
tokens.shadows.lg = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 16,
  elevation: 6,
}
```

**Usage:** Modals, popovers, elevated cards, important elements

### Usage Example

```typescript
const cardStyle = {
  backgroundColor: tokens.colors.theme.light.surface,
  borderRadius: tokens.borders.radius.medium,
  ...tokens.shadows.md,  // Spread shadow properties
}
```

## Motion

Animation timing and easing tokens:

### Duration

```typescript
tokens.motion.duration = {
  fast: 120,      // Quick interactions (button press)
  normal: 220,    // Standard animations (card hover)
  slow: 350,      // Page transitions, complex animations
}
```

### Easing

```typescript
tokens.motion.easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Material Design standard easing
}
```

### Transforms

```typescript
tokens.motion.transforms = {
  cardHover: 'scale(1.02)',     // Subtle scale up for cards
  buttonPress: 'scale(0.96)',   // Scale down for button press
}
```

### Usage Example

```typescript
import { Animated } from 'react-native';

const scaleAnim = useRef(new Animated.Value(1)).current;

const handlePress = () => {
  Animated.timing(scaleAnim, {
    toValue: 0.96,
    duration: tokens.motion.duration.fast,
    easing: Animated.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: true,
  }).start();
};
```

### Animation Guidelines

- **Fast (120ms)**: Button presses, quick feedback
- **Normal (220ms)**: Card hovers, standard interactions
- **Slow (350ms)**: Page transitions, complex animations
- Always use `useNativeDriver: true` for transform/opacity
- Check `reducedMotion` before applying animations

## Borders

### Border Radius

```typescript
tokens.borders.radius = {
  small: 8,       // Small elements, chips, badges
  medium: 14,     // Buttons, inputs, cards
  large: 20,      // Large cards, modals
  full: 9999,     // Circular elements, pills
}
```

### Border Width

```typescript
tokens.borders.width = {
  thin: 1,        // Default borders, dividers
  medium: 2,      // Emphasized borders, focus states
  thick: 4,       // Strong emphasis, decorative borders
}
```

### Usage Examples

```typescript
// Button
const buttonStyle = {
  borderRadius: tokens.borders.radius.medium,  // 14px
  borderWidth: tokens.borders.width.thin,      // 1px
}

// Card
const cardStyle = {
  borderRadius: tokens.borders.radius.medium,  // 14px
}

// Badge
const badgeStyle = {
  borderRadius: tokens.borders.radius.small,   // 8px
}

// Avatar
const avatarStyle = {
  borderRadius: tokens.borders.radius.full,    // Circular
}
```

## Token Usage Best Practices

### Do's ✅

1. **Always reference tokens** instead of hardcoding values
2. **Use semantic names** (e.g., `tokens.spacing.md` not `16`)
3. **Maintain consistency** by using the same token for similar purposes
4. **Compose styles** using multiple tokens
5. **Document custom values** if you must deviate from tokens

### Don'ts ❌

1. **Don't hardcode colors** - use `tokens.colors.*`
2. **Don't hardcode spacing** - use `tokens.spacing.*`
3. **Don't create custom shadows** - use `tokens.shadows.*`
4. **Don't use arbitrary font sizes** - use `tokens.typography.*`
5. **Don't skip tokens** for "just this one case"

### Example: Good vs Bad

❌ **Bad** (hardcoded values):

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  text: {
    fontSize: 15,
    color: '#0f172a',
  },
});
```

✅ **Good** (using tokens):

```typescript
import { useTheme } from '@/lib/design-system/ThemeContext';

function MyComponent() {
  const { tokens, getSurfaceColor, getTextColor } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: getSurfaceColor(),
      padding: tokens.spacing.md,
      borderRadius: tokens.borders.radius.medium,
      ...tokens.shadows.md,
    },
    text: {
      fontSize: tokens.typography.body.fontSize,
      color: getTextColor(),
    },
  });
  
  return (/* ... */);
}
```

## Extending Tokens

If you need to add new tokens:

1. **Add to the appropriate token file** (`colors.ts`, `spacing.ts`, etc.)
2. **Update TypeScript interfaces** to include new tokens
3. **Document the new token** in this README
4. **Update tests** to validate the new token
5. **Communicate changes** to the team

### Example: Adding a New Color

```typescript
// In colors.ts
export const colors = {
  // ... existing colors
  tertiary: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    gradient: ['#f59e0b', '#d97706'],
    contrast: '#ffffff',
  },
};
```

## Version History

- **1.0.0** (December 2024): Initial design system release
  - Complete token system
  - Light/dark mode support
  - Role-based theming
  - Accessibility compliance

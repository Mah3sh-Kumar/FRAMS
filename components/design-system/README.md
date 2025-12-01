# Component Library

Comprehensive documentation for all FRAMS design system components.

## Table of Contents

- [Primitives](#primitives)
  - [Button](#button)
  - [Card](#card)
  - [Input](#input)
- [Feedback](#feedback)
  - [Toast](#toast)
  - [LoadingSpinner](#loadingspinner)
- [Navigation](#navigation)
  - [TabBar](#tabbar)
- [Attendance](#attendance)
  - [FaceCaptureFrame](#facecaptureframe)
  - [AttendanceActionButton](#attendanceactionbutton)
  - [StudentProfileCard](#studentprofilecard)
- [Analytics](#analytics)
  - [GlassmorphicWidget](#glassmorphicwidget)
  - [HeatmapChart](#heatmapchart)
  - [ProgressRing](#progressring)
- [Layout](#layout)
  - [Container](#container)
  - [Stack](#stack)
  - [Row](#row)

---

## Primitives

Core building blocks for the UI.

### Button

A versatile button component with multiple variants, sizes, and states.

#### Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}
```

#### Variants

- **primary**: Gradient background, white text (default)
- **secondary**: Gray background, dark text
- **danger**: Red background, white text
- **ghost**: Transparent background, primary border and text

#### Sizes

- **small**: 40px height, 12px font
- **medium**: 48px height, 15px font (default)
- **large**: 56px height, 18px font

#### Examples

```typescript
import Button from '@/components/design-system/primitives/Button';

// Primary button
<Button onPress={handleSubmit}>
  Submit
</Button>

// Secondary button with icon
<Button variant="secondary" icon={<Icon name="save" />} onPress={handleSave}>
  Save Draft
</Button>

// Danger button
<Button variant="danger" onPress={handleDelete}>
  Delete
</Button>

// Loading state
<Button loading onPress={handleSubmit}>
  Submitting...
</Button>

// Disabled state
<Button disabled onPress={handleSubmit}>
  Submit
</Button>

// Ghost button (outline)
<Button variant="ghost" onPress={handleCancel}>
  Cancel
</Button>

// Small size
<Button size="small" onPress={handleAction}>
  Quick Action
</Button>
```

#### Accessibility

- Minimum 48x48px touch target
- Press animation (scale 0.96)
- Respects reduced motion
- Proper accessibility labels
- Disabled state prevents interaction

---

### Card

A flexible card component with variants and optional gradient header.

#### Props

```typescript
interface CardProps {
  variant?: 'default' | 'glassmorphic' | 'elevated';
  headerGradient?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}
```

#### Variants

- **default**: Standard card with surface color and medium shadow
- **glassmorphic**: Translucent background with blur effect
- **elevated**: Higher shadow for emphasis

#### Examples

```typescript
import Card from '@/components/design-system/primitives/Card';

// Default card
<Card>
  <Text>Card content</Text>
</Card>

// Card with gradient header
<Card headerGradient>
  <Text>Card with role-colored header strip</Text>
</Card>

// Interactive card
<Card onPress={handleCardPress}>
  <Text>Tap me!</Text>
</Card>

// Glassmorphic card
<Card variant="glassmorphic">
  <Text>Translucent card with blur</Text>
</Card>

// Elevated card
<Card variant="elevated">
  <Text>Card with large shadow</Text>
</Card>
```

#### Features

- 16px border radius
- Optional 6px gradient header strip
- Press animation (scale 1.02) when interactive
- Respects reduced motion
- Role-based gradient colors

---

### Input

A text input component with label, error support, and focus states.

#### Props

```typescript
interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}
```

#### Examples

```typescript
import Input from '@/components/design-system/primitives/Input';

// Basic input
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
/>

// Input with error
<Input
  label="Password"
  value={password}
  onChangeText={setPassword}
  error="Password must be at least 8 characters"
  secureTextEntry
/>

// Input with icon
<Input
  label="Search"
  value={search}
  onChangeText={setSearch}
  icon={<Icon name="search" />}
/>

// Disabled input
<Input
  label="Username"
  value={username}
  onChangeText={setUsername}
  disabled
/>
```

#### Features

- 52px height
- Indigo focus ring with glow effect
- Error state with red border
- Icon support
- Secure text entry for passwords
- Visible focus indicators

---

## Feedback

Components for user feedback and loading states.

### Toast

A notification component for success, error, warning, and info messages.

#### Props

```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onDismiss: () => void;
  haptic?: boolean;
}
```

#### Examples

```typescript
import Toast from '@/components/design-system/feedback/Toast';
import { ToastProvider, useToast } from '@/components/design-system/feedback/ToastProvider';

// Wrap your app with ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// Use toast in components
function MyComponent() {
  const { showToast } = useToast();
  
  const handleSuccess = () => {
    showToast({
      type: 'success',
      message: 'Operation completed successfully!',
      duration: 3000,
    });
  };
  
  const handleError = () => {
    showToast({
      type: 'error',
      message: 'Something went wrong',
      duration: 5000,
    });
  };
  
  return (/* ... */);
}
```

#### Features

- Auto-dismiss after duration (default 3000ms)
- Shake animation for errors
- Haptic feedback support
- Top positioning
- Color-coded by type

---

### LoadingSpinner

A loading indicator with skeleton shimmer animation.

#### Props

```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}
```

#### Examples

```typescript
import LoadingSpinner from '@/components/design-system/feedback/LoadingSpinner';

// Default spinner
<LoadingSpinner />

// Small spinner
<LoadingSpinner size="small" />

// Custom color
<LoadingSpinner color="#4f46e5" />

// Loading state in button
<Button loading onPress={handleSubmit}>
  Submitting...
</Button>
```

#### Features

- Skeleton shimmer animation
- Size variants
- Uses native driver for smooth animation
- Respects reduced motion

---

## Navigation

Navigation components for app structure.

### TabBar

A bottom navigation bar with floating effect and active tab highlight.

#### Props

```typescript
interface TabBarProps {
  tabs: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (key: string) => void;
}
```

#### Examples

```typescript
import TabBar from '@/components/design-system/navigation/TabBar';

const tabs = [
  { key: 'home', label: 'Home', icon: <Icon name="home" /> },
  { key: 'attendance', label: 'Attendance', icon: <Icon name="check" /> },
  { key: 'profile', label: 'Profile', icon: <Icon name="user" /> },
];

<TabBar
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

#### Features

- 72px height
- Floating effect with shadow
- Active tab highlight pill
- Smooth tab switching animation
- Role-based active color

---

## Attendance

Specialized components for attendance workflows.

### FaceCaptureFrame

An animated frame around the face capture zone with status feedback.

#### Props

```typescript
interface FaceCaptureFrameProps {
  status: 'idle' | 'recognized' | 'unknown' | 'lowLight';
  message?: string;
  children?: React.ReactNode;
}
```

#### Examples

```typescript
import FaceCaptureFrame from '@/components/design-system/attendance/FaceCaptureFrame';

// Idle state
<FaceCaptureFrame status="idle" message="Position your face in the frame">
  <Camera />
</FaceCaptureFrame>

// Recognized state
<FaceCaptureFrame status="recognized" message="Face recognized!">
  <Camera />
</FaceCaptureFrame>

// Unknown state
<FaceCaptureFrame status="unknown" message="Face not recognized">
  <Camera />
</FaceCaptureFrame>

// Low light state
<FaceCaptureFrame status="lowLight" message="Please move to better lighting">
  <Camera />
</FaceCaptureFrame>
```

#### Features

- Color-coded borders (green: recognized, red: unknown, amber: low light)
- Animated frame
- Real-time feedback messages
- Wraps camera component

---

### AttendanceActionButton

A circular action button with gradient glow and pulse animation.

#### Props

```typescript
interface AttendanceActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}
```

#### Examples

```typescript
import AttendanceActionButton from '@/components/design-system/attendance/AttendanceActionButton';

<AttendanceActionButton
  onPress={handleCapture}
  icon={<Icon name="camera" />}
/>

<AttendanceActionButton
  onPress={handleCapture}
  icon={<Icon name="camera" />}
  disabled={!ready}
/>
```

#### Features

- 72px circular button
- Gradient glow effect
- Pulse animation
- Role-based gradient colors

---

### StudentProfileCard

A student profile card with avatar, status badge, and attendance stats.

#### Props

```typescript
interface StudentProfileCardProps {
  student: {
    name: string;
    avatar?: string;
    status: 'present' | 'absent' | 'late';
    attendanceRate: number;
  };
  onPress?: () => void;
}
```

#### Examples

```typescript
import StudentProfileCard from '@/components/design-system/attendance/StudentProfileCard';

<StudentProfileCard
  student={{
    name: 'John Doe',
    avatar: 'https://...',
    status: 'present',
    attendanceRate: 95,
  }}
  onPress={handleStudentPress}
/>
```

#### Features

- Avatar circle display
- Status badge (present/absent/late)
- Attendance stats micro chart
- Interactive with press handler

---

## Analytics

Dashboard and analytics components.

### GlassmorphicWidget

A translucent widget with blur effect for analytics displays.

#### Props

```typescript
interface GlassmorphicWidgetProps {
  children: React.ReactNode;
  style?: ViewStyle;
}
```

#### Examples

```typescript
import GlassmorphicWidget from '@/components/design-system/analytics/GlassmorphicWidget';

<GlassmorphicWidget>
  <Text>Total Students: 150</Text>
  <Text>Present Today: 142</Text>
</GlassmorphicWidget>
```

#### Features

- Translucent background
- Blur effect
- Elevation system
- Modern glassmorphic styling

---

### HeatmapChart

A weekly attendance heatmap visualization.

#### Props

```typescript
interface HeatmapChartProps {
  data: Array<{
    day: string;
    value: number;
  }>;
}
```

#### Examples

```typescript
import HeatmapChart from '@/components/design-system/analytics/HeatmapChart';

const weeklyData = [
  { day: 'Mon', value: 95 },
  { day: 'Tue', value: 92 },
  { day: 'Wed', value: 88 },
  { day: 'Thu', value: 94 },
  { day: 'Fri', value: 90 },
];

<HeatmapChart data={weeklyData} />
```

#### Features

- Weekly attendance visualization
- Color-coded by attendance rate
- Responsive layout
- Empty state handling

---

### ProgressRing

A circular progress indicator with gradient fill.

#### Props

```typescript
interface ProgressRingProps {
  progress: number;  // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
}
```

#### Examples

```typescript
import ProgressRing from '@/components/design-system/analytics/ProgressRing';

// Default progress ring
<ProgressRing progress={75} />

// Custom size and color
<ProgressRing
  progress={90}
  size={120}
  strokeWidth={8}
  color="#16a34a"
/>

// Animated progress
const [progress, setProgress] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setProgress(p => Math.min(p + 1, 100));
  }, 50);
  return () => clearInterval(timer);
}, []);

<ProgressRing progress={progress} />
```

#### Features

- Circular progress visualization
- Gradient fill
- Animated progress updates
- Customizable size and color

---

## Layout

Layout and spacing components.

### Container

A max-width container with horizontal padding.

#### Props

```typescript
interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}
```

#### Examples

```typescript
import { Container } from '@/components/design-system/layout';

<Container>
  <Text>Centered content with padding</Text>
</Container>
```

---

### Stack

A vertical spacing component for consistent gaps between children.

#### Props

```typescript
interface StackProps {
  spacing?: keyof typeof tokens.spacing;
  children: React.ReactNode;
  style?: ViewStyle;
}
```

#### Examples

```typescript
import { Stack } from '@/components/design-system/layout';

<Stack spacing="md">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</Stack>

<Stack spacing="lg">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
</Stack>
```

---

### Row

A horizontal layout component with optional spacing.

#### Props

```typescript
interface RowProps {
  spacing?: keyof typeof tokens.spacing;
  align?: 'flex-start' | 'center' | 'flex-end';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  children: React.ReactNode;
  style?: ViewStyle;
}
```

#### Examples

```typescript
import { Row } from '@/components/design-system/layout';

<Row spacing="sm" align="center">
  <Icon name="user" />
  <Text>John Doe</Text>
</Row>

<Row justify="space-between">
  <Text>Label</Text>
  <Text>Value</Text>
</Row>
```

---

## Component Composition

Components are designed to be composed together:

```typescript
import Card from '@/components/design-system/primitives/Card';
import Button from '@/components/design-system/primitives/Button';
import { Stack } from '@/components/design-system/layout';

<Card headerGradient>
  <Stack spacing="md">
    <Text style={{ fontSize: tokens.typography.h2.fontSize }}>
      Welcome Back
    </Text>
    <Text style={{ color: tokens.colors.neutral.gray600 }}>
      Ready to take attendance?
    </Text>
    <Button onPress={handleStart}>
      Get Started
    </Button>
  </Stack>
</Card>
```

## Testing Components

All components include comprehensive tests:

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

## Best Practices

1. **Always wrap with ThemeProvider** to access theme context
2. **Use design tokens** for custom styling
3. **Compose components** instead of creating new ones
4. **Test accessibility** with screen readers
5. **Verify touch targets** meet 48x48px minimum
6. **Check reduced motion** for animations
7. **Add proper labels** for accessibility

## Version

Current version: 1.0.0

Last updated: December 2024

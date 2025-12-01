# Analytics Components

Specialized components for analytics dashboards and data visualization with glassmorphic styling.

## Components

### GlassmorphicWidget

A widget component with glassmorphic styling featuring translucent backgrounds, blur effects, and elevation system.

**Props:**
- `children`: React.ReactNode - Widget content
- `style?`: ViewStyle - Optional custom style
- `testID?`: string - Optional test ID
- `elevation?`: 'sm' | 'md' | 'lg' - Elevation level (default: 'md')

**Usage:**
```tsx
import { GlassmorphicWidget } from '@/components/design-system/analytics';

<GlassmorphicWidget elevation="lg">
  <Text>Analytics Content</Text>
</GlassmorphicWidget>
```

**Features:**
- Glassmorphic styling with translucent background (70% opacity)
- Simulated blur effect with translucent backgrounds
- Elevation system (sm, md, lg)
- Border radius: 20px (large token)
- Padding: 24px (lg token)
- Automatic theme adaptation (light/dark mode)

**Requirements:**
- 8.1: Glassmorphic styling with translucent backgrounds and blur effects
- 8.4: Elevation system for visual hierarchy

### HeatmapChart

A weekly attendance heatmap visualization component that displays attendance data in a color-coded grid format.

**Props:**
- `data`: HeatmapDataPoint[] - Array of data points to display
- `weeks?`: number - Number of weeks to display (default: 4)
- `style?`: ViewStyle - Optional custom style
- `testID?`: string - Optional test ID
- `showDayLabels?`: boolean - Show day labels (default: true)
- `showWeekLabels?`: boolean - Show week labels (default: false)

**Data Structure:**
```typescript
interface HeatmapDataPoint {
  day: number;        // Day of week (0-6, where 0 is Sunday)
  week: number;       // Week number (0-based index)
  value: number;      // Attendance value (0-100)
  label?: string;     // Optional label for the cell
}
```

**Usage:**
```tsx
import { HeatmapChart } from '@/components/design-system/analytics';

const attendanceData = [
  { day: 0, week: 0, value: 95 },
  { day: 1, week: 0, value: 88 },
  { day: 2, week: 0, value: 92 },
  // ... more data points
];

<HeatmapChart 
  data={attendanceData} 
  weeks={4}
  showDayLabels={true}
/>
```

**Features:**
- Color-coded cells based on attendance percentage:
  - 90-100%: Success green
  - 75-89%: Light success green
  - 60-74%: Warning yellow
  - 40-59%: Light warning yellow
  - 1-39%: Error red
  - 0%: Gray (empty)
- Responsive layout with design tokens
- Cell size: 32px
- Cell gap: 4px (xs token)
- Border radius: 8px (small token)
- Empty state handling
- Day labels (S, M, T, W, T, F, S)
- Automatic theme adaptation (light/dark mode)

**Requirements:**
- 8.2: Weekly attendance data heatmap visualization

### ProgressRing

A circular progress ring with gradient fill and animated progress updates for displaying progress metrics and completion rates.

**Props:**
- `progress`: number - Progress value (0-100)
- `size?`: number - Ring size in pixels (default: 120)
- `strokeWidth?`: number - Ring stroke width (default: 12)
- `showPercentage?`: boolean - Show percentage text in center (default: true)
- `label?`: string - Optional label below percentage
- `style?`: ViewStyle - Optional custom style
- `testID?`: string - Optional test ID
- `gradientColors?`: [string, string] - Gradient colors (defaults to primary gradient)

**Usage:**
```tsx
import { ProgressRing } from '@/components/design-system/analytics';

<ProgressRing 
  progress={75} 
  label="Completion"
  size={120}
/>

// With custom gradient
<ProgressRing 
  progress={85} 
  gradientColors={['#ff0000', '#00ff00']}
  label="Custom Progress"
/>
```

**Features:**
- Circular progress ring with gradient fill
- Animated progress updates (350ms duration)
- Percentage display in center (scales with ring size)
- Optional label below percentage
- Customizable size and stroke width
- Progress value clamping (0-100)
- Automatic theme adaptation (light/dark mode)
- Design tokens for colors and motion

**Requirements:**
- 8.3: Circular progress rings with gradient fills
